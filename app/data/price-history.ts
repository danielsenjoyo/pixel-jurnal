import type { PriceHistoryEntry, UnitCode } from "~/types/price-history";

/**
 * TS-001 (Price History Source Governance) seed values — this feature is
 * Future/no-admin-UI, so these stay hardcoded. Never read this map when
 * rendering a HISTORICAL row's conversion note — use that row's own
 * `unitFactorAtPurchase` instead (see PRICE_HISTORY below, row `ph-9`, whose
 * factor deliberately differs from this map to exercise that rule).
 */
export const UNIT_FACTORS: Record<UnitCode, number> = { pcs: 1, dozen: 12, box: 24 };
export const BASE_UNIT: UnitCode = "pcs";

export const PRODUCT_ID_WITH_HISTORY = "prod-hs6006";
export const PRODUCT_ID_NO_HISTORY = "prod-steel-bracket";

/**
 * Ported verbatim from prototype_purchase_price_history_v1_simple.html so the
 * prototype's own walkthrough steps still reproduce exactly (see docs/patterns
 * and the approved plan's manual verification section).
 */
export const PRICE_HISTORY: PriceHistoryEntry[] = [
  {
    id: "ph-1",
    purchasedAt: "2026-07-15",
    purchasedAtLabel: "15 Jul 2026",
    vendorId: "v3",
    vendorName: "Shenzhen Heat Co., Ltd",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 300,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 21.5,
    currency: "USD",
    exchangeRateAtPurchase: 16470,
    documentNumber: "BILL/2026/07/0503"
  },
  {
    id: "ph-2",
    purchasedAt: "2026-06-22",
    purchasedAtLabel: "22 Jun 2026",
    vendorId: "v2",
    vendorName: "CV Teknik Mandiri",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 10,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 8_520_000,
    currency: "IDR",
    documentNumber: "BILL/2026/06/0442"
  },
  {
    id: "ph-3",
    purchasedAt: "2026-05-20",
    purchasedAtLabel: "20 May 2026",
    vendorId: "v4",
    vendorName: "PT Anugrah Metalindo",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 30,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 328_000,
    currency: "IDR",
    documentNumber: "BILL/2026/05/0395"
  },
  {
    id: "ph-4",
    purchasedAt: "2026-05-12",
    purchasedAtLabel: "12 May 2026",
    vendorId: "v1",
    vendorName: "PT Sinar Logam Nusantara",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 50,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 340_000,
    currency: "IDR",
    documentNumber: "BILL/2026/05/0231"
  },
  {
    id: "ph-5",
    purchasedAt: "2026-04-09",
    purchasedAtLabel: "09 Apr 2026",
    vendorId: "v3",
    vendorName: "Shenzhen Heat Co., Ltd",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 200,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 21.5,
    currency: "USD",
    exchangeRateAtPurchase: 16000,
    documentNumber: "BILL/2026/04/0388"
  },
  {
    id: "ph-6",
    purchasedAt: "2026-03-03",
    purchasedAtLabel: "03 Mar 2026",
    vendorId: "v1",
    vendorName: "PT Sinar Logam Nusantara",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 8,
    unit: "dozen",
    unitFactorAtPurchase: UNIT_FACTORS.dozen,
    baseUnit: BASE_UNIT,
    price: 4_000_000,
    currency: "IDR",
    documentNumber: "BILL/2026/03/0295"
  },
  {
    id: "ph-7",
    purchasedAt: "2026-01-18",
    purchasedAtLabel: "18 Jan 2026",
    vendorId: "v1",
    vendorName: "PT Sinar Logam Nusantara",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 5,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 6_640_000,
    currency: "IDR",
    documentNumber: "BILL/2026/01/0117"
  },
  {
    id: "ph-8",
    purchasedAt: "2025-12-05",
    purchasedAtLabel: "05 Dec 2025",
    vendorId: "v3",
    vendorName: "Shenzhen Heat Co., Ltd",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 250,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 20.8,
    currency: "USD",
    exchangeRateAtPurchase: 15850,
    documentNumber: "BILL/2025/12/0362"
  },
  {
    id: "ph-9",
    purchasedAt: "2025-10-22",
    purchasedAtLabel: "22 Oct 2025",
    vendorId: "v2",
    vendorName: "CV Teknik Mandiri",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 12,
    unit: "box",
    // Deliberately differs from today's UNIT_FACTORS.box (24) — this vendor's
    // box size was smaller back then. Exercises OD-004: this note must come
    // from this row's own factor, never from today's product-master lookup.
    unitFactorAtPurchase: 12,
    baseUnit: BASE_UNIT,
    price: 8_100_000,
    currency: "IDR",
    documentNumber: "BILL/2025/10/0288"
  },
  {
    id: "ph-10",
    purchasedAt: "2025-09-14",
    purchasedAtLabel: "14 Sep 2025",
    vendorId: "v5",
    vendorName: "Guangzhou Thermal Ltd",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 20,
    unit: "box",
    unitFactorAtPurchase: UNIT_FACTORS.box,
    baseUnit: BASE_UNIT,
    price: 495.0,
    currency: "USD",
    exchangeRateAtPurchase: 15700,
    documentNumber: "BILL/2025/09/0410"
  },
  {
    id: "ph-11",
    purchasedAt: "2025-07-30",
    purchasedAtLabel: "30 Jul 2025",
    vendorId: "v1",
    vendorName: "PT Sinar Logam Nusantara",
    productId: PRODUCT_ID_WITH_HISTORY,
    qty: 40,
    unit: "pcs",
    unitFactorAtPurchase: UNIT_FACTORS.pcs,
    baseUnit: BASE_UNIT,
    price: 325_000,
    currency: "IDR",
    documentNumber: "BILL/2025/07/0198"
  }
];
