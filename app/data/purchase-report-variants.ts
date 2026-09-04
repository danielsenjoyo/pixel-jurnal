/**
 * The other four Purchases reports — by vendor, delivery, by product, order
 * completion. Ported from `jurnal-frontend-app` (`src/pages/reports/
 * purchases_by_vendor | purchases_delivery | purchases_by_product |
 * purchases_order_completion`).
 *
 * Same contract as [`purchase-report.ts`](./purchase-report.ts), which holds
 * the Purchase list report and everything all five share (periods, filter
 * options, the layout type): **rows are a projection of
 * [`purchase-transactions.ts`](./purchase-transactions.ts)**, never a parallel
 * fixture. Each builder derives its figures at read time so they cannot
 * disagree with the transaction they came from.
 *
 * **Ported, not copied.** Production reads one endpoint per report, each with
 * its own server-side grouping, subtotals and pagination. Here every report is
 * a flat table over the same in-memory array. The most visible consequence is
 * that production's *grouped* reports — by vendor, and delivery grouped by
 * vendor or product — render a group header and a subtotal row per group; this
 * prototype repeats the grouping column on each row and shows one TOTAL at the
 * bottom instead. The figures are the same; the visual nesting is not.
 */

import type { ReportColumn } from "./report-column";
import { PURCHASE_STATUS_LABEL, type PurchaseStatus } from "./purchase-status";
import {
  PRODUCT_OPTIONS,
  TRANSACTION_TYPE_LABEL,
  getPurchaseTransactions,
  type PurchaseTransaction,
  type TransactionType
} from "./purchase-transactions";

// ---------------------------------------------------------------------------
// Purchase by vendor
// ---------------------------------------------------------------------------

export interface VendorLineRow {
  /** Composite — a line item has no id of its own across transactions. */
  id: string;
  transactionId: number;
  type: TransactionType;
  vendorName: string;
  date: string;
  transactionType: string;
  number: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export const VENDOR_REPORT_COLUMNS: ReportColumn<keyof VendorLineRow & string>[] = [
  { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 190 },
  { key: "date", label: "Date", labelId: "Tanggal", format: "date", width: 120 },
  { key: "transactionType", label: "Transaction Type", labelId: "Tipe Transaksi", width: 150 },
  { key: "number", label: "Transaction No.", labelId: "No. Transaksi", width: 190 },
  { key: "productName", label: "Product Name", labelId: "Nama Produk", width: 190 },
  { key: "description", label: "Description", labelId: "Deskripsi", width: 200 },
  { key: "quantity", label: "Qty", labelId: "Kuantitas", format: "number", total: true, width: 90 },
  { key: "unit", label: "Unit", labelId: "Satuan", width: 90 },
  // Money, so right-aligned and written as rupiah — but a column of unit
  // prices has no meaningful sum, so it opts out of the TOTAL row.
  {
    key: "unitPrice",
    label: "Price Per Unit",
    labelId: "Harga Per Unit",
    format: "money",
    total: false,
    width: 150
  },
  { key: "amount", label: "Amount", labelId: "Jumlah", format: "money", width: 160 }
];

/**
 * One row per *line item* of every matching transaction, ordered by vendor so
 * a vendor's purchases read as a block. Production nests these under a vendor
 * header with a subtotal; see the module note above.
 */
export function buildVendorLineRows(type: TransactionType): VendorLineRow[] {
  return getPurchaseTransactions()
    .filter((t) => t.type === type)
    .flatMap((t) =>
      t.lines.map((line) => ({
        id: `${t.id}-${line.id}`,
        transactionId: t.id,
        type: t.type,
        vendorName: t.vendorName,
        date: t.transactionDateSort,
        transactionType: TRANSACTION_TYPE_LABEL[t.type],
        number: t.number,
        productName: line.product,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        amount: line.amount
      }))
    )
    .sort((a, b) => a.vendorName.localeCompare(b.vendorName) || a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Purchase delivery
// ---------------------------------------------------------------------------

/** Production's three groupings, each with its own column set. */
export type DeliveryGrouping = "transaction" | "vendor" | "product";

export const DELIVERY_GROUPING_OPTIONS: { value: DeliveryGrouping; label: string }[] = [
  { value: "transaction", label: "Transaction" },
  { value: "vendor", label: "Vendor" },
  { value: "product", label: "Product" }
];

export interface DeliveryRow {
  id: string;
  transactionId: number;
  date: string;
  transactionType: string;
  number: string;
  vendorName: string;
  productName: string;
  unit: string;
  quantity: number;
  amount: number;
}

const DELIVERY_COLUMN_SETS: Record<DeliveryGrouping, ReportColumn<keyof DeliveryRow & string>[]> = {
  // One row per delivery — no product breakdown, so no Qty either.
  transaction: [
    { key: "date", label: "Date", labelId: "Tanggal", format: "date", width: 130 },
    { key: "transactionType", label: "Transaction Type", labelId: "Tipe Transaksi", width: 170 },
    { key: "number", label: "Transaction No.", labelId: "No. Transaksi", width: 200 },
    { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 220 },
    { key: "amount", label: "Amount", labelId: "Jumlah", format: "money", width: 180 }
  ],
  vendor: [
    { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 220 },
    { key: "productName", label: "Product Name", labelId: "Nama Produk", width: 220 },
    { key: "unit", label: "Unit", labelId: "Satuan", width: 100 },
    {
      key: "quantity",
      label: "Qty",
      labelId: "Kuantitas",
      format: "number",
      total: true,
      width: 100
    },
    { key: "amount", label: "Amount", labelId: "Jumlah", format: "money", width: 180 }
  ],
  product: [
    { key: "productName", label: "Product Name", labelId: "Nama Produk", width: 200 },
    { key: "date", label: "Date", labelId: "Tanggal", format: "date", width: 120 },
    { key: "transactionType", label: "Transaction Type", labelId: "Tipe Transaksi", width: 160 },
    { key: "number", label: "Transaction No.", labelId: "No. Transaksi", width: 190 },
    { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 190 },
    { key: "unit", label: "Unit", labelId: "Satuan", width: 90 },
    {
      key: "quantity",
      label: "Qty",
      labelId: "Kuantitas",
      format: "number",
      total: true,
      width: 90
    },
    { key: "amount", label: "Amount", labelId: "Jumlah", format: "money", width: 160 }
  ]
};

export function deliveryColumns(grouping: DeliveryGrouping) {
  return DELIVERY_COLUMN_SETS[grouping];
}

/**
 * Deliveries only — the report has no transaction-type choice, which is why
 * its drawer hides that field.
 *
 * The grouping decides both the column set above and the row grain: grouped by
 * transaction there is one row per delivery, otherwise one per delivered line.
 */
export function buildDeliveryRows(grouping: DeliveryGrouping): DeliveryRow[] {
  const deliveries = getPurchaseTransactions().filter((t) => t.type === "delivery");

  if (grouping === "transaction") {
    return deliveries
      .map((t) => ({
        id: String(t.id),
        transactionId: t.id,
        date: t.transactionDateSort,
        transactionType: TRANSACTION_TYPE_LABEL[t.type],
        number: t.number,
        vendorName: t.vendorName,
        productName: "",
        unit: "",
        quantity: 0,
        // The delivery's line value, NOT `t.total`. Regrouping the same
        // deliveries must not change what they add up to, and the other two
        // groupings are line-grained — `t.total` carries tax that a sum of
        // line amounts does not, so using it here made the TOTAL row jump by
        // the tax the moment the reader switched grouping.
        amount: t.lines.reduce((sum, line) => sum + line.amount, 0)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const lines = deliveries.flatMap((t) =>
    t.lines.map((line) => ({
      id: `${t.id}-${line.id}`,
      transactionId: t.id,
      date: t.transactionDateSort,
      transactionType: TRANSACTION_TYPE_LABEL[t.type],
      number: t.number,
      vendorName: t.vendorName,
      productName: line.product,
      unit: line.unit,
      quantity: line.quantity,
      amount: line.amount
    }))
  );

  return grouping === "vendor"
    ? lines.sort((a, b) => a.vendorName.localeCompare(b.vendorName) || a.date.localeCompare(b.date))
    : lines.sort(
        (a, b) => a.productName.localeCompare(b.productName) || a.date.localeCompare(b.date)
      );
}

// ---------------------------------------------------------------------------
// Purchase by product
// ---------------------------------------------------------------------------

export interface ProductReportRow {
  id: string;
  no: number;
  productCode: string;
  productName: string;
  purchaseQty: number;
  returnQty: number;
  purchaseValue: number;
  returnValue: number;
  avgPurchaseValue: number;
  totalPurchaseValue: number;
}

export const PRODUCT_REPORT_COLUMNS: ReportColumn<keyof ProductReportRow & string>[] = [
  { key: "no", label: "No.", format: "number", total: false, align: "left", width: 70 },
  { key: "productCode", label: "Product Code / SKU", labelId: "Kode Produk / SKU", width: 170 },
  { key: "productName", label: "Product Name", labelId: "Nama Produk", width: 220 },
  {
    key: "purchaseQty",
    label: "Purchase Qty",
    labelId: "Kuantitas Pembelian",
    format: "number",
    total: true,
    width: 130
  },
  {
    key: "returnQty",
    label: "Return Qty",
    labelId: "Kuantitas Retur",
    format: "number",
    total: true,
    width: 120
  },
  {
    key: "purchaseValue",
    label: "Purchase Value",
    labelId: "Nilai Pembelian",
    format: "money",
    width: 160
  },
  {
    key: "returnValue",
    label: "Return Value",
    labelId: "Nilai Retur",
    format: "money",
    width: 150
  },
  // An average of averages is not an average, so this column carries no total.
  {
    key: "avgPurchaseValue",
    label: "Average Purchase Value",
    labelId: "Nilai Pembelian Rata-rata",
    format: "money",
    total: false,
    width: 200
  },
  {
    key: "totalPurchaseValue",
    label: "Total Purchase Value",
    labelId: "Total Nilai Pembelian",
    format: "money",
    width: 180
  }
];

/**
 * `PRODUCT_OPTIONS` carries no SKU — the prototype's products are a name, a
 * price and a unit. The code is derived from the product's position in that
 * list so it is stable across reloads and reads like the real thing, rather
 * than inventing a second product fixture just to hold one field.
 */
function productCode(name: string): string {
  const index = PRODUCT_OPTIONS.findIndex((p) => p.name === name);
  return `PRD-${String(index >= 0 ? index + 1 : 0).padStart(3, "0")}`;
}

/**
 * One row per product, aggregated across every purchase of the selected type
 * — and, for returns, across every `return` record, since a return's value is
 * what makes "net purchase" meaningful.
 *
 * The filter is applied here, per *transaction*, rather than to the finished
 * rows. A product row spans many transactions, so filtering afterwards would
 * keep or drop a whole product instead of narrowing what it sums — a date range
 * would then either include a product's entire history or none of it.
 *
 * `no` is left at 0: it is a display counter, so the page assigns it after
 * sorting. Numbering here would leave "No." out of order the moment the reader
 * sorts by quantity or value.
 */
export function buildProductReportRows(
  type: TransactionType,
  matches: (t: PurchaseTransaction) => boolean = () => true
): ProductReportRow[] {
  const all = getPurchaseTransactions().filter(matches);
  const purchases = all.filter((t) => t.type === type);
  const returns = all.filter((t) => t.type === "return");

  const byProduct = new Map<string, ProductReportRow>();
  const seed = (name: string): ProductReportRow => {
    const existing = byProduct.get(name);
    if (existing) return existing;
    const row: ProductReportRow = {
      id: name,
      no: 0,
      productCode: productCode(name),
      productName: name,
      purchaseQty: 0,
      returnQty: 0,
      purchaseValue: 0,
      returnValue: 0,
      avgPurchaseValue: 0,
      totalPurchaseValue: 0
    };
    byProduct.set(name, row);
    return row;
  };

  purchases.forEach((t) =>
    t.lines.forEach((line) => {
      const row = seed(line.product);
      row.purchaseQty += line.quantity;
      row.purchaseValue += line.amount;
    })
  );

  returns.forEach((t) =>
    t.lines.forEach((line) => {
      const row = seed(line.product);
      row.returnQty += line.quantity;
      row.returnValue += line.amount;
    })
  );

  return [...byProduct.values()]
    .map((row) => ({
      ...row,
      avgPurchaseValue: row.purchaseQty ? Math.round(row.purchaseValue / row.purchaseQty) : 0,
      // "Total" here is net of returns — the figure the report exists to give.
      totalPurchaseValue: row.purchaseValue - row.returnValue
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

// ---------------------------------------------------------------------------
// Purchase order completion
// ---------------------------------------------------------------------------

export interface OrderCompletionRow {
  id: number;
  date: string;
  number: string;
  vendorName: string;
  status: PurchaseStatus;
  statusLabel: string;
  orderAmount: number;
  deliveryNumber: string;
  deliveryId: number | null;
}

export const ORDER_COMPLETION_COLUMNS: ReportColumn<keyof OrderCompletionRow & string>[] = [
  { key: "date", label: "Date", labelId: "Tanggal", format: "date", width: 120 },
  { key: "number", label: "Order No.", labelId: "No. Pesanan", width: 190 },
  { key: "vendorName", label: "Vendor", labelId: "Supplier", width: 200 },
  { key: "status", label: "Order Status", labelId: "Status Pesanan", width: 140 },
  {
    key: "orderAmount",
    label: "Order Amount",
    labelId: "Jumlah Pesanan",
    format: "money",
    width: 180
  },
  { key: "deliveryNumber", label: "Delivery No.", labelId: "No. Pengiriman", width: 220 }
];

/**
 * One row per purchase order, with how far it has got.
 *
 * Production walks the full quote → order → invoice → payment chain, because
 * its records carry those links. This dataset models only order → delivery
 * (`linkedDeliveryId`), so the row reports the order's own status, its amount,
 * and its linked delivery if it has one.
 *
 * The columns production fills from the invoice and payment legs are absent
 * rather than faked. Payment and Balance Due were built and then removed: an
 * `order` here never carries an `amountReceived`, so Payment was always
 * `0,00` and Balance Due always equalled Order Amount exactly. Two columns
 * that can never say anything are worse than two columns that aren't there.
 */
export function buildOrderCompletionRows(): OrderCompletionRow[] {
  const all = getPurchaseTransactions();
  const byId = new Map<number, PurchaseTransaction>(all.map((t) => [t.id, t]));

  return all
    .filter((t) => t.type === "order")
    .map((t) => {
      const delivery = t.linkedDeliveryId != null ? byId.get(t.linkedDeliveryId) : undefined;
      return {
        id: t.id,
        date: t.transactionDateSort,
        number: t.number,
        vendorName: t.vendorName,
        status: t.status,
        statusLabel: PURCHASE_STATUS_LABEL[t.status],
        orderAmount: t.total,
        deliveryNumber: delivery?.number ?? "",
        deliveryId: delivery?.id ?? null
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
