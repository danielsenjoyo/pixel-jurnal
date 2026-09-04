import { PRODUCT_ID_NO_HISTORY, PRODUCT_ID_WITH_HISTORY } from "~/data/price-history";
import type { CurrencyCode, Product, UnitCode, Vendor } from "~/types/price-history";

export const VENDORS: Vendor[] = [
  { id: "v1", name: "PT Sinar Logam Nusantara" },
  { id: "v2", name: "CV Teknik Mandiri" },
  { id: "v3", name: "Shenzhen Heat Co., Ltd" },
  { id: "v4", name: "PT Anugrah Metalindo" },
  { id: "v5", name: "Guangzhou Thermal Ltd" }
];

export const PRODUCTS: Product[] = [
  { id: PRODUCT_ID_WITH_HISTORY, code: "HS-6006", name: "Aluminum Heat Sink", unit: "pcs" },
  { id: PRODUCT_ID_NO_HISTORY, code: "SB-2210", name: "Steel Bracket", unit: "pcs" },
  { id: "prod-copper-coil", code: "CC-118", name: "Copper Coil", unit: "pcs" },
  { id: "prod-plastic-housing", code: "PH-330", name: "Plastic Housing", unit: "pcs" }
];

export interface PurchaseInvoiceLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  description?: string;
  qty: number;
  unit: UnitCode;
  unitPrice: number;
  discountPercent: number;
  taxLabel?: string;
}

export interface PurchaseInvoiceHeader {
  documentNumber: string;
  vendorId: string;
  vendorName: string;
  transactionDate: string;
  dueDate: string;
  currency: CurrencyCode;
  createdByName: string;
  createdAtLabel: string;
  status: "draft";
}

// Screen 1 — draft/approval review mock document. Line 1 has price history
// (matches the prototype's walkthrough); line 2 has none, to exercise the
// "no purchase history found" under-price state.
export const DRAFT_INVOICE: {
  header: PurchaseInvoiceHeader;
  lines: PurchaseInvoiceLine[];
} = {
  header: {
    documentNumber: "PI-2026-0771",
    vendorId: "v1",
    vendorName: "PT Sinar Logam Nusantara",
    transactionDate: "30/07/2026",
    dueDate: "29/08/2026",
    currency: "IDR",
    createdByName: "Agus",
    createdAtLabel: "30 Jul 2026",
    status: "draft"
  },
  lines: [
    {
      id: "line-1",
      productId: PRODUCT_ID_WITH_HISTORY,
      productCode: "HS-6006",
      productName: "Aluminum Heat Sink",
      qty: 1,
      unit: "pcs",
      unitPrice: 350_000,
      discountPercent: 0
    },
    {
      id: "line-2",
      productId: PRODUCT_ID_NO_HISTORY,
      productCode: "SB-2210",
      productName: "Steel Bracket",
      qty: 2,
      unit: "pcs",
      unitPrice: 120_000,
      discountPercent: 0
    }
  ]
};

// Screen 2 — entry form initial state: vendor empty, one line already priced
// (the "product-first" path from the approved plan's walkthrough).
export function createDraftLine(id: string): PurchaseInvoiceLine {
  return {
    id,
    productId: "",
    productCode: "",
    productName: "",
    qty: 1,
    unit: "pcs",
    unitPrice: 0,
    discountPercent: 0
  };
}

export const NEW_INVOICE_INITIAL_LINES: PurchaseInvoiceLine[] = [
  {
    id: "new-line-1",
    productId: PRODUCT_ID_WITH_HISTORY,
    productCode: "HS-6006",
    productName: "Aluminum Heat Sink",
    qty: 1,
    unit: "pcs",
    unitPrice: 350_000,
    discountPercent: 0
  },
  {
    id: "new-line-2",
    productId: PRODUCT_ID_NO_HISTORY,
    productCode: "SB-2210",
    productName: "Steel Bracket",
    qty: 2,
    unit: "pcs",
    unitPrice: 120_000,
    discountPercent: 0
  }
];
