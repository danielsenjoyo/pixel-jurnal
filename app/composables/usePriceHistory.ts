import { computed, type Ref } from "vue";
import { PRICE_HISTORY } from "~/data/price-history";
import type { PriceHistoryEntry, PriceHistoryScope } from "~/types/price-history";

// Fixed, not a setting — TS-001 (Price History Source Governance) is Future,
// ships with no admin UI. Do not make this configurable here.
const MAX_LAST = 10;

interface ScopeResult {
  rows: PriceHistoryEntry[];
  total: number;
}

const EMPTY_RESULT: ScopeResult = { rows: [], total: 0 };

/**
 * The ONLY query path. Always re-filters PRICE_HISTORY from source, then
 * slices to the last 10 — never slices a shared pool and filters afterward.
 * That "shared pool" shape was a real bug in an earlier iteration: a real
 * purchase from one vendor could silently disappear from "this vendor" just
 * because other vendors bought the same item more recently. "This vendor"
 * and "all vendors" must each get their own independent last-10 window.
 */
function queryScope(
  scope: PriceHistoryScope,
  productId: string,
  vendorId: string | undefined
): ScopeResult {
  const matched = PRICE_HISTORY.filter((entry) => entry.productId === productId)
    .filter((entry) => scope === "all" || entry.vendorId === vendorId)
    .sort((a, b) => (a.purchasedAt < b.purchasedAt ? 1 : -1));

  return { rows: matched.slice(0, MAX_LAST), total: matched.length };
}

export function usePriceHistory(productId: Ref<string | undefined>, vendorId: Ref<string | undefined>) {
  // Two independent computeds — "this vendor" is never derived by filtering
  // "all vendors"' already-capped result, so the last-10-per-scope bug can't
  // structurally reappear.
  const vendorResult = computed<ScopeResult>(() =>
    productId.value && vendorId.value ? queryScope("vendor", productId.value, vendorId.value) : EMPTY_RESULT
  );
  const allResult = computed<ScopeResult>(() =>
    productId.value ? queryScope("all", productId.value, undefined) : EMPTY_RESULT
  );

  const vendorHasHistory = computed(() => vendorResult.value.total > 0);
  const hasAnyHistory = computed(() => allResult.value.total > 0);

  function resultFor(scope: PriceHistoryScope): ScopeResult {
    return scope === "vendor" ? vendorResult.value : allResult.value;
  }

  // Rule: vendor-first and product-first entry order both fully supported —
  // default to whatever is currently known, not a fixed sequence.
  function resolveDefaultScope(): PriceHistoryScope {
    return vendorHasHistory.value ? "vendor" : "all";
  }

  return {
    vendorResult,
    allResult,
    vendorHasHistory,
    hasAnyHistory,
    resultFor,
    resolveDefaultScope
  };
}
