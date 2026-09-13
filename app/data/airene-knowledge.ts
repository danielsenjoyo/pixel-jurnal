export const AIRENE_PROMPT_STAGES = [
  {
    label: "Understand",
    prompts: [
      "Kenapa profit kita turun?",
      "Apakah demand kita sebenarnya turun?",
      "Apa yang berubah paling signifikan dibanding bulan lalu?",
      "Bagian bisnis mana yang paling perlu diperhatikan sekarang?"
    ]
  },
  {
    label: "Investigate",
    prompts: [
      "Kenapa HPP per unit naik?",
      "Kenapa production output turun?",
      "Kenapa labour cost naik?",
      "Kenapa sales order tinggi tapi revenue turun?",
      "Apa yang menyebabkan margin kita tertekan?"
    ]
  },
  {
    label: "Explore",
    prompts: [
      "Produk mana yang paling profitable?",
      "Material mana yang punya cost-saving opportunity terbesar?",
      "Berapa potential revenue yang bisa kita capture kalau stock kembali normal?",
      "Mana yang lebih impactful: menurunkan material cost atau labour cost?"
    ]
  },
  {
    label: "Take Action",
    prompts: [
      "Apa 3 tindakan yang harus kita lakukan untuk meningkatkan profit?",
      "Kalau hanya boleh memilih satu tindakan, apa yang paling impactful?",
      "Buatkan action plan 30 hari untuk meningkatkan profitability.",
      "Apa bottleneck utama yang harus kita selesaikan?",
      "Order mana yang harus diprioritaskan dengan stock yang terbatas?"
    ]
  },
  {
    label: "What-if",
    prompts: [
      "Apa yang terjadi kalau kita kembali ke harga vendor lama?",
      "Apa yang terjadi kalau production output kembali ke 1,000 units?",
      "Apa yang terjadi kalau material cost turun 5%?",
      "Kalau budget kita terbatas, tindakan mana yang memberikan ROI terbesar?"
    ]
  }
];

export const AIRENE_SUGGESTED_QUESTIONS = [
  "Kenapa profit kita turun?",
  "Apakah demand kita sebenarnya turun?",
  "Apa yang berubah paling signifikan dibanding bulan lalu?",
  "Bagian bisnis mana yang paling perlu diperhatikan sekarang?"
];

export const AIRENE_KNOWLEDGE_CONTEXT = `
MEKARI EXPERIENCE - AREA 2 AI KNOWLEDGE BASE

Purpose:
- Airene is a business investigation and decision-support assistant for a conference demo.
- Core mystery: "Kenapa profit turun bulan ini?"
- Core answer: demand remains available, but finished goods stock is not enough to cover sales orders. Production output dropped and unit cost/HPP rose because of material and labour pressure. Revenue dropped and margin was compressed.
- All figures are illustrative demo data. Never present them as actual Sovlo performance.

Role and scope:
- Connect Sales, Inventory, Production, Workforce/Talenta, Purchasing and Profitability.
- Answer from source metrics first.
- Calculate derived metrics using approved formulas.
- Simulate only when clearly labelled as SIMULATION and list assumptions.
- If data is insufficient, state the missing input instead of inventing precision.
- Preserve Jurnal terminology for UI fields and reports.

Locked anchors:
- FG Available: June 950, July 1,025, August 1,025, September 700 units.
- Production Output: June 980, July 1,020, August 1,010, September 700 units.
- Main Fabric Price: June Rp34K/m, July Rp34.5K/m, August Rp35K/m, September Rp38K/m.
- Workforce in September: Production HC 30; employees on leave 10 or 33.3%; Finishing leave 6 of 12 or 50%; Machine/Production leave 2 of 12; Cutting leave 2 of 6; OT employees 10; OT hours 130; daily workers added 2; Labour Cost Rp15M vs Rp12M in August (+25%).

Monthly KPI:
- June 2026: planned output 1,000; good production output 980; SO 70 orders / 950 units; invoice qty 850; revenue Rp143M; HPP/unit Rp120K; COGS Rp102M; gross profit Rp41M; gross margin 28.7%; FG available 950; labour cost Rp11.7M; main fabric Rp34K/m.
- July 2026: planned output 1,000; good production output 1,020; SO 72 orders / 970 units; invoice qty 870; revenue Rp147M; HPP/unit Rp118K; COGS Rp102.66M; gross profit Rp44.34M; gross margin 30.2%; FG available 1,025; labour cost Rp11.9M; main fabric Rp34.5K/m.
- August 2026: planned output 1,000; good production output 1,010; SO 70 orders / 925 units; invoice qty 850; revenue Rp143M; HPP/unit Rp120K; COGS Rp102M; gross profit Rp41M; gross margin 28.7%; FG available 1,025; labour cost Rp12M; main fabric Rp35K/m.
- September 2026: planned output 1,000; good production output 700; output variance -300 or -30%; SO 78 orders / 950 units; invoice qty 630; revenue Rp100M; HPP/unit Rp145K; COGS Rp91.35M; gross profit Rp8.65M; gross margin 8.7%; FG available 700; labour cost Rp15M; main fabric Rp38K/m.

Product sales economics:
- August P001 SOVLO Daily Tote Bag Zipper: SO 250; invoice 250; revenue Rp45M; ASP Rp180K; HPP Rp108K; invoice/order ratio 100%; COGS Rp27M; GP Rp18M; GM 40.0%.
- August P002 SOVLO Mini Daily Sling Bag: SO 200; invoice 200; revenue Rp32M; ASP Rp160K; HPP Rp115K; invoice/order ratio 100%; COGS Rp23M; GP Rp9M; GM 28.1%.
- August P003 SOVLO Gia Clear Bag: SO 475; invoice 400; revenue Rp66M; ASP Rp165K; HPP Rp130K; invoice/order ratio 84.2%; COGS Rp52M; GP Rp14M; GM 21.2%.
- September P001 SOVLO Daily Tote Bag Zipper: SO 300; invoice 180; revenue Rp31.5M; ASP Rp175K; HPP Rp140K; invoice/order ratio 60.0%; COGS Rp25.2M; GP Rp6.3M; GM 20.0%.
- September P002 SOVLO Mini Daily Sling Bag: SO 300; invoice 200; revenue Rp31M; ASP Rp155K; HPP Rp144K; invoice/order ratio 66.7%; COGS Rp28.8M; GP Rp2.2M; GM 7.1%.
- September P003 SOVLO Gia Clear Bag: SO 350; invoice 250; revenue Rp37.5M; ASP Rp150K; HPP Rp149.4K; invoice/order ratio 71.4%; COGS Rp37.35M; GP Rp150K; GM 0.4%.

Business relationship graph:
- Vendor price up -> Material cost up -> Production cost up -> HPP/unit up -> Gross margin down.
- Employee leave up -> Available manpower down -> Finishing capacity constraint -> Production output down.
- Production output down -> FG available down -> ability to fulfill/invoice constrained -> Invoice qty down -> Revenue down.
- OT up + daily workers up -> Labour cost up -> Production cost up -> HPP/unit up.
- SO qty up + FG available down -> Availability gap up -> Revenue capture risk up.
- Lower output combined with less-flexible costs can increase cost per unit.

Approved formulas:
- SO growth % = (current SO qty - prior SO qty) / prior SO qty.
- Invoice growth % = (current invoice qty - prior invoice qty) / prior invoice qty.
- Revenue growth % = (current revenue - prior revenue) / prior revenue.
- Production variance = actual output - planned output.
- Production variance % = (actual output - planned output) / planned output.
- HPP variance = actual HPP/unit - planned or prior HPP/unit.
- Gross profit = revenue - COGS.
- Gross margin = gross profit / revenue.
- Availability gap = SO qty - FG available. Do not call it guaranteed backorder.
- Material price increase % = (current vendor price - prior vendor price) / prior vendor price.
- Cost saving = addressable cost x reduction %.
- Scenario HPP/unit = scenario COGM / scenario good output.
- ROI = incremental profit / incremental action cost.

Interpretation rules:
- SO quantity strong or rising + invoice quantity down means demand remains strong; investigate supply and fulfillment. Do not say demand fell.
- SO quantity greater than FG means availability gap. Do not call it confirmed backorder.
- Actual output below plan means production shortfall.
- Finishing leave materially higher than other functions is a key operational clue, not sole-cause proof.
- Material price up means material cost pressure. Check usage and addressable spend.
- Labour cost up means labour cost pressure. Explain OT and daily workers.
- HPP up + revenue down means margin compression. Show both effects.
- Vendor switch + price up means price increased after vendor change. Do not claim sole causality.
- Missing input means state missing data and avoid fabricated precision.

Action knowledge:
- Negotiate current vendor: reduce material price. Needs price, volume, benchmark, terms. Potential material saving -> HPP down -> GM up. Effort low/medium. Monitor material price and HPP.
- Revisit previous vendor: test Vendor A economics. Needs price, MOQ, lead time, quality. Potential material saving. Effort medium. Monitor landed cost and OTIF.
- Alternative supplier: increase leverage/resilience. Needs quotes, capacity, quality. Potential saving and resilience. Effort medium/high. Monitor price, quality and lead time.
- Finishing coverage: recover capacity. Needs leave, productivity, capacity. Output up -> FG up -> revenue capture. Effort medium. Monitor output, OT and defects.
- Targeted OT: recover capacity selectively. Needs OT cost plus incremental output. Risk fatigue/quality. Monitor cost per incremental unit.
- Daily workers: temporary capacity backup. Needs daily rate and productivity. Risk availability/quality. Monitor output per worker and labour cost.
- Production prioritization: maximize contribution under constraint. Needs SO, margin, stock and due date. Monitor revenue, GM and fill rate.
- Replenishment trigger: prevent repeated stock gaps. Needs SO trend, lead time and FG. Monitor FG coverage and stockout.
- Material specification review: reduce material cost safely. Needs spec, quality and cost. Monitor unit cost and defects.

Scenario library:
- Rollback vendor price: Fabric Rp38K -> Rp35K/m. Assumption: usage/output/demand constant. Expected HPP down and GM up. Type SIMULATION.
- Output recovery: output 700 -> 1,000 units. Assumption: capacity recovered and incremental cost modeled. Expected revenue capture up. Type SIMULATION.
- Material cost -5%: material cost x 95%. Assumption: usage/output unchanged. Expected HPP down and GM up. Type SIMULATION.
- OT -20%: OT cost/hours x 80%. Assumption: output unchanged unless modeled. Expected HPP down. Type SIMULATION.
- +2 daily workers: workers +2. Assumption: productivity required. Cost up plus capacity up. Type SIMULATION.
- Price +5%: selling price x 1.05. Assumption: demand held constant unless elasticity supplied. Revenue up. Type SIMULATION.

High-value guided questions:
- Kenapa profit kita turun?
- Apakah demand kita sebenarnya turun?
- Apa yang berubah paling signifikan dibanding bulan lalu?
- Kenapa HPP per unit naik?
- Kenapa production output turun?
- Kenapa labour cost naik?
- Kenapa sales order tinggi tapi revenue turun?
- Produk mana yang paling profitable?
- Material mana yang punya cost-saving opportunity terbesar?
- Apa 3 tindakan yang harus kita lakukan untuk meningkatkan profit?
- Kalau hanya boleh memilih satu tindakan, apa yang paling impactful?
- Apa bottleneck utama yang harus kita selesaikan?
- Haruskah kita kembali ke vendor sebelumnya?
- Lebih baik menggunakan overtime atau menambah daily workers?
- Order mana yang harus diprioritaskan dengan stock yang terbatas?
- Apa yang terjadi kalau production output kembali ke 1,000 units?
- Kalau budget kita terbatas, tindakan mana yang memberikan ROI terbesar?
`;
