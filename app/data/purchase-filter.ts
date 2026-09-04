// The purchase list's advanced filter — its shape, its defaults, and the one
// function that decides whether a row survives it.
//
// Ported from jurnal-frontend-app src/pages/purchases/components/advance-search
// plus the DefaultFilter / ColumnList / AmountType constants it reads from
// src/pages/purchases/constants/index.ts.
//
// It lives here, beside the data it filters, rather than inside either the
// list page or the drawer component, because BOTH need it and they need to
// agree exactly: the drawer edits a draft of this object, the page applies the
// committed one. A predicate duplicated across the two would drift the first
// time a field was added.

/** Which single column a keyword is matched against. "" means every column. */
export type SearchColumn =
  | ""
  | "number"
  | "vendor"
  | "warehouse"
  | "referenceNo"
  | "product"
  | "memo"
  | "message";

/** How an amount range is expressed. `bt` uses both bounds; `gt`/`lt` one each. */
export type AmountMode = "gt" | "bt" | "lt";

export const COLUMN_OPTIONS: { value: SearchColumn; label: string }[] = [
  { value: "", label: "All column" },
  { value: "number", label: "Transaction number" },
  { value: "vendor", label: "Vendor" },
  { value: "warehouse", label: "Warehouse" },
  { value: "referenceNo", label: "Vendor ref. no." },
  { value: "product", label: "Product name" },
  { value: "memo", label: "Memo" },
  { value: "message", label: "Message" }
];

export const AMOUNT_MODES: { value: AmountMode; label: string }[] = [
  { value: "gt", label: "More than" },
  { value: "bt", label: "In between" },
  { value: "lt", label: "Less than" }
];

export interface PurchaseFilter {
  /** Keyword. Shared with the list's own search box — the two are one value,
   *  which is why the drawer seeds it from the page and hands it back. */
  key: string;
  searchColumn: SearchColumn;
  /** All four dates are DD/MM/YYYY, the format MpDatePicker emits. */
  startDate: string;
  endDate: string;
  dueDateStart: string;
  dueDateEnd: string;
  /** "" is "all statuses" (the source uses the sentinel string "all"). */
  status: string;
  remainingMode: AmountMode;
  remainingGt: number;
  remainingLt: number;
  totalMode: AmountMode;
  totalGt: number;
  totalLt: number;
  tags: string[];
  /** `and` = must carry every selected tag; `or` = any one of them. */
  tagsLogic: "and" | "or";
}

export function emptyPurchaseFilter(): PurchaseFilter {
  return {
    key: "",
    searchColumn: "",
    startDate: "",
    endDate: "",
    dueDateStart: "",
    dueDateEnd: "",
    status: "",
    remainingMode: "gt",
    remainingGt: 0,
    remainingLt: 0,
    totalMode: "gt",
    totalGt: 0,
    totalLt: 0,
    tags: [],
    tagsLogic: "and"
  };
}

/** Whether anything is set — drives the dot on the list's Filter button. */
export function isFilterActive(f: PurchaseFilter): boolean {
  return Boolean(
    f.key ||
    f.searchColumn ||
    f.startDate ||
    f.endDate ||
    f.dueDateStart ||
    f.dueDateEnd ||
    f.status ||
    f.remainingGt ||
    f.remainingLt ||
    f.totalGt ||
    f.totalLt ||
    f.tags.length
  );
}

/** The subset of a list row this predicate reads. The list page's `Row` type
 *  satisfies it structurally, so nothing has to be mapped at the call site. */
export interface FilterableRow {
  number: string;
  vendor: string;
  warehouse: string;
  referenceNo: string;
  products: string[];
  memo: string;
  message: string;
  transactionDateSort: string;
  dueDateSort: string;
  status: string;
  balanceDue: number;
  totalAmount: number;
  tags: string[];
}

/** DD/MM/YYYY → YYYY-MM-DD, so a typed date compares against the `*Sort`
 *  fields as a plain string. Returns "" for anything unparseable, which the
 *  callers treat as "no bound". */
function dmyToIso(dmy: string): string {
  const parts = String(dmy ?? "").split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function withinDateRange(value: string, from: string, to: string): boolean {
  const start = dmyToIso(from);
  const end = dmyToIso(to);
  if (start && (!value || value < start)) return false;
  if (end && (!value || value > end)) return false;
  return true;
}

/** A bound of 0 means "not set" — the source zeroes the unused bound on apply
 *  rather than carrying a null, and 0 is never a meaningful purchase amount. */
function withinAmountRange(value: number, mode: AmountMode, gt: number, lt: number): boolean {
  if ((mode === "gt" || mode === "bt") && gt && value < gt) return false;
  if ((mode === "lt" || mode === "bt") && lt && value > lt) return false;
  return true;
}

function matchesKeyword(row: FilterableRow, key: string, column: SearchColumn): boolean {
  const term = key.trim().toLowerCase();
  if (!term) return true;
  const has = (text: string) => text.toLowerCase().includes(term);
  switch (column) {
    case "number":
      return has(row.number);
    case "vendor":
      return has(row.vendor);
    case "warehouse":
      return has(row.warehouse);
    case "referenceNo":
      return has(row.referenceNo);
    case "product":
      return row.products.some(has);
    case "memo":
      return has(row.memo);
    case "message":
      return has(row.message);
    default:
      // "All column" searches everything the named columns cover, plus tags —
      // the list's own search box has always matched tags, and narrowing that
      // when the drawer opens would be a silent regression.
      return (
        has(row.number) ||
        has(row.vendor) ||
        has(row.warehouse) ||
        has(row.referenceNo) ||
        row.products.some(has) ||
        has(row.memo) ||
        has(row.message) ||
        row.tags.some(has)
      );
  }
}

export function matchesPurchaseFilter(row: FilterableRow, f: PurchaseFilter): boolean {
  if (!matchesKeyword(row, f.key, f.searchColumn)) return false;
  if (!withinDateRange(row.transactionDateSort, f.startDate, f.endDate)) return false;
  if (!withinDateRange(row.dueDateSort, f.dueDateStart, f.dueDateEnd)) return false;
  if (f.status && row.status !== f.status) return false;
  if (!withinAmountRange(row.balanceDue, f.remainingMode, f.remainingGt, f.remainingLt))
    return false;
  if (!withinAmountRange(row.totalAmount, f.totalMode, f.totalGt, f.totalLt)) return false;
  if (f.tags.length) {
    const matched =
      f.tagsLogic === "and"
        ? f.tags.every((t) => row.tags.includes(t))
        : f.tags.some((t) => row.tags.includes(t));
    if (!matched) return false;
  }
  return true;
}

/** The cross-field rule the source enforces: a "less than" total below a
 *  "more than" balance due can never match anything, since a transaction's
 *  total is always at least its outstanding balance. */
export function totalBelowBalanceDue(f: PurchaseFilter): boolean {
  return (
    f.remainingMode === "gt" && f.totalMode === "lt" && f.totalLt !== 0 && f.totalLt < f.remainingGt
  );
}
