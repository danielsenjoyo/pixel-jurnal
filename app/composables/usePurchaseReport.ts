import { computed, reactive, ref } from "vue";
import { PURCHASE_REPORT_PERIODS } from "~/data/purchase-report";
import {
  defaultPurchaseReportFilter,
  isReportFilterActive,
  isReportRangeValid,
  type PurchaseReportFilter
} from "~/data/purchase-report-filter";

/**
 * The run contract every Purchases report shares.
 *
 * **Two filter objects, never one.** `filter` is what the controls edit;
 * `applied` is what the table reads. A report does not re-run as you type — you
 * set a range and press Filter — which is the whole reason these pages have a
 * Filter button and a "Report will appear here" blank state at all. Collapsing
 * them into a single ref makes both meaningless.
 *
 * `applied === null` **is** the not-run-yet state, so there is no separate
 * `hasRun` flag that could drift out of sync with it.
 *
 * See `docs/patterns/reports-page-format.md`.
 */
export function usePurchaseReport(options?: {
  /** Report-specific defaults — e.g. Delivery pins `transactionType`. */
  defaults?: Partial<PurchaseReportFilter>;
  /** Runs after each successful run — the page resets its pager here. */
  onRun?: () => void;
}) {
  const makeDefault = (): PurchaseReportFilter => ({
    ...defaultPurchaseReportFilter(),
    ...options?.defaults
  });

  const filter = reactive<PurchaseReportFilter>(makeDefault());
  const applied = ref<PurchaseReportFilter | null>(null);
  const isFilterDrawerOpen = ref(false);
  const isLoading = ref(false);

  const hasRun = computed(() => applied.value !== null);
  const isRangeValid = computed(() => isReportRangeValid(filter));
  const isDrawerFilterActive = computed(() => isReportFilterActive(filter));

  function snapshot(): PurchaseReportFilter {
    return {
      ...filter,
      vendors: [...filter.vendors],
      statuses: [...filter.statuses],
      tags: [...filter.tags]
    };
  }

  /**
   * Stands in for production's fetch. The delay is deliberate: it is what makes
   * the skeleton rows reachable, and a report that returned instantly would
   * misrepresent a screen whose whole shape is built around waiting for one.
   */
  function runReport() {
    if (!isRangeValid.value) return;
    applied.value = snapshot();
    options?.onRun?.();
    isLoading.value = true;
    window.setTimeout(() => (isLoading.value = false), 450);
  }

  function onApplyFilter(next: PurchaseReportFilter) {
    Object.assign(filter, next);
    isFilterDrawerOpen.value = false;
    runReport();
  }

  function clearFilters() {
    Object.assign(filter, makeDefault());
    runReport();
  }

  /**
   * The strip above the table. Production prints the same facts there so an
   * exported page reads on its own; it also gives the Filter button visible
   * feedback, since the criteria that produced the table are otherwise only
   * visible inside the drawer.
   */
  function metaLine(subject: string): string {
    const f = applied.value;
    if (!f) return "";
    const period = PURCHASE_REPORT_PERIODS.find((p) => p.id === f.periodId);
    const label = period && period.id !== "custom" ? period.label : "Custom range";
    return `${subject} · ${label} · ${f.startDate} – ${f.endDate} · IDR`;
  }

  return {
    filter,
    applied,
    isFilterDrawerOpen,
    isLoading,
    hasRun,
    isRangeValid,
    isDrawerFilterActive,
    runReport,
    onApplyFilter,
    clearFilters,
    metaLine
  };
}
