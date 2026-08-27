/**
 * Sales index — domain types, per-tab config, and mock data.
 *
 * Row shape and per-tab field config are transcribed from the Sales Advanced
 * Filter PRD (2026-07-27) and its companion HTML prototype, which is itself
 * built in the Purchase visual/interaction language — see docs/patterns/AdvancedFilter.md.
 */

export type TabKey = "quotation" | "order" | "delivery" | "invoice";

// Matches the real Sales index's tab order (Invoice first/default).
export const TAB_ORDER: TabKey[] = ["invoice", "delivery", "order", "quotation"];

export interface TabConfig {
  key: TabKey;
  label: string;
  /** null => no document sub-type selector on this tab (Rule 13 doesn't apply). */
  docTypes: string[] | null;
  statuses: string[];
  /** Field-presence flags — false only for Quotation. */
  dueDate: boolean;
  warehouse: boolean;
  /** Mock transaction-number prefix, e.g. "Sales Invoice". */
  prefix: string;
}

export const TAB_CONFIG: Record<TabKey, TabConfig> = {
  quotation: {
    key: "quotation",
    label: "Quotation",
    docTypes: null,
    statuses: ["Open", "Closed"],
    dueDate: false,
    warehouse: false,
    prefix: "Sales Quote"
  },
  order: {
    key: "order",
    label: "Order",
    docTypes: ["Order", "Proforma Order"],
    statuses: ["Open", "Partially sent", "Closed"],
    dueDate: true,
    warehouse: true,
    prefix: "Sales Order"
  },
  delivery: {
    key: "delivery",
    label: "Delivery",
    docTypes: null,
    statuses: ["Open", "Closed"],
    dueDate: true,
    warehouse: true,
    prefix: "Sales Delivery"
  },
  invoice: {
    key: "invoice",
    label: "Invoice",
    docTypes: ["Invoice", "Proforma Invoice", "Join Invoice"],
    statuses: ["Open", "Overdue", "Paid", "Partially paid", "Unpaid"],
    dueDate: true,
    warehouse: true,
    prefix: "Sales Invoice"
  }
};

// Weighted status pools per tab so mock data skews realistically (more
// Unpaid/Open than Paid/Closed) rather than a flat random pick.
const STATUS_WEIGHTS: Record<TabKey, string[]> = {
  quotation: ["Open", "Open", "Open", "Closed"],
  order: ["Open", "Open", "Partially sent", "Closed"],
  delivery: ["Open", "Open", "Closed"],
  invoice: ["Unpaid", "Unpaid", "Overdue", "Overdue", "Open", "Paid", "Paid", "Partially paid"]
};

export type KeywordColumn = "all" | "number" | "customer" | "ref" | "product" | "memo" | "message";

export const COLUMN_OPTIONS: { value: KeywordColumn; label: string }[] = [
  { value: "all", label: "All column" },
  { value: "number", label: "Transaction number" },
  { value: "customer", label: "Customer" },
  { value: "ref", label: "Customer reference number" },
  { value: "product", label: "Product name" },
  { value: "memo", label: "Memo" },
  { value: "message", label: "Message" }
];

export const WAREHOUSES: string[] = [
  "Gudang Jakarta Pusat",
  "Gudang Jakarta Utara",
  "Gudang Tangerang",
  "Gudang Bekasi",
  "Gudang Bandung",
  "Gudang Semarang",
  "Gudang Surabaya",
  "Gudang Denpasar",
  "Gudang Medan",
  "Gudang Makassar",
  "Gudang Palembang",
  "Gudang Balikpapan"
];

export const TAGS: string[] = [
  "MEKARI_POS",
  "tiktok",
  "destyPos",
  "Cash",
  "Test Desty Sales",
  "Shopee",
  "Tokopedia",
  "Reseller",
  "Retail"
];

const CUSTOMERS = [
  "PT Sumber Makmur Sejahtera",
  "CV Cahaya Abadi",
  "Toko Berkah Jaya",
  "PT Multi Sarana Teknik",
  "Ardito S.",
  "Dummy Disty Pratiwi",
  "alex-test222",
  "PT Karya Mandiri",
  "Trial 1"
];

const PRODUCTS = [
  "Besi Beton 10mm",
  "Plat Baja 3mm",
  "Pipa PVC 4 inch",
  "Semen Portland",
  "Cat Tembok 25kg",
  "Kabel NYA 2.5mm",
  "Keramik 60x60",
  "Kayu Meranti"
];

const MEMOS = ["Termin 30 hari", "Pengiriman bertahap", "Barang titipan", "Retur sebagian", ""];
const MESSAGES = ["Mohon konfirmasi penerimaan", "Faktur pajak menyusul", "", ""];

export interface SalesRow {
  id: number;
  /** ISO yyyy-mm-dd. */
  date: string;
  /** ISO yyyy-mm-dd, or null when the tab has no due date (Quotation). */
  due: string | null;
  number: string;
  customer: string;
  ref: string;
  products: string[];
  memo: string;
  message: string;
  status: string;
  balance: number;
  total: number;
  warehouse: string | null;
  tags: string[];
  docType: string | null;
}

export type AmountMode = "more" | "less" | "between";

export interface SalesFilterState {
  keyword: string;
  column: KeywordColumn;
  txFrom: string;
  txTo: string;
  dueFrom: string;
  dueTo: string;
  status: string;
  balMode: AmountMode;
  balA: string;
  balB: string;
  totMode: AmountMode;
  totA: string;
  totB: string;
  warehouses: string[];
  tags: string[];
  tagMode: "all" | "any";
}

// Deterministic seeded PRNG (mulberry32) so the mock dataset is stable across
// reloads — mirrors the prototype's own rng(seed) approach rather than the
// generic index-template.vue convention of hand-authored literal arrays,
// which would be impractical at the row volume needed to exercise pagination
// and every filterable dimension across 4 tabs.
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateSalesRows(cfg: TabConfig, seed: number, count: number): SalesRow[] {
  const rand = mulberry32(seed);
  const statusPool = STATUS_WEIGHTS[cfg.key];
  const today = new Date();
  const rows: SalesRow[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 120);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    let due: string | null = null;
    if (cfg.dueDate) {
      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + 7 + Math.floor(rand() * 38));
      due = toIso(dueDate);
    }

    const status = pick(rand, statusPool);
    const total = Math.round((rand() * 95_000_000 + 80_000) / 1000) * 1000;
    let balance: number;
    if (status === "Paid" || status === "Closed") balance = 0;
    else if (status === "Partially paid" || status === "Partially sent") {
      balance = Math.round((total * 0.4) / 1000) * 1000;
    } else balance = total;

    const tagCount = Math.floor(rand() * 4);
    const tags: string[] = [];
    for (let t = 0; t < tagCount; t++) {
      const tag = pick(rand, TAGS);
      if (!tags.includes(tag)) tags.push(tag);
    }

    const productCount = 1 + Math.floor(rand() * 3);
    const products: string[] = [];
    for (let p = 0; p < productCount; p++) products.push(pick(rand, PRODUCTS));

    rows.push({
      id: i + 1,
      date: toIso(date),
      due,
      number: `${cfg.prefix} #${10000 + i}`,
      customer: pick(rand, CUSTOMERS),
      ref: `REF/2026/${String(1000 + Math.floor(rand() * 9000))}`,
      products,
      memo: pick(rand, MEMOS),
      message: pick(rand, MESSAGES),
      status,
      balance,
      total,
      warehouse: cfg.warehouse ? pick(rand, WAREHOUSES) : null,
      tags,
      docType: cfg.docTypes ? pick(rand, cfg.docTypes) : null
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

// Distinct seeds per tab so the 4 datasets don't happen to line up.
export const SALES_ROWS: Record<TabKey, SalesRow[]> = {
  quotation: generateSalesRows(TAB_CONFIG.quotation, 11, 34),
  order: generateSalesRows(TAB_CONFIG.order, 23, 42),
  delivery: generateSalesRows(TAB_CONFIG.delivery, 37, 30),
  invoice: generateSalesRows(TAB_CONFIG.invoice, 53, 58)
};
