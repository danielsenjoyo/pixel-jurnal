// Multi-currency display for HISTORICAL price-history rows only — the
// Purchase module's own current-document amounts always use `formatCurrency`/
// `formatAmount` from `~/data/purchase-transactions.ts` (that module's
// generated data is always IDR by design; see the comment in
// `purchase/invoice/[id].vue` about what's out of scope for this prototype).
// This formatter exists because price history deliberately DOES model
// foreign-currency historical purchases (rule: never convert, show the
// original currency) — a genuinely different value type from anything else
// in the Purchase module, not a competing formatter for the same one. See
// docs/patterns/MoneyField.md.

const idrWhole = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const twoDecimal = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function currencySymbol(currency: string): string {
  if (currency === "USD") return "US$";
  if (currency === "SGD") return "S$";
  return "Rp";
}

/**
 * Money for reading, in its original currency. Every currency gets two
 * decimals, IDR included: the Purchase module renders the same rupiah value
 * as `Rp125.000,00` (`formatCurrency`, two decimals), and a price-history row
 * sitting beside that document has to be recognisable as the same number at a
 * glance. Rounding rupiah to whole units here made a reader verify twice that
 * `Rp125.000` and `Rp125.000,00` were one value — which is the opposite of
 * what a price reference is for.
 */
export function formatMoney(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${twoDecimal.format(amount)}`;
}

export function formatQty(qty: number): string {
  return idrWhole.format(qty);
}

/** Formats a historical exchange rate, e.g. "Rp16,470". Always IDR-denominated. */
export function formatRate(rate: number): string {
  return `Rp${idrWhole.format(rate)}`;
}

/**
 * Converts a foreign-currency historical price to an IDR estimate, using the
 * rate recorded on that specific transaction. Informational only — never
 * feed the result into a calculation, sort, or filter.
 */
export function historicalIdrEstimate(price: number, exchangeRateAtPurchase: number): number {
  return price * exchangeRateAtPurchase;
}
