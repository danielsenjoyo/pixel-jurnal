export type PriceHistoryScope = "vendor" | "all";
export type PriceHistoryMode = "reference" | "apply";

/**
 * `app/data/purchase-transactions.ts` has no `productId`/`vendorId` — vendor
 * and product are referenced by NAME everywhere in this module (see
 * `VENDOR_OPTIONS`/`PRODUCT_OPTIONS`). Price history follows the same
 * convention deliberately, so it joins against real transaction lines
 * without needing ids introduced anywhere else in the app.
 */
export interface PriceHistoryEntry {
  id: string;
  /** ISO date — the sort key. */
  purchasedAt: string;
  /** Display label, e.g. "15 Jul 2026". */
  purchasedAtLabel: string;
  vendorName: string;
  /** Matches `PurchaseTransactionLine.product` — a name, not an id. */
  product: string;
  qty: number;
  unit: string;
  /**
   * The unit-conversion factor recorded ON THIS TRANSACTION. Never derive
   * this from today's product-master conversion table — a vendor's box/case
   * size can change between purchases.
   */
  unitFactorAtPurchase: number;
  baseUnit: string;
  /** Price per `unit`, in `currency`. Line-level discount already applied; document-level discount is not reflected. Tax-exclusive. */
  price: number;
  /** Original billing currency — never converted for comparison or use. */
  currency: string;
  /** IDR per 1 unit of `currency`, on the purchase date. Hover-estimate only — never feeds a calculation, sort, or filter. */
  exchangeRateAtPurchase?: number;
  documentNumber: string;
}
