/**
 * Sales Advanced Filter — pure predicate/state functions.
 *
 * Ports the business rules from the Sales Advanced Filter PRD (2026-07-27)
 * and its reference HTML prototype's matches()/amtOk() functions. Kept as
 * plain functions (no ref/reactive) so a rule change happens once here
 * rather than in 4 duplicated per-tab implementations — see
 * docs/patterns/AdvancedFilter.md.
 */
import type {
  AmountMode,
  KeywordColumn,
  SalesFilterState,
  SalesRow,
  TabConfig
} from "~/data/sales";

/** Rule 10 — IDR integers, no decimals, no negatives. */
export function sanitizeAmountInput(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

/** Ports amtOk() verbatim: More/Less exclusive, In between inclusive both bounds. */
export function matchesAmountRange(value: number, mode: AmountMode, a: string, b: string): boolean {
  const A = a === "" ? null : Number(a);
  const B = b === "" ? null : Number(b);
  if (mode === "more") return A === null || value > A;
  if (mode === "less") return A === null || value < A;
  return (A === null || value >= A) && (B === null || value <= B);
}

/** Rule 2 — tag AND ("all") / OR ("any") combination. */
export function matchesTagFilter(
  rowTags: string[],
  selected: string[],
  mode: "all" | "any"
): boolean {
  if (!selected.length) return true;
  return mode === "all"
    ? selected.every((t) => rowTags.includes(t))
    : selected.some((t) => rowTags.includes(t));
}

/**
 * Rules 3-6: case-insensitive substring, trimmed, max 100 chars, one literal
 * string (not tokenized). A null/empty scoped field excludes the row for any
 * non-empty keyword. Product scope joins all line items so a match on any
 * one line counts once per document (dedup falls out of returning a
 * boolean rather than a per-line match count).
 */
export function matchesKeyword(row: SalesRow, column: KeywordColumn, rawKeyword: string): boolean {
  const q = rawKeyword.trim().slice(0, 100).toLowerCase();
  if (!q) return true;

  const fields: string[] =
    column === "all"
      ? [
          row.number,
          row.customer,
          row.ref,
          row.products.join(" "),
          row.memo,
          row.message,
          row.warehouse ?? ""
        ]
      : column === "product"
        ? [row.products.join(" ")]
        : [row[column] ?? ""];

  return fields.some((v) => String(v).toLowerCase().includes(q));
}

/** Rule 9 — end date must be on or after start date; either side empty is valid. */
export function isValidDateRange(from: string, to: string): boolean {
  if (!from || !to) return true;
  return to >= from;
}

/**
 * Rule 1 (AND across fields) + Rule 7 (inclusive date bounds). Gates
 * due-date/warehouse checks on the tab's field-presence flags, exactly like
 * the prototype's matches(row, f, cfg).
 */
export function matchesSalesFilter(
  row: SalesRow,
  f: SalesFilterState,
  cfg: Pick<TabConfig, "dueDate" | "warehouse">
): boolean {
  if (!matchesKeyword(row, f.column, f.keyword)) return false;
  if (f.txFrom && row.date < f.txFrom) return false;
  if (f.txTo && row.date > f.txTo) return false;
  if (cfg.dueDate) {
    const due = row.due ?? "";
    if (f.dueFrom && due < f.dueFrom) return false;
    if (f.dueTo && due > f.dueTo) return false;
  }
  if (f.status && row.status !== f.status) return false;
  if (
    cfg.warehouse &&
    f.warehouses.length &&
    !(row.warehouse && f.warehouses.includes(row.warehouse))
  ) {
    return false;
  }
  if (!matchesAmountRange(row.balance, f.balMode, f.balA, f.balB)) return false;
  if (!matchesAmountRange(row.total, f.totMode, f.totA, f.totB)) return false;
  if (!matchesTagFilter(row.tags, f.tags, f.tagMode)) return false;
  return true;
}

/** Single source of truth for the empty filter shape. */
export function createEmptySalesFilterState(): SalesFilterState {
  return {
    keyword: "",
    column: "all",
    txFrom: "",
    txTo: "",
    dueFrom: "",
    dueTo: "",
    status: "",
    balMode: "more",
    balA: "",
    balB: "",
    totMode: "more",
    totA: "",
    totB: "",
    warehouses: [],
    tags: [],
    tagMode: "all"
  };
}

/**
 * Copies a filter state, including its own `warehouses`/`tags` arrays — used
 * whenever draft and applied are synced (open/apply/cancel/reset) so the two
 * never alias the same array (mutating one's chips would otherwise leak into
 * the other before Apply/Cancel is pressed).
 */
export function cloneSalesFilterState(f: SalesFilterState): SalesFilterState {
  return { ...f, warehouses: [...f.warehouses], tags: [...f.tags] };
}

/** Drives the pagination-footer "N filters applied" count and the Rule 13 scope-note count. */
export function countActiveFilters(
  f: SalesFilterState,
  cfg: Pick<TabConfig, "dueDate" | "warehouse">
): number {
  let n = 0;
  if (f.keyword.trim()) n++;
  if (f.txFrom || f.txTo) n++;
  if (cfg.dueDate && (f.dueFrom || f.dueTo)) n++;
  if (f.status) n++;
  if (cfg.warehouse && f.warehouses.length) n++;
  if (f.balA !== "" || f.balB !== "") n++;
  if (f.totA !== "" || f.totB !== "") n++;
  if (f.tags.length) n++;
  return n;
}

/** Rule 13 scope-note banner copy. */
export function describeFilterScopeClear(count: number, tabLabel: string): string {
  return `${count} filter${count > 1 ? "s" : ""} applied to ${tabLabel} only. Switching document type clears it.`;
}

/**
 * Shared IDR formatter — table cells, summary cards, amount-field
 * placeholders. Matches the real Sales index's display format exactly:
 * "Rp. 26.913.107.651.832,06" (period after "Rp", dot thousands separator,
 * comma decimal separator, always 2 decimal places).
 */
export function formatIDR(value: number): string {
  return (
    "Rp. " + value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}
