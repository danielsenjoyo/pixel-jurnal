import type { PriceHistoryEntry } from "~/types/price-history";

/**
 * Seed values for today's unit-conversion table — a future admin-settings
 * screen (not built) would make this configurable. Never read this map when
 * rendering a HISTORICAL row's conversion note — use that row's own
 * `unitFactorAtPurchase` instead (see `ph-9` below, whose factor deliberately
 * differs from this map to exercise that rule).
 */
export const UNIT_FACTORS = { pcs: 1, dozen: 12, box: 24 } as const satisfies Record<string, number>;
export const BASE_UNIT = "pcs";

/** Keyed to real names from `app/data/purchase-transactions.ts` `PRODUCT_OPTIONS`/`VENDOR_OPTIONS` — see `app/types/price-history.ts` for why there's no id. */
export const PRODUCT_WITH_HISTORY = "Wireless Mouse";
export const PRODUCT_NO_HISTORY = "LED Desk Lamp";

export const PRICE_HISTORY: PriceHistoryEntry[] = [
  {
    id: "ph-1",
    purchasedAt: "2026-07-15",
    purchasedAtLabel: "15 Jul 2026",
    vendorName: "Toko Elektronik Jaya",
    product: PRODUCT_WITH_HISTORY,
    qty: 300,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 8.5,
    currency: "USD",
    exchangeRateAtPurchase: 16470,
    documentNumber: "BILL/2026/07/0503"
  },
  {
    id: "ph-2",
    purchasedAt: "2026-06-22",
    purchasedAtLabel: "22 Jun 2026",
    vendorName: "CV Sumber Rejeki",
    product: PRODUCT_WITH_HISTORY,
    qty: 10,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 2_760_000,
    currency: "IDR",
    documentNumber: "BILL/2026/06/0442"
  },
  {
    id: "ph-3",
    purchasedAt: "2026-05-20",
    purchasedAtLabel: "20 May 2026",
    vendorName: "PT Cipta Karya",
    product: PRODUCT_WITH_HISTORY,
    qty: 30,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 128_000,
    currency: "IDR",
    documentNumber: "BILL/2026/05/0395"
  },
  {
    id: "ph-4",
    purchasedAt: "2026-05-12",
    purchasedAtLabel: "12 May 2026",
    vendorName: "PT Maju Bersama",
    product: PRODUCT_WITH_HISTORY,
    qty: 50,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 130_000,
    currency: "IDR",
    documentNumber: "BILL/2026/05/0231"
  },
  {
    id: "ph-5",
    purchasedAt: "2026-04-09",
    purchasedAtLabel: "09 Apr 2026",
    vendorName: "Toko Elektronik Jaya",
    product: PRODUCT_WITH_HISTORY,
    qty: 200,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 8.5,
    currency: "USD",
    exchangeRateAtPurchase: 16000,
    documentNumber: "BILL/2026/04/0388"
  },
  {
    id: "ph-6",
    purchasedAt: "2026-03-03",
    purchasedAtLabel: "03 Mar 2026",
    vendorName: "PT Maju Bersama",
    product: PRODUCT_WITH_HISTORY,
    qty: 8,
    unit: "dozen",
    unitFactorAtPurchase: UNIT_FACTORS.dozen,
    baseUnit: BASE_UNIT,
    price: 1_440_000,
    currency: "IDR",
    documentNumber: "BILL/2026/03/0295"
  },
  {
    id: "ph-7",
    purchasedAt: "2026-01-18",
    purchasedAtLabel: "18 Jan 2026",
    vendorName: "PT Maju Bersama",
    product: PRODUCT_WITH_HISTORY,
    qty: 5,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 2_640_000,
    currency: "IDR",
    documentNumber: "BILL/2026/01/0117"
  },
  {
    id: "ph-8",
    purchasedAt: "2025-12-05",
    purchasedAtLabel: "05 Dec 2025",
    vendorName: "Toko Elektronik Jaya",
    product: PRODUCT_WITH_HISTORY,
    qty: 250,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 8.0,
    currency: "USD",
    exchangeRateAtPurchase: 15850,
    documentNumber: "BILL/2025/12/0362"
  },
  {
    id: "ph-9",
    purchasedAt: "2025-10-22",
    purchasedAtLabel: "22 Oct 2025",
    vendorName: "CV Sumber Rejeki",
    product: PRODUCT_WITH_HISTORY,
    qty: 12,
    unit: "box",
    // Deliberately differs from today's UNIT_FACTORS.box (24) — this vendor's
    // box size was smaller back then. Exercises the per-transaction rule:
    // this note must come from this row's own factor, never today's lookup.
    unitFactorAtPurchase: 12,
    baseUnit: BASE_UNIT,
    price: 1_320_000,
    currency: "IDR",
    documentNumber: "BILL/2025/10/0288"
  },
  {
    id: "ph-10",
    purchasedAt: "2025-09-14",
    purchasedAtLabel: "14 Sep 2025",
    vendorName: "UD Berkah Abadi",
    product: PRODUCT_WITH_HISTORY,
    qty: 20,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 95.0,
    currency: "USD",
    exchangeRateAtPurchase: 15700,
    documentNumber: "BILL/2025/09/0410"
  },
  {
    id: "ph-11",
    purchasedAt: "2025-07-30",
    purchasedAtLabel: "30 Jul 2025",
    vendorName: "PT Maju Bersama",
    product: PRODUCT_WITH_HISTORY,
    qty: 40,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 118_000,
    currency: "IDR",
    documentNumber: "BILL/2025/07/0198"
  }
];

export function hasPriceHistory(product: string): boolean {
  return !!product && PRICE_HISTORY.some((entry) => entry.product === product);
}
