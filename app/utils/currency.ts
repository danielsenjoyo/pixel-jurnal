import type { CurrencyCode } from "~/types/price-history";

const idrWhole = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const usdFixed = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function currencySymbol(currency: CurrencyCode): string {
  return currency === "USD" ? "US$" : "Rp";
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return currency === "USD"
    ? `${currencySymbol(currency)}${usdFixed.format(amount)}`
    : `${currencySymbol(currency)}${idrWhole.format(Math.round(amount))}`;
}

export function formatQty(qty: number): string {
  return idrWhole.format(qty);
}

/** Formats a historical exchange rate, e.g. "Rp16,470". Always IDR-denominated. */
export function formatRate(rate: number): string {
  return `Rp${idrWhole.format(rate)}`;
}

/**
 * OD-005: converts a foreign-currency historical price to an IDR estimate,
 * using the rate recorded on that specific transaction. Informational only —
 * never feed the result into a calculation, sort, or filter.
 */
export function historicalIdrEstimate(price: number, exchangeRateAtPurchase: number): number {
  return price * exchangeRateAtPurchase;
}

export function parseNumeric(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Grouped-digit display for an editable amount field (no currency symbol —
 * the input's addon already shows that). Currency-aware decimals: IDR is
 * whole numbers, USD keeps 2 decimals — matches `formatMoney`'s precision so
 * a value round-trips through `parseEditableAmount` without drift.
 */
export function formatEditableAmount(amount: number, currency: CurrencyCode): string {
  return currency === "USD" ? usdFixed.format(amount) : idrWhole.format(Math.round(amount));
}

/**
 * Reverses `formatEditableAmount`'s id-ID grouping: "." is a thousands
 * separator here, "," is the decimal separator — the opposite of en-US.
 * Using `parseNumeric` (which treats "." as decimal) on this output would
 * silently truncate e.g. "350.000" to 350.
 */
export function parseEditableAmount(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
