export type UnitCode = "pcs" | "dozen" | "box";
export type CurrencyCode = "IDR" | "USD";
export type PriceHistoryScope = "vendor" | "all";
export type PriceHistoryMode = "reference" | "apply";

export interface PriceHistoryEntry {
  id: string;
  /** ISO date — the sort key. */
  purchasedAt: string;
  /** Display label, e.g. "15 Jul 2026". */
  purchasedAtLabel: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  qty: number;
  unit: UnitCode;
  /**
   * OD-004: the unit-conversion factor recorded ON THIS TRANSACTION.
   * Never derive this from today's product-master conversion table —
   * a vendor's box/dozen size can change between purchases.
   */
  unitFactorAtPurchase: number;
  baseUnit: UnitCode;
  /** Price per `unit`, in `currency`. Line-level discount already applied; document-level discount is not reflected. Tax-exclusive. */
  price: number;
  /** Original billing currency — never converted for comparison or use. */
  currency: CurrencyCode;
  /** IDR per 1 unit of `currency`, on the purchase date. Hover-estimate only — never feeds a calculation, sort, or filter. */
  exchangeRateAtPurchase?: number;
  documentNumber: string;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: UnitCode;
}
