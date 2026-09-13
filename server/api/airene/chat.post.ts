import { AIRENE_KNOWLEDGE_CONTEXT } from "../../../app/data/airene-knowledge";
import { resolveAireneAnswer, type AireneAnswer } from "../../../app/data/airene-answers";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

interface AireneRequestBody {
  question?: string;
  history?: ChatTurn[];
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

const RESPONSE_SCHEMA = `{
  "title": "short answer title",
  "intro": "main answer in Bahasa Indonesia unless user asks English",
  "list": ["optional numbered points"],
  "chart": {
    "title": "optional short chart title",
    "items": [{"label": "metric label", "value": 100, "displayValue": "Rp100M"}]
  },
  "outro": "optional closing sentence",
  "links": [{"label": "optional source label", "url": "optional source url"}],
  "related": ["optional related follow-up questions"],
  "reasoning": ["3-5 short reasoning steps based only on supplied data"]
}`;

export default defineEventHandler(async (event) => {
  const body = await readBody<AireneRequestBody>(event);
  const question = body.question?.trim();

  if (!question) {
    throw createError({
      statusCode: 400,
      statusMessage: "Question is required"
    });
  }

  if (isOutOfDemoScope(question)) {
    return {
      answer: getOutOfScopeAnswer(),
      meta: {
        provider: "local-demo-scope"
      }
    };
  }

  const fallback = resolveAireneAnswer(question);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      answer: fallback,
      meta: {
        provider: "local-fallback",
        reason: "GEMINI_API_KEY is not configured"
      }
    };
  }

  try {
    const answer = await askGemini(question, body.history ?? [], apiKey);
    return {
      answer,
      meta: {
        provider: "gemini"
      }
    };
  } catch (error) {
    console.error("[airene] Gemini request failed", error);
    return {
      answer: fallback,
      meta: {
        provider: "local-fallback",
        reason: "Gemini request failed"
      }
    };
  }
});

async function askGemini(question: string, history: ChatTurn[], apiKey: string): Promise<AireneAnswer> {
  const modelCandidates = [
    process.env.GEMINI_MODEL,
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash"
  ].filter(Boolean) as string[];

  let lastError: unknown;

  for (const model of [...new Set(modelCandidates)]) {
    try {
      return await askGeminiModel(model, question, history, apiKey);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function askGeminiModel(
  model: string,
  question: string,
  history: ChatTurn[],
  apiKey: string
): Promise<AireneAnswer> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(question, history) }]
          }
        ],
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          maxOutputTokens: 1400,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              intro: { type: "STRING" },
              list: { type: "ARRAY", items: { type: "STRING" } },
              chart: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  items: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        label: { type: "STRING" },
                        value: { type: "NUMBER" },
                        displayValue: { type: "STRING" }
                      },
                      required: ["label", "value", "displayValue"]
                    }
                  }
                }
              },
              outro: { type: "STRING" },
              links: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    label: { type: "STRING" },
                    url: { type: "STRING" }
                  }
                }
              },
              related: { type: "ARRAY", items: { type: "STRING" } },
              reasoning: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["title", "intro", "reasoning"]
          }
        }
      })
    }
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini request failed for ${model}`);
  }

  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  const answer = normalizeAnswer(parseJsonAnswer(rawText));
  return enrichAnswerForDemo(sanitizeMalformedAnswer(answer, question), question);
}

function buildPrompt(question: string, history: ChatTurn[]) {
  const recentHistory = history
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "User" : "Airene"}: ${turn.text}`)
    .join("\n");

  return `
You are Airene, Mekari Jurnal's AI assistant for a conference demo.
Answer as a business investigation and decision-support assistant.

Rules:
- Use only the supplied knowledge context. Do not invent unsupported facts.
- If the user question is outside the Mekari Experience demo scenario, politely say Airene is currently focused on the September profit investigation demo and offer relevant follow-up questions.
- Answer in Bahasa Indonesia by default, with a concise executive tone.
- Start from FACT when relevant, then CALC when useful, then recommendation or next step.
- Label simulations explicitly as SIMULATION and list assumptions.
- If required data is missing, state the missing data.
- Do not present illustrative demo data as actual Sovlo performance.
- Keep "intro" to one short paragraph.
- Put every numbered/structured point in the "list" array. Do not write numbered points inside "intro" or "outro".
- Keep each list item concise enough to scan in a chat bubble.
- Include "chart" only when it materially helps the answer. Good chart candidates: August vs September revenue, gross margin, HPP/unit, production output, invoice quantity, or product margin. Use at most 4 chart items.
- Return only valid JSON matching this schema:
${RESPONSE_SCHEMA}

Knowledge context:
${AIRENE_KNOWLEDGE_CONTEXT}

Recent conversation:
${recentHistory || "(none)"}

User question:
${question}
`;
}

function isOutOfDemoScope(question: string) {
  const normalizedQuestion = question.toLowerCase();

  const inScopePattern =
    /profit|gross|margin|hpp|cogs|revenue|pendapatan|sales|order|invoice|demand|permintaan|stock|stok|inventory|fg|barang jadi|production|produksi|output|capacity|kapasitas|finishing|labou?r|tenaga kerja|overtime|lembur|daily worker|material|fabric|kain|vendor|supplier|cost|biaya|harga|produk|product|margin|action|tindakan|rekomendasi|prioritas|roi|what.?if|simulasi|september|agustus|jurnal|airene|mekari/i;

  const clearlyOffTopicPattern =
    /resep|masak|nasi goreng|cuaca|weather|presiden|president|politik|movie|film|lagu|song|musik|music|joke|cerita lucu|translate|terjemah|coding|programming|javascript|python|hotel|travel|tiket|crypto|bitcoin|saham|football|sepak bola/i;

  return clearlyOffTopicPattern.test(normalizedQuestion) && !inScopePattern.test(normalizedQuestion);
}

function getOutOfScopeAnswer(): AireneAnswer {
  return {
    title: "Airene fokus pada demo profit investigation",
    intro:
      "Untuk demo ini, Airene sedang difokuskan pada scenario investigasi penurunan profit September di Mekari Jurnal. Saya belum punya konteks yang cukup untuk menjawab pertanyaan itu secara akurat di sini.",
    list: [
      "Saya bisa bantu analisis profit, demand, revenue, invoice quantity, production output, stock availability, HPP, labour cost, material/vendor cost, dan rekomendasi tindakan.",
      "Coba mulai dari salah satu pertanyaan demo di bawah agar alurnya tetap sesuai scenario conference."
    ],
    related: [
      "Kenapa profit kita turun?",
      "Kenapa HPP per unit naik?",
      "Kenapa sales order tinggi tapi revenue turun?",
      "Apa tindakan paling impactful untuk meningkatkan profit?"
    ],
    reasoning: [
      "Pertanyaan tidak cocok dengan scope demo Mekari Experience.",
      "Airene diarahkan untuk menjaga jawaban tetap berada di scenario penurunan profit September.",
      "Memberikan follow-up question yang relevan agar user bisa kembali ke alur demo."
    ]
  };
}

function normalizeAnswer(value: Partial<AireneAnswer>): AireneAnswer {
  return {
    title: asString(value.title, "Airene answer"),
    intro: asString(value.intro, "Saya belum menemukan jawaban yang cukup aman dari data demo."),
    list: Array.isArray(value.list) ? value.list.map(String).filter(Boolean) : undefined,
    chart: normalizeChart(value.chart),
    outro: value.outro ? String(value.outro) : undefined,
    links: Array.isArray(value.links)
      ? value.links
          .map((link) => ({
            label: String(link.label || link.url || ""),
            url: String(link.url || "")
          }))
          .filter((link) => link.label && link.url)
      : undefined,
    related: Array.isArray(value.related) ? value.related.map(String).filter(Boolean) : undefined,
    reasoning: Array.isArray(value.reasoning)
      ? value.reasoning.map(String).filter(Boolean).slice(0, 5)
      : ["Matched the user question to the supplied Airene knowledge context."]
  };
}

function sanitizeMalformedAnswer(answer: AireneAnswer, question: string): AireneAnswer {
  if (answer.title !== "Airene answer" || !answer.intro.trim().startsWith("{")) {
    return answer;
  }

  if (/profit|gross|margin|hpp|berubah|signifikan|bulan lalu/i.test(question)) {
    return {
      title: "Penyebab Penurunan Profit September",
      intro:
        "Profit turun karena revenue melemah akibat keterbatasan pemenuhan stok, sementara HPP per unit naik dan menekan margin.",
      list: [
        "Demand tidak turun: Sales Order naik dari 925 unit di Agustus menjadi 950 unit di September.",
        "Pemenuhan turun: Invoice Qty turun dari 850 unit menjadi 630 unit karena FG Available hanya 700 unit.",
        "Biaya naik: HPP/unit meningkat dari Rp120K menjadi Rp145K, dipengaruhi material dan labour pressure.",
        "Gross Margin turun dari 28,7% menjadi 8,7%, sehingga Gross Profit turun dari Rp41M menjadi Rp8,65M."
      ],
      chart: getDemoChart(question),
      reasoning: [
        "Membandingkan KPI Agustus dan September dari knowledge base demo.",
        "Memisahkan demand signal dari fulfillment signal karena SO naik tapi invoice turun.",
        "Menghubungkan output produksi, FG Available, HPP/unit, dan Gross Margin."
      ]
    };
  }

  return {
    ...answer,
    intro: "Airene belum bisa menyusun jawaban yang rapi untuk pertanyaan ini. Coba pilih suggested question lain."
  };
}

function enrichAnswerForDemo(answer: AireneAnswer, question: string): AireneAnswer {
  if (answer.chart) return answer;
  const chart = getDemoChart(question);
  return chart ? { ...answer, chart } : answer;
}

function getDemoChart(question: string): AireneAnswer["chart"] | undefined {
  if (/profit|gross|margin|revenue|hpp|berubah|signifikan|bulan lalu/i.test(question)) {
    return {
      title: "Agustus vs September",
      items: [
        { label: "Revenue Aug", value: 143, displayValue: "Rp143M" },
        { label: "Revenue Sep", value: 100, displayValue: "Rp100M" },
        { label: "GP Aug", value: 41, displayValue: "Rp41M" },
        { label: "GP Sep", value: 8.65, displayValue: "Rp8.65M" }
      ]
    };
  }

  if (/output|production|produksi|fg|stock|stok/i.test(question)) {
    return {
      title: "Output & FG Available",
      items: [
        { label: "Output Aug", value: 1010, displayValue: "1,010 unit" },
        { label: "Output Sep", value: 700, displayValue: "700 unit" },
        { label: "FG Aug", value: 1025, displayValue: "1,025 unit" },
        { label: "FG Sep", value: 700, displayValue: "700 unit" }
      ]
    };
  }

  return undefined;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampText(value: string, fallback: string, maxLength: number) {
  return value.length <= maxLength ? value : fallback;
}

function normalizeChart(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const chart = value as Partial<AireneAnswer["chart"]>;
  if (!chart || !Array.isArray(chart.items)) return undefined;

  const items = chart.items
    .map((item) => ({
      label: String(item.label || ""),
      value: Number(item.value),
      displayValue: String(item.displayValue || item.value || "")
    }))
    .filter((item) => item.label && Number.isFinite(item.value) && item.displayValue)
    .slice(0, 4);

  if (!items.length) return undefined;

  return {
    title: clampText(asString(chart.title, "Key comparison"), "Key comparison", 48),
    items
  };
}

function parseJsonAnswer(rawText: string): Partial<AireneAnswer> {
  try {
    return normalizeParsedJson(JSON.parse(rawText));
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      return normalizeParsedJson(JSON.parse(match[0]));
    }

    return {
      title: "Airene answer",
      intro: rawText,
      reasoning: ["Gemini returned plain text, so the response was normalized for the chat UI."]
    };
  }
}

function normalizeParsedJson(value: unknown): Partial<AireneAnswer> {
  if (typeof value === "string") {
    return parseJsonAnswer(value);
  }

  if (value && typeof value === "object") {
    const answer = value as Partial<AireneAnswer>;
    if (
      typeof answer.intro === "string" &&
      answer.title === "Airene answer" &&
      answer.intro.trim().startsWith("{")
    ) {
      return parseJsonAnswer(answer.intro);
    }
    return answer;
  }

  return {};
}
