/**
 * Purchase list report — the column layouts, period presets and row shape for
 * `app/pages/reports/purchases_list.vue`. Ported from `jurnal-frontend-app`
 * (`src/pages/reports/purchases_list/`).
 *
 * **The rows are not new mock data.** They are a projection of
 * [`purchase-transactions.ts`](./purchase-transactions.ts) — the same array the
 * Purchases module's list, detail and form pages read and write. A report over
 * a parallel fixture would drift from the module it reports on, and the money
 * and date formats would drift with it (see `docs/patterns/page-recipes.md`
 * § "one format per value type, per module"). Edit an invoice on
 * `/purchase/invoice/12` and this report shows the edited figure.
 *
 * **Ported, not copied.** Production reads
 * `api/v1/reports/purchases_list` with a saved `report_layout_id`, company
 * custom fields, tag logic (`and`/`or`), contact-group lookups, and a
 * server-rendered PDF/XLSX/CSV export. Here the layouts are three fixed column
 * sets, the filter runs in memory, and Export is a no-op that reports what it
 * would produce. Deliberately absent: custom fields, saved/editable templates
 * (production's Template popover links to a layout builder), the
 * export-limitation and unrealised-calculation banners, and Mixpanel tracking.
 */

import { PURCHASE_STATUS_LABEL, type PurchaseStatus } from "./purchase-status";
import {
  TRANSACTION_TYPE_LABEL,
  getPurchaseTransactions,
  parseLocalIsoDate,
  toLocalIsoDate,
  todayIsoDate,
  type TransactionType
} from "./purchase-transactions";

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

export interface ReportColumn {
  key: keyof PurchaseReportRow;
  label: string;
  labelId: string;
  /** Right-aligned, summed into the TOTAL footer row, rendered as money. */
  numeric?: boolean;
  /** Fixed px width — the table is `table-layout: fixed`, so this is
   *  authoritative and the container scrolls when the set is wide. */
  width: number;
}

/**
 * Every column the report can show. Labels are verbatim from production's
 * shared table dictionary (`src/components/table-reports/i18n.json` → `table`),
 * which is why they read as Title Case while the rest of the app is sentence
 * case — report column heads are their own vocabulary in the product.
 */
export const PURCHASE_REPORT_COLUMNS: ReportColumn[] = [
  { key: "date", label: "Date", labelId: "Tanggal", width: 120 },
  { key: "number", label: "Transaction No.", labelId: "No. Transaksi", width: 200 },
  { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 200 },
  { key: "referenceNo", label: "Reference No.", labelId: "No. Referensi", width: 140 },
  { key: "dueDate", label: "Due Date", labelId: "Jatuh Tempo", width: 120 },
  { key: "status", label: "Status", labelId: "Status", width: 130 },
  { key: "tags", label: "Tags", labelId: "Tag", width: 140 },
  { key: "memo", label: "Memo", labelId: "Memo", width: 220 },
  { key: "warehouse", label: "Warehouse", labelId: "Gudang", width: 160 },
  { key: "currency", label: "Currency", labelId: "Mata Uang", width: 100 },
  { key: "grossAmount", label: "Gross Amount", labelId: "Jumlah Kotor", numeric: true, width: 150 },
  {
    key: "discountAmount",
    label: "Discount Amount",
    labelId: "Jumlah Diskon",
    numeric: true,
    width: 150
  },
  { key: "taxAmount", label: "Tax Amount", labelId: "Jumlah Pajak", numeric: true, width: 140 },
  { key: "total", label: "Total", labelId: "Total", numeric: true, width: 150 },
  { key: "payment", label: "Payment", labelId: "Pembayaran", numeric: true, width: 150 },
  { key: "balanceDue", label: "Balance Due", labelId: "Sisa Tagihan", numeric: true, width: 150 }
];

const COLUMN_BY_KEY = new Map(PURCHASE_REPORT_COLUMNS.map((c) => [c.key, c]));

export function reportColumn(key: keyof PurchaseReportRow): ReportColumn {
  const column = COLUMN_BY_KEY.get(key);
  if (!column) throw new Error(`Unknown purchase report column: ${key}`);
  return column;
}

// ---------------------------------------------------------------------------
// Layouts (production's "templates")
// ---------------------------------------------------------------------------

export interface ReportLayout {
  id: string;
  name: string;
  nameId: string;
  columns: (keyof PurchaseReportRow)[];
}

/**
 * Production lets a company save any number of column layouts and edit them in
 * a builder at `/reports/purchases_list/custom_layouts/…`. With no backend to
 * persist one, this prototype ships three fixed sets — enough to show what
 * switching a template does to the table, which is the part worth prototyping.
 */
export const PURCHASE_REPORT_LAYOUTS: ReportLayout[] = [
  {
    id: "standard",
    name: "Standard",
    nameId: "Standar",
    columns: ["date", "number", "vendorName", "dueDate", "status", "total", "balanceDue"]
  },
  {
    id: "detailed",
    name: "Detailed",
    nameId: "Rinci",
    columns: [
      "date",
      "number",
      "vendorName",
      "referenceNo",
      "dueDate",
      "status",
      "tags",
      "grossAmount",
      "discountAmount",
      "taxAmount",
      "total",
      "payment",
      "balanceDue"
    ]
  },
  {
    id: "summary",
    name: "Summary",
    nameId: "Ringkas",
    columns: ["date", "number", "vendorName", "total"]
  }
];

// ---------------------------------------------------------------------------
// Period presets
// ---------------------------------------------------------------------------

export interface ReportPeriod {
  id: string;
  label: string;
  labelId: string;
  /** `null` for "Custom" — the two date fields stand on their own. */
  range: (() => { start: string; end: string }) | null;
}

/** "Today" is the fixture's today (2 Sep 2026), not the wall clock — the whole
 *  Purchases dataset is generated relative to it. */
function today(): Date {
  return parseLocalIsoDate(todayIsoDate());
}

function shift(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(d: Date): Date {
  // Monday-first, matching the Indonesian business week production assumes.
  const day = (d.getDay() + 6) % 7;
  return shift(d, -day);
}

function range(start: Date, end: Date) {
  return { start: toLocalIsoDate(start), end: toLocalIsoDate(end) };
}

/** The 11 presets from production's `PERIODS_RANGE`, in the same order. */
export const PURCHASE_REPORT_PERIODS: ReportPeriod[] = [
  { id: "today", label: "Today", labelId: "Hari ini", range: () => range(today(), today()) },
  {
    id: "this_week",
    label: "This week",
    labelId: "Minggu ini",
    range: () => range(startOfWeek(today()), shift(startOfWeek(today()), 6))
  },
  {
    id: "this_month",
    label: "This month",
    labelId: "Bulan ini",
    range: () => {
      const t = today();
      return range(
        new Date(t.getFullYear(), t.getMonth(), 1),
        new Date(t.getFullYear(), t.getMonth() + 1, 0)
      );
    }
  },
  {
    id: "this_quarter",
    label: "This quarter",
    labelId: "Kuartal ini",
    range: () => {
      const t = today();
      const q = Math.floor(t.getMonth() / 3);
      return range(new Date(t.getFullYear(), q * 3, 1), new Date(t.getFullYear(), q * 3 + 3, 0));
    }
  },
  {
    id: "this_year",
    label: "This year",
    labelId: "Tahun ini",
    range: () => {
      const t = today();
      return range(new Date(t.getFullYear(), 0, 1), new Date(t.getFullYear(), 11, 31));
    }
  },
  {
    id: "yesterday",
    label: "Yesterday",
    labelId: "Kemarin",
    range: () => range(shift(today(), -1), shift(today(), -1))
  },
  {
    id: "last_week",
    label: "Last week",
    labelId: "Minggu lalu",
    range: () => {
      const start = shift(startOfWeek(today()), -7);
      return range(start, shift(start, 6));
    }
  },
  {
    id: "last_month",
    label: "Last month",
    labelId: "Bulan lalu",
    range: () => {
      const t = today();
      return range(
        new Date(t.getFullYear(), t.getMonth() - 1, 1),
        new Date(t.getFullYear(), t.getMonth(), 0)
      );
    }
  },
  {
    id: "last_quarter",
    label: "Last quarter",
    labelId: "Kuartal lalu",
    range: () => {
      const t = today();
      const q = Math.floor(t.getMonth() / 3);
      return range(new Date(t.getFullYear(), (q - 1) * 3, 1), new Date(t.getFullYear(), q * 3, 0));
    }
  },
  {
    id: "last_year",
    label: "Last year",
    labelId: "Tahun lalu",
    range: () => {
      const t = today();
      return range(new Date(t.getFullYear() - 1, 0, 1), new Date(t.getFullYear() - 1, 11, 31));
    }
  },
  { id: "custom", label: "Custom", labelId: "Custom", range: null }
];

/**
 * Production defaults to "Today", because a real company books transactions
 * every day. This fixture holds 13 records per type spread over ~5 weeks, so
 * "Today" would return a single row and show nothing worth looking at —
 * default to the quarter that contains the whole set instead.
 */
export const DEFAULT_PERIOD_ID = "this_quarter";

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

/**
 * Production's transaction-type list is the seven *accounting* documents its
 * report API groups by, including two payment types this prototype doesn't
 * model. These are our own eight `TransactionType`s instead, so the filter can
 * only ever offer something the dataset actually contains.
 */
export const PURCHASE_REPORT_TYPE_OPTIONS: { value: TransactionType; label: string }[] = (
  Object.keys(TRANSACTION_TYPE_LABEL) as TransactionType[]
).map((value) => ({ value, label: TRANSACTION_TYPE_LABEL[value] }));

export const DEFAULT_TRANSACTION_TYPE: TransactionType = "invoice";

/** Production's "Date by" — which date the range filters against. */
export const DATE_BY_OPTIONS = [
  { value: "transaction_date", label: "Transaction date", labelId: "Tanggal transaksi" },
  { value: "due_date", label: "Due date", labelId: "Jatuh tempo" }
] as const;

export type DateBy = (typeof DATE_BY_OPTIONS)[number]["value"];

export const PURCHASE_REPORT_STATUS_OPTIONS = (
  Object.keys(PURCHASE_STATUS_LABEL) as PurchaseStatus[]
).map((value) => ({ value, label: PURCHASE_STATUS_LABEL[value] }));

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export interface PurchaseReportRow {
  id: number;
  /** ISO — the display string is produced at render time by `formatDisplayDate`. */
  date: string;
  number: string;
  vendorName: string;
  referenceNo: string;
  dueDate: string;
  status: PurchaseStatus;
  tags: string[];
  memo: string;
  warehouse: string;
  currency: string;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  payment: number;
  balanceDue: number;
}

/** Projects the shared Purchases dataset into report rows for one type. */
export function buildPurchaseReportRows(type: TransactionType): PurchaseReportRow[] {
  return getPurchaseTransactions()
    .filter((t) => t.type === type)
    .map((t) => ({
      id: t.id,
      date: t.transactionDateSort,
      number: t.number,
      vendorName: t.vendorName,
      referenceNo: t.referenceNo,
      dueDate: t.dueDateSort,
      status: t.status,
      tags: t.tags,
      memo: t.memo,
      warehouse: t.warehouse,
      currency: t.currency,
      // "Gross" is pre-discount, pre-tax — the report's own vocabulary, derived
      // here rather than stored, so it can't disagree with the transaction.
      grossAmount: t.subtotal + t.discountAmount + t.discountPerLines,
      discountAmount: t.discountAmount + t.discountPerLines,
      taxAmount: t.taxAmount,
      total: t.total,
      payment: t.amountReceived,
      balanceDue: t.balanceDue
    }));
}

/** Vendors present in the dataset — the drawer's vendor picker. */
export function purchaseReportVendors(): string[] {
  return [...new Set(getPurchaseTransactions().map((t) => t.vendorName))].sort();
}

/** Tags present in the dataset — the drawer's tag picker. */
export function purchaseReportTags(): string[] {
  return [...new Set(getPurchaseTransactions().flatMap((t) => t.tags))].sort();
}
