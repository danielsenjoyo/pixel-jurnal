// The purchase list report's filter — its shape, its defaults, and the one
// function that decides whether a row survives it.
//
// Ported from jurnal-frontend-app
// src/pages/reports/purchases_list/components/more-filter.vue plus the payload
// the page builds around it.
//
// Same split as `purchase-filter.ts`, and for the same reason: the drawer edits
// a draft of this object and the page applies the committed one, so the
// predicate has to live somewhere both can reach or it drifts the first time a
// field is added.

import type { PurchaseStatus } from "./purchase-status";
import {
  DEFAULT_PERIOD_ID,
  DEFAULT_TRANSACTION_TYPE,
  PURCHASE_REPORT_PERIODS,
  type DateBy,
  type PurchaseReportRow
} from "./purchase-report";
import type { TransactionType } from "./purchase-transactions";

export interface PurchaseReportFilter {
  /** Both dates are DD/MM/YYYY, the format MpDatePicker emits. */
  startDate: string;
  endDate: string;
  periodId: string;
  transactionType: TransactionType;
  /** Which date the range is measured against. */
  dateBy: DateBy;
  vendors: string[];
  statuses: PurchaseStatus[];
  tags: string[];
  /** `and` = must carry every selected tag; `or` = any one of them. */
  tagsLogic: "and" | "or";
}

export function defaultPurchaseReportFilter(): PurchaseReportFilter {
  const period = PURCHASE_REPORT_PERIODS.find((p) => p.id === DEFAULT_PERIOD_ID);
  const bounds = period?.range?.();
  return {
    startDate: bounds ? isoToDmy(bounds.start) : "",
    endDate: bounds ? isoToDmy(bounds.end) : "",
    periodId: DEFAULT_PERIOD_ID,
    transactionType: DEFAULT_TRANSACTION_TYPE,
    dateBy: "transaction_date",
    vendors: [],
    statuses: [],
    tags: [],
    tagsLogic: "and"
  };
}

/**
 * Whether anything *beyond the date range and transaction type* is set — those
 * two live on the filter bar itself and are always visible, so they must not
 * light the dot on the More filter button. Only the drawer-only criteria count,
 * because those are the ones that vanish when it closes.
 */
export function isReportFilterActive(f: PurchaseReportFilter): boolean {
  return Boolean(
    f.vendors.length || f.statuses.length || f.tags.length || f.dateBy !== "transaction_date"
  );
}

/** DD/MM/YYYY → YYYY-MM-DD, so a typed date compares against the row's ISO
 *  dates as a plain string. "" for anything unparseable — callers read that as
 *  "no bound". */
export function dmyToIso(dmy: string): string {
  const parts = String(dmy ?? "").split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** The inverse, for seeding the date fields from a period preset. */
export function isoToDmy(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : "";
}

export function matchesPurchaseReportFilter(
  row: PurchaseReportRow,
  f: PurchaseReportFilter
): boolean {
  const subject = f.dateBy === "due_date" ? row.dueDate : row.date;
  const start = dmyToIso(f.startDate);
  const end = dmyToIso(f.endDate);
  if (start && (!subject || subject < start)) return false;
  if (end && (!subject || subject > end)) return false;

  if (f.vendors.length && !f.vendors.includes(row.vendorName)) return false;
  if (f.statuses.length && !f.statuses.includes(row.status)) return false;

  if (f.tags.length) {
    const matched =
      f.tagsLogic === "and"
        ? f.tags.every((t) => row.tags.includes(t))
        : f.tags.some((t) => row.tags.includes(t));
    if (!matched) return false;
  }
  return true;
}

/** The date range is only usable once both ends parse — production disables
 *  its Filter button on the same condition. */
export function isReportRangeValid(f: PurchaseReportFilter): boolean {
  return Boolean(dmyToIso(f.startDate) && dmyToIso(f.endDate));
}
