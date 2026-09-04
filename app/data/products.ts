// Shared mock data source for the whole Products module — the seven list tabs
// of app/pages/products/index.vue (Product list, Product with variant, Stock
// adjustments, Require approval, Warehouse list, Warehouse transfer, Warehouse
// approval) plus Price rules.
//
// Cloned from jurnal-frontend-app src/pages/products/. That module splits the
// screen three ways and nests two tab rows inside it:
//
//   segment "Goods & services"  → tabs: products_and_services | masters |
//                                        stock_adjustments | product_index_approval
//   segment "Warehouses"        → tabs: warehouses | warehouse_transfers |
//                                        warehouse_transfers_approval
//   segment "Price rules"       → one list
//
// Each of those tabs is a different entity, not a filtered view of one array
// (which is where this differs from Purchases — see purchase-transactions.ts,
// where nine tabs are nine views over a single array). So each gets its own
// interface and its own getter here, and the list page maps whichever one the
// active tab needs onto the shared row shape its table renders.
//
// This is a UI-only prototype: no backend, no roles/packages gating, no
// approval workflow, no import/export pipeline. What is ported is the *shape*
// of the screens — the segments, the tabs, the column sets, the filter fields,
// the summary strip and the empty-state copy.
//
// Two source features are deliberately NOT ported, because both are settings
// UI rather than page structure:
//   - the **column picker** (`table-col-filter`, `defaultProductCols`), which
//     lets a user toggle each column and defaults Product image, Average price
//     and Total-product-in-warehouse to off. We render the source's
//     default-on set, so the image column is absent here too.
//   - the **nested variant rows** on the masters tab, where a master expands to
//     reveal its variants. We show one row per master with a variant count
//     instead; the variant list belongs to the (not-yet-cloned) master detail
//     page.
import type { ProductsTabKey } from "~/data/products-filter";
import { parseLocalIsoDate, toLocalIsoDate } from "~/utils/dates";

// ---------------------------------------------------------------------------
// Display formatters — the single source of truth for how a Products value is
// written on screen, per docs/patterns/page-recipes.md § "one format per value
// type, per module". These deliberately produce byte-identical output to the
// Purchases module's formatters (same Indonesian convention: `.` groups
// thousands, `,` separates two decimals, no space after `Rp`; dates as
// `21 Aug 2026`) — a user compares a product's buy price against a purchase
// invoice's line total, so the two modules must not write money two ways.
// If a third module needs these, promote them to a shared util rather than
// copying a third time.
// ---------------------------------------------------------------------------

const MONEY_FORMAT = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Quantities are not money: a stock figure of 1.250 units has no decimals to
// show unless it genuinely has them (0,5 kg), so this formatter groups
// thousands but only prints decimals that exist.
const QUANTITY_FORMAT = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

/** Money, for reading: `Rp1.500.000,00`, and `-Rp1.472.000,00` when negative.
 *
 *  The sign goes **outside** the symbol. Prefixing naively gives `Rp-1.472.000,00`,
 *  which reads as a currency called "Rp-" and buries the one character that
 *  changes the meaning of the figure. Stock adjustments are the first screens
 *  here that produce negative money at all, which is why this only surfaced
 *  now — the Purchases module never shows one. */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp${MONEY_FORMAT.format(Math.abs(value))}`;
}

/** The same number without the `Rp` — for a column whose header already says
 *  it holds money ("Buy price", "Sell price"). Shares MONEY_FORMAT with
 *  formatCurrency so the two can never disagree on separators or decimals. */
export function formatAmount(value: number): string {
  return MONEY_FORMAT.format(value);
}

/** Inverse of `formatAmount`, for an editable money field. `.` is a thousands
 *  separator and `,` the decimal point, so neither can just be stripped —
 *  `210.000,50` must come back as 210000.5, not 21000050. A bare digit string
 *  (what the user types once the field drops its formatting) parses as a whole
 *  number, which is the common case. */
export function parseAmount(text: string): number {
  const cleaned = String(text ?? "").replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;
  return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
}

/** Stock quantities: `1.250`, `0,5`. */
export function formatQuantity(value: number): string {
  return QUANTITY_FORMAT.format(value);
}

/** Whole counts with no decimals ever — the summary strip's "Total product". */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Dates, for reading: `21 Aug 2026`. Month-as-word deliberately — `21/08/2026`
 *  is ambiguous to anyone who reads `MM/DD`. The format a user *types* into
 *  MpDatePicker is a separate concern and stays `DD/MM/YYYY`
 *  (`DATE_INPUT_FORMAT` in `~/utils/dates`). */
export function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
  return parseLocalIsoDate(iso.slice(0, 10)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// "Today" for this prototype — the same anchor date the Purchases module uses,
// so a product's last-adjustment date and a purchase invoice's date sit on one
// timeline instead of describing two different presents.
function dateAt(daysFromToday: number): string {
  const d = new Date(2026, 8, 2);
  d.setDate(d.getDate() + daysFromToday);
  return toLocalIsoDate(d);
}

// ---------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------

/** Source: the product form's "Product type" radio group. A service has no
 *  stock, which is why the list shows "—" in its quantity columns. */
export type ProductType = "inventory" | "non_inventory" | "service";

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  inventory: "Inventory",
  non_inventory: "Non-inventory",
  service: "Service"
};

export const PRODUCT_TYPE_OPTIONS = Object.keys(PRODUCT_TYPE_LABEL) as ProductType[];

export const PRODUCT_CATEGORIES = [
  "Raw material",
  "Finished goods",
  "Packaging",
  "Spare part",
  "Office supply",
  "Service"
];

/** Kept in step with the Purchases module's WAREHOUSE_OPTIONS for the two it
 *  shares, so a purchase received into "Main Warehouse" lands somewhere this
 *  module also knows about. */
export const WAREHOUSE_OPTIONS = [
  "Main Warehouse",
  "Secondary Warehouse",
  "Bandung Depot",
  "Surabaya Hub"
];

export const UNIT_OPTIONS = ["Pcs", "Box", "Kg", "Roll", "Litre", "Set", "Hour"];

export const PRODUCT_TAG_OPTIONS = [
  "Fast moving",
  "Consignment",
  "Import",
  "Seasonal",
  "Promo",
  "Opname 2026"
];

/** Source: `filter-drawer.type-option` on the stock-adjustment list. */
export type AdjustmentType = "stock_count" | "in_out";

export const ADJUSTMENT_TYPE_LABEL: Record<AdjustmentType, string> = {
  stock_count: "Stock count",
  in_out: "In/out stock"
};

export const ADJUSTMENT_TYPE_OPTIONS = Object.keys(ADJUSTMENT_TYPE_LABEL) as AdjustmentType[];

/** The approvals tab mixes stock adjustments with product conversions, so it
 *  carries one extra type the stock-adjustment list never shows. Source:
 *  `approvals/i18n.json → filter-drawer.type-option`. */
export type ApprovalType = AdjustmentType | "product_conversion";

export const APPROVAL_TYPE_LABEL: Record<ApprovalType, string> = {
  ...ADJUSTMENT_TYPE_LABEL,
  product_conversion: "Product conversion"
};

export const APPROVAL_TYPE_OPTIONS = Object.keys(APPROVAL_TYPE_LABEL) as ApprovalType[];

/** Source: `price_rules/constants/index.js → TYPES`, grouped there into
 *  discount and markup families. */
export type PriceRuleType =
  | "percent"
  | "value"
  | "tier"
  | "subtotal_tier"
  | "end_discount"
  | "markup_percent"
  | "markup_value";

export const PRICE_RULE_TYPE_LABEL: Record<PriceRuleType, string> = {
  percent: "Discount percentage",
  value: "Discount value",
  tier: "Tiered discount",
  subtotal_tier: "Subtotal tiered discount",
  end_discount: "End discount",
  markup_percent: "Markup percentage",
  markup_value: "Markup value"
};

export const PRICE_RULE_TYPE_OPTIONS = Object.keys(PRICE_RULE_TYPE_LABEL) as PriceRuleType[];

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

/** Source: the product form's "Inventory tracking" radio group
 *  (`form/i18n.json → tracking_type`). Batch and serial each unlock their own
 *  tab on the detail page; only batch has a detail page of its own here. */
export type InventoryTracking = "qty" | "batch" | "serial";

export const INVENTORY_TRACKING_LABEL: Record<InventoryTracking, string> = {
  qty: "Only track qty",
  batch: "Track by batch",
  serial: "Track by serial number"
};

export const INVENTORY_TRACKING_OPTIONS = Object.keys(
  INVENTORY_TRACKING_LABEL
) as InventoryTracking[];

/** Chart-of-accounts names the product form's account selects offer. Kept as
 *  plain strings, not ids: this prototype has no chart of accounts to point at,
 *  and the detail page only ever renders the name. */
export const INVENTORY_ACCOUNT_OPTIONS = ["Inventory", "Work in Process", "Goods in Transit"];
export const BUY_ACCOUNT_OPTIONS = ["Purchases", "Cost of Goods Sold", "Operating Expense"];
export const SELL_ACCOUNT_OPTIONS = ["Sales Revenue", "Service Revenue", "Other Income"];
export const TAX_OPTIONS = ["", "PPN 11%", "PPN 12%", "PPh 23 (2%)"];

/** One component of a bundle product — the source's "Bundle components" table. */
export interface BundleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  /** Shown under the name in the Product name cell, like the source list. */
  description: string;
  code: string;
  barcode: string;
  category: string;
  type: ProductType;
  /** `YYYY-MM-DD`. Shown as "Created date" in the detail page's info section. */
  createdDate: string;
  /** The form's "Track stock for this item" checkbox. False for services and
   *  non-inventory items, which is also why their stock figures are `null`. */
  trackInventory: boolean;
  inventoryTracking: InventoryTracking;
  inventoryAccount: string;
  /** The form's "I buy this item" / "I sell this item" checkboxes — each gates
   *  a whole section of the form and of the detail page. */
  isBuy: boolean;
  buyAccount: string;
  buyTax: string;
  isSell: boolean;
  sellAccount: string;
  sellTax: string;
  /** Set when this product is a variant of a ProductMaster. */
  masterId: number | null;
  /** Populated only when `isBundle`. */
  bundleItems: BundleItem[];
  /** Stock on hand. `null` for a product whose stock isn't tracked (services,
   *  and inventory items with "Track stock" unchecked) — the source renders
   *  those cells empty rather than as a zero, and a zero would read as
   *  "out of stock" when the truth is "not counted". */
  quantity: number | null;
  /** On hand minus stock already committed to a fulfilment. */
  quantityAvailable: number | null;
  /** "Minimum stock" in the UI — the level below which the product counts as
   *  low on stock in the summary strip. */
  buffer: number | null;
  unit: string;
  avgPrice: number;
  lastBuyPrice: number;
  buyPrice: number;
  sellPrice: number;
  isBundle: boolean;
  isArchived: boolean;
  warehouse: string;
  tags: string[];
}

/** One row of a master's "Product variant list" table. A variant is a product
 *  in the real app; here it is a child record of the master, because the
 *  variants never appear in the flat Product list (that list has its own tab
 *  for masters precisely so variants don't flood it). */
export interface ProductVariant {
  id: number;
  /** "Kaos Polos Cotton Combed - M / Hitam" — the master's name plus its
   *  option values, which is how the source composes it (see the source's
   *  `tooltip.variant-name`). */
  name: string;
  /** The option values in attribute order, e.g. ["M", "Hitam"]. */
  options: string[];
  code: string;
  barcode: string;
  quantity: number;
  quantityAvailable: number;
  buffer: number;
  buyPrice: number;
  sellPrice: number;
}

/** A variant-defining attribute and its options — "Size: S, M, L, XL". The
 *  source caps a master at two attributes. */
export interface VariantAttribute {
  name: string;
  options: string[];
}

export const VARIANT_ATTRIBUTE_OPTIONS = ["Size", "Colour", "Material", "Flavour", "Capacity"];

/** The source's limit: two attributes per master
 *  (`master-form/i18n.json → tooltip.max-variant-attribute`). */
export const MAX_VARIANT_ATTRIBUTES = 2;

export interface ProductMaster {
  id: number;
  name: string;
  description: string;
  code: string;
  category: string;
  unit: string;
  /** How many variants sit under this master (Size × Colour, …). Derived from
   *  `variants` by `seedMaster` so the two can't disagree. */
  variantCount: number;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  isArchived: boolean;
  tags: string[];
  createdDate: string;
  trackInventory: boolean;
  inventoryTracking: InventoryTracking;
  inventoryAccount: string;
  isBuy: boolean;
  buyAccount: string;
  buyTax: string;
  isSell: boolean;
  sellAccount: string;
  sellTax: string;
  sellDiscountAccount: string;
  attributes: VariantAttribute[];
  variants: ProductVariant[];
}

/**
 * One product on a stock adjustment.
 *
 * `recorded` is what the system thought was there; `actual` is what the count
 * found (stock opname) or what the movement leaves behind (in/out). The
 * difference between them is the adjustment, and it is **derived, never
 * stored** — a stored third number is one that can disagree with the two it
 * came from, which is exactly the bug an adjustment screen exists to catch.
 */
export interface StockAdjustmentLine {
  productId: number;
  name: string;
  code: string;
  unit: string;
  recorded: number;
  actual: number;
  /** Costing price at the time, for valuing the difference. */
  avgPrice: number;
}

export function adjustmentDifference(line: StockAdjustmentLine): number {
  return line.actual - line.recorded;
}

/** What the difference is worth — the figure the journal entry would carry. */
export function adjustmentValue(line: StockAdjustmentLine): number {
  return adjustmentDifference(line) * line.avgPrice;
}

export function adjustmentTotalValue(lines: StockAdjustmentLine[]): number {
  return lines.reduce((sum, line) => sum + adjustmentValue(line), 0);
}

export interface StockAdjustment {
  id: number;
  /** `YYYY-MM-DD` — sorts and compares as a plain string. Rendered through
   *  `formatDisplayDate`; never stored pre-formatted. */
  date: string;
  number: string;
  adjustmentType: AdjustmentType;
  /** The adjustment's accounting category ("Stock opname", "Damaged", …) —
   *  the column the source labels "Category". */
  category: string;
  account: string;
  warehouse: string;
  memo: string;
  tags: string[];
  lines: StockAdjustmentLine[];
}

export interface ProductApproval {
  id: number;
  date: string;
  number: string;
  transactionType: ApprovalType;
  /** The accounting category the adjustment will carry once approved. The
   *  source's approval table doesn't show this column, but the record has one
   *  — and it has to, or an approved row would join the stock-adjustment list
   *  with nothing to put under "Category". Empty for a product conversion,
   *  which never joins that list. */
  category: string;
  account: string;
  warehouse: string;
  memo: string;
  tags: string[];
  /** Carried through approval, so the adjustment that joins the list has the
   *  same lines the approver reviewed. */
  lines: StockAdjustmentLine[];
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  /** Person in charge. */
  pic: string;
  description: string;
  isActive: boolean;
}

/**
 * A shelf, rack or bin inside a warehouse — the source's "multilevel storage".
 *
 * Kept deliberately flat: the source models levels as a configurable hierarchy
 * (row / rack / bin, named per warehouse), and its detail page has a whole tab
 * for defining those level names before any location can be created. That is a
 * settings feature; what the screens here need is the list of locations and
 * which warehouse each belongs to.
 */
export interface StorageLocation {
  id: number;
  warehouseId: number;
  code: string;
  name: string;
}

/** One product on a warehouse transfer. `quantity` is what moves;
 *  `quantityAtSource` is what the origin warehouse held before it did, which
 *  is what makes an over-transfer visible on the form. */
export interface TransferLine {
  productId: number;
  name: string;
  unit: string;
  quantity: number;
  quantityAtSource: number;
}

export interface WarehouseTransfer {
  id: number;
  date: string;
  number: string;
  fromWarehouse: string;
  toWarehouse: string;
  memo: string;
  lines: TransferLine[];
}

/** One step of a tiered rule: buy `threshold` or more, get `discount`. The
 *  source caps a rule at five tiers (`TIER_LIMIT`). */
export interface PriceRuleTier {
  threshold: number;
  discount: number;
}

export const PRICE_RULE_TIER_LIMIT = 5;

/** Which of the three shapes a rule type takes, so the form renders one field
 *  set rather than a chain of `v-if="ruleType === …"`. Same data-driven idea as
 *  the Purchase module's TYPE_CAPABILITIES. */
export type PriceRuleShape = "percent" | "amount" | "tier";

export const PRICE_RULE_SHAPE: Record<PriceRuleType, PriceRuleShape> = {
  percent: "percent",
  markup_percent: "percent",
  value: "amount",
  markup_value: "amount",
  end_discount: "amount",
  tier: "tier",
  subtotal_tier: "tier"
};

/** The tier column's meaning differs between the two tiered types: `tier` steps
 *  by quantity, `subtotal_tier` by the sales subtotal. */
export const PRICE_RULE_TIER_LABEL: Record<string, string> = {
  tier: "Qty",
  subtotal_tier: "Subtotal amount"
};

/**
 * Active / inactive — the one status vocabulary this module has. Warehouses and
 * price rules both use it.
 *
 * A record, not an inline ternary at each call site: the domain status → badge
 * `type` mapping lives in exactly one place, so a third screen can't quietly
 * pick a different colour for the same word
 * (docs/patterns/StatusBadge.md, `references/rules.md` Tier 2).
 */
export type ActiveStatus = "active" | "inactive";

export const ACTIVE_STATUS_LABEL: Record<ActiveStatus, string> = {
  active: "Active",
  inactive: "Inactive"
};

export const ACTIVE_STATUS_TYPE: Record<ActiveStatus, "completed" | "critical"> = {
  active: "completed",
  inactive: "critical"
};

export const CONTACT_OPTIONS = [
  "PT Sumber Rejeki",
  "CV Maju Bersama",
  "Toko Aneka Jaya",
  "PT Karya Mandiri",
  "UD Sinar Terang",
  "PT Bina Usaha"
];

export interface PriceRule {
  id: number;
  name: string;
  ruleType: PriceRuleType;
  /** `YYYY-MM-DD`; both "" means the rule has no period and always applies. */
  startDate: string;
  endDate: string;
  /** A percentage for the `percent` shape, an amount for `amount`. Unused by
   *  `tier`, which carries its steps in `tiers` instead. */
  amount: number;
  tiers: PriceRuleTier[];
  /** Product names the rule covers. **Empty means "All products"** — the
   *  source's apply-all state, which is not the same as a rule covering
   *  nothing (it also picks up products created later). Same for `contacts`. */
  products: string[];
  contacts: string[];
  isActive: boolean;
}

/** "18 products" / "All products" — the left half of the list's
 *  "Product & contact" column. Derived rather than stored, so the summary can't
 *  disagree with the list the form actually edits. */
export function priceRuleScopeSummary(items: string[], noun: "product" | "contact"): string {
  if (items.length === 0) return `All ${noun}s`;
  return `${items.length} ${noun}${items.length === 1 ? "" : "s"}`;
}

// ---------------------------------------------------------------------------
// Mock records
// ---------------------------------------------------------------------------

/**
 * A product record as written below: every field that varies between the mock
 * products, and none of the ones that don't.
 *
 * The detail page and the product form need a dozen fields the list never shows
 * (accounts, taxes, tracking mode, created date, …). Almost all of them are the
 * same across the catalogue, so `seedProduct` fills them in and each literal
 * overrides only what is actually different. Writing them out twenty times over
 * would bury the fields that do vary — which are the ones a reader is looking
 * for — under a wall of identical lines.
 */
type ProductSeed = Omit<Product, keyof typeof PRODUCT_DEFAULTS | "createdDate"> &
  Partial<Pick<Product, keyof typeof PRODUCT_DEFAULTS | "createdDate">>;

const PRODUCT_DEFAULTS = {
  trackInventory: true,
  inventoryTracking: "qty" as InventoryTracking,
  inventoryAccount: "Inventory",
  isBuy: true,
  buyAccount: "Purchases",
  buyTax: "PPN 11%",
  isSell: true,
  sellAccount: "Sales Revenue",
  sellTax: "PPN 11%",
  masterId: null as number | null,
  bundleItems: [] as BundleItem[]
};

/** Created dates are spread deterministically backwards from the anchor date so
 *  the catalogue reads as one built up over time, without twenty more literals. */
function seedProduct(seed: ProductSeed): Product {
  return {
    ...PRODUCT_DEFAULTS,
    ...seed,
    createdDate: seed.createdDate ?? dateAt(-420 + seed.id * 13)
  };
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: 1,
    name: "Kertas HVS A4 80gsm",
    description: "Rim isi 500 lembar",
    code: "PRD-0001",
    barcode: "8991234500018",
    category: "Office supply",
    type: "inventory",
    quantity: 1240,
    quantityAvailable: 1180,
    buffer: 300,
    unit: "Rim",
    avgPrice: 47_500,
    lastBuyPrice: 48_000,
    buyPrice: 48_000,
    sellPrice: 62_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Main Warehouse",
    tags: ["Fast moving"]
  },
  {
    id: 2,
    name: "Tinta Printer Hitam",
    description: "Botol 70ml, refill",
    code: "PRD-0002",
    barcode: "8991234500025",
    category: "Office supply",
    type: "inventory",
    quantity: 86,
    quantityAvailable: 74,
    buffer: 120,
    unit: "Pcs",
    avgPrice: 92_000,
    lastBuyPrice: 95_000,
    buyPrice: 95_000,
    sellPrice: 138_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Main Warehouse",
    tags: ["Fast moving"]
  },
  {
    id: 3,
    name: "Kardus Packing 40x30x20",
    description: "Single wall, coklat",
    code: "PRD-0003",
    barcode: "8991234500032",
    category: "Packaging",
    type: "inventory",
    quantity: 0,
    quantityAvailable: 0,
    buffer: 500,
    unit: "Pcs",
    avgPrice: 4_200,
    lastBuyPrice: 4_400,
    buyPrice: 4_400,
    sellPrice: 6_500,
    isBundle: false,
    isArchived: false,
    warehouse: "Secondary Warehouse",
    tags: ["Fast moving", "Consignment"]
  },
  {
    id: 4,
    name: "Lakban Bening 2 inch",
    description: "Roll 90 yard",
    code: "PRD-0004",
    barcode: "8991234500049",
    category: "Packaging",
    type: "inventory",
    quantity: 640,
    quantityAvailable: 612,
    buffer: 200,
    unit: "Roll",
    avgPrice: 12_800,
    lastBuyPrice: 13_200,
    buyPrice: 13_200,
    sellPrice: 19_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Main Warehouse",
    tags: []
  },
  {
    id: 5,
    name: "Resin Epoksi Bening",
    description: "Grade industri, drum 20L",
    code: "PRD-0005",
    barcode: "8991234500056",
    category: "Raw material",
    type: "inventory",
    quantity: 42,
    quantityAvailable: 30,
    buffer: 60,
    unit: "Litre",
    avgPrice: 310_000,
    lastBuyPrice: 325_000,
    buyPrice: 325_000,
    sellPrice: 448_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Bandung Depot",
    tags: ["Import"],
    // Chemicals are tracked per batch so an expiry date can be held against
    // each intake — this is what unlocks the detail page's Batch info tab and
    // the batch detail route.
    inventoryTracking: "batch",
    buyTax: "PPN 12%"
  },
  {
    id: 6,
    name: "Pigmen Warna Biru",
    description: "Serbuk, kemasan 1kg",
    code: "PRD-0006",
    barcode: "8991234500063",
    category: "Raw material",
    type: "inventory",
    quantity: 118,
    quantityAvailable: 118,
    buffer: 40,
    unit: "Kg",
    avgPrice: 186_000,
    lastBuyPrice: 190_000,
    buyPrice: 190_000,
    sellPrice: 265_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Bandung Depot",
    tags: ["Import"],
    inventoryTracking: "batch"
  },
  {
    id: 7,
    name: "Meja Kerja Minimalis 120cm",
    description: "Rangka besi, top HPL",
    code: "PRD-0007",
    barcode: "8991234500070",
    category: "Finished goods",
    type: "inventory",
    quantity: 58,
    quantityAvailable: 46,
    buffer: 20,
    unit: "Pcs",
    avgPrice: 1_120_000,
    lastBuyPrice: 1_150_000,
    buyPrice: 1_150_000,
    sellPrice: 1_780_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Surabaya Hub",
    tags: ["Seasonal"]
  },
  {
    id: 8,
    name: "Kursi Kantor Ergonomis",
    description: "Mesh, sandaran tinggi",
    code: "PRD-0008",
    barcode: "8991234500087",
    category: "Finished goods",
    type: "inventory",
    quantity: 12,
    quantityAvailable: 8,
    buffer: 25,
    unit: "Pcs",
    avgPrice: 1_640_000,
    lastBuyPrice: 1_690_000,
    buyPrice: 1_690_000,
    sellPrice: 2_450_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Surabaya Hub",
    tags: ["Seasonal", "Promo"]
  },
  {
    id: 9,
    name: "Paket Set Kantor Hemat",
    description: "Meja + kursi + lampu meja",
    code: "PRD-0009",
    barcode: "8991234500094",
    category: "Finished goods",
    type: "inventory",
    quantity: 24,
    quantityAvailable: 24,
    buffer: 10,
    unit: "Set",
    avgPrice: 2_980_000,
    lastBuyPrice: 3_050_000,
    buyPrice: 3_050_000,
    sellPrice: 4_390_000,
    isBundle: true,
    isArchived: false,
    warehouse: "Surabaya Hub",
    tags: ["Promo"],
    // The components the bundle is assembled from — the source's "Bundle
    // components" table, and what the Convert product flow consumes.
    bundleItems: [
      { productId: 7, name: "Meja Kerja Minimalis 120cm", quantity: 1, price: 1_150_000 },
      { productId: 8, name: "Kursi Kantor Ergonomis", quantity: 1, price: 1_690_000 },
      { productId: 10, name: "Lampu Meja LED", quantity: 1, price: 224_000 }
    ]
  },
  {
    id: 10,
    name: "Lampu Meja LED",
    description: "3 tingkat kecerahan, USB-C",
    code: "PRD-0010",
    barcode: "8991234500100",
    category: "Finished goods",
    type: "inventory",
    quantity: 210,
    quantityAvailable: 186,
    buffer: 50,
    unit: "Pcs",
    avgPrice: 218_000,
    lastBuyPrice: 224_000,
    buyPrice: 224_000,
    sellPrice: 349_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Main Warehouse",
    tags: [],
    // Electronics carry a warranty, so each unit is tracked individually.
    inventoryTracking: "serial"
  },
  {
    id: 11,
    name: "Bearing 6203ZZ",
    description: "Diameter dalam 17mm",
    code: "PRD-0011",
    barcode: "8991234500117",
    category: "Spare part",
    type: "inventory",
    quantity: 4,
    quantityAvailable: 4,
    buffer: 80,
    unit: "Pcs",
    avgPrice: 28_000,
    lastBuyPrice: 29_500,
    buyPrice: 29_500,
    sellPrice: 44_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Bandung Depot",
    tags: []
  },
  {
    id: 12,
    name: "V-Belt A-42",
    description: "Karet, sabuk transmisi",
    code: "PRD-0012",
    barcode: "8991234500124",
    category: "Spare part",
    type: "inventory",
    quantity: 0,
    quantityAvailable: 0,
    buffer: 30,
    unit: "Pcs",
    avgPrice: 62_000,
    lastBuyPrice: 64_500,
    buyPrice: 64_500,
    sellPrice: 92_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Bandung Depot",
    tags: []
  },
  {
    id: 13,
    name: "Oli Hidrolik ISO 46",
    description: "Jerigen 20 litre",
    code: "PRD-0013",
    barcode: "8991234500131",
    category: "Spare part",
    type: "inventory",
    quantity: 76,
    quantityAvailable: 68,
    buffer: 20,
    unit: "Litre",
    avgPrice: 44_000,
    lastBuyPrice: 45_800,
    buyPrice: 45_800,
    sellPrice: 68_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Main Warehouse",
    tags: ["Fast moving"]
  },
  {
    id: 14,
    name: "Sarung Tangan Katun",
    description: "Pak isi 12 pasang",
    code: "PRD-0014",
    barcode: "8991234500148",
    category: "Office supply",
    type: "inventory",
    quantity: 340,
    quantityAvailable: 316,
    buffer: 100,
    unit: "Box",
    avgPrice: 58_000,
    lastBuyPrice: 60_000,
    buyPrice: 60_000,
    sellPrice: 86_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Secondary Warehouse",
    tags: []
  },
  {
    id: 15,
    name: "Plastik Wrap Palet",
    description: "Lebar 50cm, 2,5kg",
    code: "PRD-0015",
    barcode: "8991234500155",
    category: "Packaging",
    type: "inventory",
    quantity: 92,
    quantityAvailable: 80,
    buffer: 40,
    unit: "Roll",
    avgPrice: 96_000,
    lastBuyPrice: 99_000,
    buyPrice: 99_000,
    sellPrice: 142_000,
    isBundle: false,
    isArchived: false,
    warehouse: "Secondary Warehouse",
    tags: ["Consignment"]
  },
  {
    id: 16,
    name: "Jasa Instalasi Furnitur",
    description: "Per titik pemasangan",
    code: "SRV-0001",
    barcode: "",
    category: "Service",
    type: "service",
    // A service has nothing to count — see the `quantity` field doc.
    quantity: null,
    quantityAvailable: null,
    buffer: null,
    unit: "Hour",
    avgPrice: 0,
    lastBuyPrice: 0,
    buyPrice: 120_000,
    sellPrice: 250_000,
    isBundle: false,
    isArchived: false,
    warehouse: "",
    tags: [],
    // Nothing to track, so no inventory account either — the detail page and
    // the form both hide that whole section when this is false.
    trackInventory: false,
    inventoryAccount: "",
    buyAccount: "Operating Expense",
    sellAccount: "Service Revenue"
  },
  {
    id: 17,
    name: "Jasa Pengiriman Dalam Kota",
    description: "Maksimal 50kg per rit",
    code: "SRV-0002",
    barcode: "",
    category: "Service",
    type: "service",
    quantity: null,
    quantityAvailable: null,
    buffer: null,
    unit: "Hour",
    avgPrice: 0,
    lastBuyPrice: 0,
    buyPrice: 85_000,
    sellPrice: 160_000,
    isBundle: false,
    isArchived: false,
    warehouse: "",
    tags: [],
    trackInventory: false,
    inventoryAccount: "",
    buyAccount: "Operating Expense",
    sellAccount: "Service Revenue"
  },
  {
    id: 18,
    name: "Biaya Kirim Ekspedisi",
    description: "Dibebankan ke pelanggan",
    code: "NIV-0001",
    barcode: "",
    category: "Service",
    type: "non_inventory",
    quantity: null,
    quantityAvailable: null,
    buffer: null,
    unit: "Pcs",
    avgPrice: 0,
    lastBuyPrice: 0,
    buyPrice: 0,
    sellPrice: 45_000,
    isBundle: false,
    isArchived: false,
    warehouse: "",
    tags: [],
    trackInventory: false,
    inventoryAccount: "",
    // A cost re-billed to the customer: sold, never bought. `isBuy: false`
    // removes the whole Buying info section from both its screens.
    isBuy: false,
    buyAccount: "",
    buyTax: "",
    sellAccount: "Other Income"
  },
  {
    id: 19,
    name: "Kertas HVS A4 70gsm",
    description: "Dihentikan, ganti ke 80gsm",
    code: "PRD-0016",
    barcode: "8991234500162",
    category: "Office supply",
    type: "inventory",
    quantity: 18,
    quantityAvailable: 18,
    buffer: 0,
    unit: "Rim",
    avgPrice: 41_000,
    lastBuyPrice: 41_000,
    buyPrice: 41_000,
    sellPrice: 55_000,
    isBundle: false,
    // Archived products are hidden until the filter drawer's "Show archived"
    // is ticked — matching the source's `show-archived` switch.
    isArchived: true,
    warehouse: "Main Warehouse",
    tags: []
  },
  {
    id: 20,
    name: "Stiker Label Barcode",
    description: "Dihentikan per Q2 2026",
    code: "PRD-0017",
    barcode: "8991234500179",
    category: "Packaging",
    type: "inventory",
    quantity: 0,
    quantityAvailable: 0,
    buffer: 0,
    unit: "Roll",
    avgPrice: 34_000,
    lastBuyPrice: 34_000,
    buyPrice: 34_000,
    sellPrice: 49_000,
    isBundle: false,
    isArchived: true,
    warehouse: "Secondary Warehouse",
    tags: []
  }
];

const PRODUCTS: Product[] = PRODUCT_SEEDS.map(seedProduct);

/**
 * A master as written below. Same trick as `ProductSeed`: the shared fields
 * (accounts, taxes, tracking) come from defaults, and — the part that matters
 * here — the **variants are generated** rather than listed.
 *
 * That is not a shortcut, it is the source's own model: a master's variants
 * ARE the cartesian product of its attributes' options (Size × Colour → 12
 * variants), which is why the source resets the whole variant table whenever an
 * attribute changes (`change-attribute-modal`). Listing 37 variants by hand
 * would let the list drift out of step with the attributes above it — exactly
 * the inconsistency the real form makes impossible.
 */
type ProductMasterSeed = Omit<
  ProductMaster,
  keyof typeof MASTER_DEFAULTS | "createdDate" | "variantCount" | "variants"
> &
  Partial<Pick<ProductMaster, keyof typeof MASTER_DEFAULTS | "createdDate">>;

const MASTER_DEFAULTS = {
  trackInventory: true,
  inventoryTracking: "qty" as InventoryTracking,
  inventoryAccount: "Inventory",
  isBuy: true,
  buyAccount: "Purchases",
  buyTax: "PPN 11%",
  isSell: true,
  sellAccount: "Sales Revenue",
  sellTax: "PPN 11%",
  sellDiscountAccount: ""
};

/** Every combination of the attributes' options, in attribute order — ["S","Hitam"],
 *  ["S","Putih"], … The source builds its variant table the same way. */
function optionCombinations(attributes: VariantAttribute[]): string[][] {
  return attributes.reduce<string[][]>(
    (rows, attribute) => rows.flatMap((row) => attribute.options.map((option) => [...row, option])),
    [[]]
  );
}

function seedMaster(seed: ProductMasterSeed): ProductMaster {
  const combinations = optionCombinations(seed.attributes);
  // Spread the master's total stock across its variants, remainder on the
  // first — so the variant rows always add up to the total shown above them.
  const per = Math.floor(seed.quantity / Math.max(1, combinations.length));
  const remainder = seed.quantity - per * combinations.length;

  const variants: ProductVariant[] = combinations.map((options, index) => {
    const quantity = per + (index === 0 ? remainder : 0);
    return {
      id: seed.id * 100 + index + 1,
      name: `${seed.name} - ${options.join(" / ")}`,
      options,
      code: `${seed.code}-${String(index + 1).padStart(2, "0")}`,
      barcode: `899${seed.code.replace(/\D/g, "")}${String(index + 1).padStart(4, "0")}`,
      quantity,
      // A slice of each variant's stock is committed to open fulfilments.
      quantityAvailable: Math.max(0, quantity - (index % 3) * 2),
      buffer: seed.quantity > 0 ? 10 : 0,
      buyPrice: seed.buyPrice,
      sellPrice: seed.sellPrice
    };
  });

  return {
    ...MASTER_DEFAULTS,
    ...seed,
    createdDate: seed.createdDate ?? dateAt(-380 + (seed.id - 100) * 21),
    variantCount: variants.length,
    variants
  };
}

const PRODUCT_MASTER_SEEDS: ProductMasterSeed[] = [
  {
    id: 101,
    name: "Kaos Polos Cotton Combed",
    description: "Varian ukuran \u00d7 warna",
    code: "MST-0001",
    category: "Finished goods",
    unit: "Pcs",
    quantity: 1_840,
    buyPrice: 42_000,
    sellPrice: 79_000,
    isArchived: false,
    tags: ["Fast moving"],
    attributes: [
      { name: "Size", options: ["S", "M", "L", "XL"] },
      { name: "Colour", options: ["Hitam", "Putih", "Navy"] }
    ]
  },
  {
    id: 102,
    name: "Sepatu Kanvas Slip-On",
    description: "Varian ukuran 38\u201344",
    code: "MST-0002",
    category: "Finished goods",
    unit: "Pcs",
    quantity: 420,
    buyPrice: 168_000,
    sellPrice: 289_000,
    isArchived: false,
    tags: ["Seasonal"],
    attributes: [{ name: "Size", options: ["38", "39", "40", "41", "42", "43", "44"] }]
  },
  {
    id: 103,
    name: "Tas Ransel Laptop 15 inch",
    description: "Varian warna",
    code: "MST-0003",
    category: "Finished goods",
    unit: "Pcs",
    quantity: 268,
    buyPrice: 215_000,
    sellPrice: 359_000,
    isArchived: false,
    tags: [],
    attributes: [{ name: "Colour", options: ["Hitam", "Abu", "Navy", "Maroon"] }]
  },
  {
    id: 104,
    name: "Botol Minum Stainless 750ml",
    description: "Varian warna \u00d7 bahan",
    code: "MST-0004",
    category: "Finished goods",
    unit: "Pcs",
    quantity: 912,
    buyPrice: 76_000,
    sellPrice: 139_000,
    isArchived: false,
    tags: ["Promo"],
    attributes: [
      { name: "Colour", options: ["Silver", "Hitam", "Biru"] },
      { name: "Material", options: ["Stainless", "Coated"] }
    ]
  },
  {
    id: 105,
    name: "Cat Tembok Interior",
    description: "Varian ukuran kaleng",
    code: "MST-0005",
    category: "Raw material",
    unit: "Litre",
    quantity: 156,
    buyPrice: 128_000,
    sellPrice: 198_000,
    isArchived: false,
    tags: [],
    attributes: [{ name: "Capacity", options: ["1L", "2,5L", "5L"] }]
  },
  {
    id: 106,
    name: "Notebook Custom Cover",
    description: "Dihentikan, stok habis",
    code: "MST-0006",
    category: "Office supply",
    unit: "Pcs",
    quantity: 0,
    buyPrice: 24_000,
    sellPrice: 45_000,
    isArchived: true,
    tags: [],
    attributes: [{ name: "Colour", options: ["Kraft", "Hitam", "Biru", "Merah", "Hijau"] }]
  }
];

const PRODUCT_MASTERS: ProductMaster[] = PRODUCT_MASTER_SEEDS.map(seedMaster);

// ---------------------------------------------------------------------------
// Line generation for the movement records below.
//
// Same reasoning as the master's variants: hand-writing lines for 33 records
// would produce numbers that don't reconcile with the catalogue they claim to
// move, and a reader checking "does this adjustment match the product's stock?"
// would find it doesn't. Generating them from PRODUCTS keeps every line's
// `recorded` figure equal to the product's real quantity, so the arithmetic on
// screen is arithmetic a user could redo.
// ---------------------------------------------------------------------------

/** Tracked products only — nothing else can appear on an adjustment or a
 *  transfer, because nothing else has a quantity to move. */
function movableProducts(): Product[] {
  return PRODUCTS.filter((p) => p.trackInventory && !p.isArchived && p.quantity !== null);
}

/** A small, stable slice of the catalogue for a given record id. Deterministic
 *  so a record's lines never change between reads. */
function productsForRecord(recordId: number, count: number): Product[] {
  const pool = movableProducts();
  if (pool.length === 0) return [];
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    return pool[(recordId + i * 3) % pool.length]!;
  });
}

function adjustmentLinesFor(recordId: number, type: AdjustmentType): StockAdjustmentLine[] {
  return productsForRecord(recordId, 2 + (recordId % 2)).map((product, index) => {
    const recorded = product.quantity ?? 0;
    // A stock count usually finds a small shortfall; an in/out movement is a
    // deliberate, larger change. Signs alternate so a list isn't all one way.
    const magnitude =
      type === "stock_count"
        ? Math.max(1, Math.round(recorded * 0.02))
        : Math.max(1, Math.round(recorded * 0.1));
    const direction = (recordId + index) % 3 === 0 ? 1 : -1;
    return {
      productId: product.id,
      name: product.name,
      code: product.code,
      unit: product.unit,
      recorded,
      actual: Math.max(0, recorded + magnitude * direction),
      avgPrice: product.avgPrice
    };
  });
}

function transferLinesFor(recordId: number): TransferLine[] {
  return productsForRecord(recordId, 2 + (recordId % 2)).map((product) => {
    const atSource = product.quantity ?? 0;
    return {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      // A transfer moves a slice of what the source holds, never more.
      quantity: Math.max(1, Math.round(atSource * 0.15)),
      quantityAtSource: atSource
    };
  });
}

type StockAdjustmentSeed = Omit<StockAdjustment, "lines">;
function seedAdjustment(seed: StockAdjustmentSeed): StockAdjustment {
  return { ...seed, lines: adjustmentLinesFor(seed.id, seed.adjustmentType) };
}

type ProductApprovalSeed = Omit<ProductApproval, "lines">;
function seedApproval(seed: ProductApprovalSeed): ProductApproval {
  return {
    ...seed,
    // A product conversion has no adjustment lines — it is its own kind of
    // record, and approving one doesn't produce a stock adjustment.
    lines:
      seed.transactionType === "product_conversion"
        ? []
        : adjustmentLinesFor(seed.id, seed.transactionType)
  };
}

type WarehouseTransferSeed = Omit<WarehouseTransfer, "lines">;
function seedTransfer(seed: WarehouseTransferSeed): WarehouseTransfer {
  return { ...seed, lines: transferLinesFor(seed.id) };
}

const STOCK_ADJUSTMENT_SEEDS: StockAdjustmentSeed[] = [
  {
    id: 201,
    date: dateAt(-1),
    number: "ADJ/2026/09/0014",
    adjustmentType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Main Warehouse",
    memo: "Opname bulanan gudang utama",
    tags: ["Opname 2026"]
  },
  {
    id: 202,
    date: dateAt(-3),
    number: "ADJ/2026/08/0013",
    adjustmentType: "in_out",
    category: "Damaged goods",
    account: "Cost of Goods Sold",
    warehouse: "Secondary Warehouse",
    memo: "Kardus basah karena bocor atap",
    tags: []
  },
  {
    id: 203,
    date: dateAt(-6),
    number: "ADJ/2026/08/0012",
    adjustmentType: "in_out",
    category: "Sample & promotion",
    account: "Marketing Expense",
    warehouse: "Surabaya Hub",
    memo: "Sampel pameran furnitur",
    tags: ["Promo"]
  },
  {
    id: 204,
    date: dateAt(-9),
    number: "ADJ/2026/08/0011",
    adjustmentType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Bandung Depot",
    memo: "",
    tags: ["Opname 2026"]
  },
  {
    id: 205,
    date: dateAt(-12),
    number: "ADJ/2026/08/0010",
    adjustmentType: "in_out",
    category: "Production usage",
    account: "Work in Process",
    warehouse: "Bandung Depot",
    memo: "Pemakaian resin batch #48",
    tags: []
  },
  {
    id: 206,
    date: dateAt(-15),
    number: "ADJ/2026/08/0009",
    adjustmentType: "in_out",
    category: "Damaged goods",
    account: "Cost of Goods Sold",
    warehouse: "Main Warehouse",
    memo: "",
    tags: []
  },
  {
    id: 207,
    date: dateAt(-19),
    number: "ADJ/2026/08/0008",
    adjustmentType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Secondary Warehouse",
    memo: "Opname triwulan",
    tags: ["Opname 2026"]
  },
  {
    id: 208,
    date: dateAt(-23),
    number: "ADJ/2026/08/0007",
    adjustmentType: "in_out",
    category: "Return to vendor",
    account: "Inventory Adjustment",
    warehouse: "Bandung Depot",
    memo: "Bearing tidak sesuai spesifikasi",
    tags: ["Import"]
  },
  {
    id: 209,
    date: dateAt(-27),
    number: "ADJ/2026/08/0006",
    adjustmentType: "in_out",
    category: "Sample & promotion",
    account: "Marketing Expense",
    warehouse: "Surabaya Hub",
    memo: "",
    tags: ["Promo"]
  },
  {
    id: 210,
    date: dateAt(-31),
    number: "ADJ/2026/08/0005",
    adjustmentType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Main Warehouse",
    memo: "Opname bulanan",
    tags: ["Opname 2026"]
  },
  {
    id: 211,
    date: dateAt(-35),
    number: "ADJ/2026/07/0004",
    adjustmentType: "in_out",
    category: "Production usage",
    account: "Work in Process",
    warehouse: "Bandung Depot",
    memo: "Pigmen batch #47",
    tags: []
  },
  {
    id: 212,
    date: dateAt(-40),
    number: "ADJ/2026/07/0003",
    adjustmentType: "in_out",
    category: "Damaged goods",
    account: "Cost of Goods Sold",
    warehouse: "Surabaya Hub",
    memo: "Kursi rusak saat bongkar muat",
    tags: []
  },
  {
    id: 213,
    date: dateAt(-46),
    number: "ADJ/2026/07/0002",
    adjustmentType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Surabaya Hub",
    memo: "",
    tags: ["Opname 2026"]
  },
  {
    id: 214,
    date: dateAt(-52),
    number: "ADJ/2026/07/0001",
    adjustmentType: "in_out",
    category: "Return to vendor",
    account: "Inventory Adjustment",
    warehouse: "Main Warehouse",
    memo: "",
    tags: []
  }
];

const STOCK_ADJUSTMENTS: StockAdjustment[] = STOCK_ADJUSTMENT_SEEDS.map(seedAdjustment);

const PRODUCT_APPROVAL_SEEDS: ProductApprovalSeed[] = [
  {
    id: 301,
    date: dateAt(0),
    number: "ADJ/2026/09/0016",
    transactionType: "stock_count",
    category: "Stock opname",
    account: "Inventory Adjustment",
    warehouse: "Main Warehouse",
    memo: "Opname mendadak, selisih 42 rim",
    tags: ["Opname 2026"]
  },
  {
    id: 302,
    date: dateAt(0),
    number: "ADJ/2026/09/0015",
    transactionType: "in_out",
    category: "Damaged goods",
    account: "Cost of Goods Sold",
    warehouse: "Secondary Warehouse",
    memo: "",
    tags: []
  },
  {
    id: 303,
    date: dateAt(-2),
    number: "CNV/2026/09/0003",
    transactionType: "product_conversion",
    category: "",
    account: "Work in Process",
    warehouse: "Bandung Depot",
    memo: "Resin drum 20L → botol 1L",
    tags: []
  },
  {
    id: 304,
    date: dateAt(-4),
    number: "CNV/2026/08/0002",
    transactionType: "product_conversion",
    category: "",
    account: "Work in Process",
    warehouse: "Bandung Depot",
    memo: "",
    tags: ["Import"]
  },
  {
    id: 305,
    date: dateAt(-5),
    number: "ADJ/2026/08/0017",
    transactionType: "in_out",
    category: "Sample & promotion",
    account: "Marketing Expense",
    warehouse: "Surabaya Hub",
    memo: "Sampel untuk klien korporat",
    tags: ["Promo"]
  }
];

const PRODUCT_APPROVALS: ProductApproval[] = PRODUCT_APPROVAL_SEEDS.map(seedApproval);

const WAREHOUSES: Warehouse[] = [
  {
    id: 401,
    code: "WH-001",
    name: "Main Warehouse",
    address: "Jl. Raya Bekasi KM 21, Jakarta Timur",
    pic: "Budi Santoso",
    description: "Gudang pusat, semua kategori",
    isActive: true
  },
  {
    id: 402,
    code: "WH-002",
    name: "Secondary Warehouse",
    address: "Kawasan Industri Pulogadung Blok C7, Jakarta Timur",
    pic: "Rina Wulandari",
    description: "Packaging dan barang habis pakai",
    isActive: true
  },
  {
    id: 403,
    code: "WH-003",
    name: "Bandung Depot",
    address: "Jl. Soekarno Hatta No. 412, Bandung",
    pic: "Agus Prasetyo",
    description: "Bahan baku dan spare part",
    isActive: true
  },
  {
    id: 404,
    code: "WH-004",
    name: "Surabaya Hub",
    address: "Jl. Rungkut Industri III No. 18, Surabaya",
    pic: "Dewi Lestari",
    description: "Distribusi Jawa Timur",
    isActive: true
  },
  {
    id: 405,
    code: "WH-005",
    name: "Semarang Transit",
    address: "Jl. Kaligawe Raya KM 5, Semarang",
    pic: "Fajar Nugroho",
    description: "Transit antar hub",
    isActive: true
  },
  {
    id: 406,
    code: "WH-006",
    name: "Medan Depot",
    address: "Jl. Gatot Subroto No. 220, Medan",
    pic: "Sari Handayani",
    description: "Belum beroperasi",
    isActive: false
  },
  {
    id: 407,
    code: "WH-007",
    name: "Gudang Retur",
    address: "Jl. Raya Bekasi KM 21 (Blok B), Jakarta Timur",
    pic: "Budi Santoso",
    description: "Ditutup, digabung ke gudang pusat",
    isActive: false
  }
];

const WAREHOUSE_TRANSFER_SEEDS: WarehouseTransferSeed[] = [
  {
    id: 501,
    date: dateAt(-1),
    number: "WT/2026/09/0021",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Surabaya Hub",
    memo: "Restock furnitur menjelang pameran"
  },
  {
    id: 502,
    date: dateAt(-4),
    number: "WT/2026/08/0020",
    fromWarehouse: "Secondary Warehouse",
    toWarehouse: "Main Warehouse",
    memo: ""
  },
  {
    id: 503,
    date: dateAt(-7),
    number: "WT/2026/08/0019",
    fromWarehouse: "Bandung Depot",
    toWarehouse: "Main Warehouse",
    memo: "Pengiriman resin untuk produksi Jakarta"
  },
  {
    id: 504,
    date: dateAt(-10),
    number: "WT/2026/08/0018",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Semarang Transit",
    memo: ""
  },
  {
    id: 505,
    date: dateAt(-14),
    number: "WT/2026/08/0017",
    fromWarehouse: "Semarang Transit",
    toWarehouse: "Surabaya Hub",
    memo: "Lanjutan transit dari Jakarta"
  },
  {
    id: 506,
    date: dateAt(-18),
    number: "WT/2026/08/0016",
    fromWarehouse: "Surabaya Hub",
    toWarehouse: "Main Warehouse",
    memo: "Retur kursi rusak"
  },
  {
    id: 507,
    date: dateAt(-22),
    number: "WT/2026/08/0015",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Bandung Depot",
    memo: ""
  },
  {
    id: 508,
    date: dateAt(-26),
    number: "WT/2026/08/0014",
    fromWarehouse: "Secondary Warehouse",
    toWarehouse: "Surabaya Hub",
    memo: "Packaging untuk pengiriman Q3"
  },
  {
    id: 509,
    date: dateAt(-33),
    number: "WT/2026/07/0013",
    fromWarehouse: "Bandung Depot",
    toWarehouse: "Semarang Transit",
    memo: ""
  },
  {
    id: 510,
    date: dateAt(-39),
    number: "WT/2026/07/0012",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Secondary Warehouse",
    memo: "Pemindahan stok lambat"
  }
];

const WAREHOUSE_TRANSFERS: WarehouseTransfer[] = WAREHOUSE_TRANSFER_SEEDS.map(seedTransfer);

const WAREHOUSE_APPROVAL_SEEDS: WarehouseTransferSeed[] = [
  {
    id: 601,
    date: dateAt(0),
    number: "WT/2026/09/0023",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Medan Depot",
    memo: "Stok pembuka depot baru"
  },
  {
    id: 602,
    date: dateAt(0),
    number: "WT/2026/09/0022",
    fromWarehouse: "Bandung Depot",
    toWarehouse: "Surabaya Hub",
    memo: ""
  },
  {
    id: 603,
    date: dateAt(-2),
    number: "WT/2026/09/0024",
    fromWarehouse: "Surabaya Hub",
    toWarehouse: "Semarang Transit",
    memo: "Konsolidasi stok musiman"
  },
  {
    id: 604,
    date: dateAt(-3),
    number: "WT/2026/08/0025",
    fromWarehouse: "Secondary Warehouse",
    toWarehouse: "Bandung Depot",
    memo: ""
  }
];

const WAREHOUSE_APPROVALS: WarehouseTransfer[] = WAREHOUSE_APPROVAL_SEEDS.map(seedTransfer);

const PRICE_RULES: PriceRule[] = [
  {
    id: 701,
    name: "Diskon reseller 10%",
    ruleType: "percent",
    startDate: "",
    endDate: "",
    amount: 10,
    tiers: [],
    products: [
      "Kertas HVS A4 80gsm",
      "Tinta Printer Hitam",
      "Kardus Packing 40x30x20",
      "Lakban Bening 2 inch"
    ],
    contacts: ["PT Sumber Rejeki", "CV Maju Bersama", "Toko Aneka Jaya"],
    isActive: true
  },
  {
    id: 702,
    name: "Potongan grosir kardus",
    ruleType: "value",
    startDate: "",
    endDate: "",
    amount: 500,
    tiers: [],
    products: ["Kardus Packing 40x30x20", "Lakban Bening 2 inch", "Plastik Wrap Palet"],
    contacts: [],
    isActive: true
  },
  {
    id: 703,
    name: "Tier kuantitas kertas HVS",
    ruleType: "tier",
    startDate: "",
    endDate: "",
    amount: 0,
    tiers: [
      { threshold: 50, discount: 5 },
      { threshold: 150, discount: 8 },
      { threshold: 400, discount: 12 }
    ],
    products: ["Kertas HVS A4 80gsm", "Kertas HVS A4 70gsm"],
    contacts: [],
    isActive: true
  },
  {
    id: 704,
    name: "Diskon subtotal korporat",
    ruleType: "subtotal_tier",
    startDate: "",
    endDate: "",
    amount: 0,
    tiers: [
      { threshold: 10_000_000, discount: 3 },
      { threshold: 50_000_000, discount: 6 }
    ],
    products: [],
    contacts: ["PT Karya Mandiri", "PT Bina Usaha"],
    isActive: true
  },
  {
    id: 705,
    name: "Diskon akhir tahun",
    ruleType: "end_discount",
    startDate: dateAt(112),
    endDate: dateAt(142),
    amount: 250_000,
    tiers: [],
    products: [],
    contacts: [],
    isActive: false
  },
  {
    id: 706,
    name: "Markup ekspedisi luar pulau",
    ruleType: "markup_percent",
    startDate: "",
    endDate: "",
    amount: 15,
    tiers: [],
    products: ["Biaya Kirim Ekspedisi"],
    contacts: ["PT Karya Mandiri", "UD Sinar Terang"],
    isActive: true
  },
  {
    id: 707,
    name: "Markup jasa instalasi",
    ruleType: "markup_value",
    startDate: "",
    endDate: "",
    amount: 35_000,
    tiers: [],
    products: ["Jasa Instalasi Furnitur", "Jasa Pengiriman Dalam Kota"],
    contacts: [],
    isActive: true
  },
  {
    id: 708,
    name: "Promo pameran Surabaya",
    ruleType: "percent",
    startDate: dateAt(-40),
    endDate: dateAt(-12),
    amount: 20,
    tiers: [],
    products: [
      "Meja Kerja Minimalis 120cm",
      "Kursi Kantor Ergonomis",
      "Paket Set Kantor Hemat",
      "Lampu Meja LED"
    ],
    contacts: [],
    isActive: false
  }
];

// ---------------------------------------------------------------------------
// Accessors. Each returns a copy, so a caller sorting or splicing the result
// can't mutate the module's own array — the same guarantee
// getPurchaseTransactions() gives.
// ---------------------------------------------------------------------------

export function getProducts(): Product[] {
  return [...PRODUCTS];
}

export function getProductMasters(): ProductMaster[] {
  return [...PRODUCT_MASTERS];
}

export function getStockAdjustments(): StockAdjustment[] {
  return [...STOCK_ADJUSTMENTS];
}

export function getProductApprovals(): ProductApproval[] {
  return [...PRODUCT_APPROVALS];
}

export function getWarehouses(): Warehouse[] {
  return [...WAREHOUSES];
}

export function getWarehouseTransfers(): WarehouseTransfer[] {
  return [...WAREHOUSE_TRANSFERS];
}

export function getWarehouseApprovals(): WarehouseTransfer[] {
  return [...WAREHOUSE_APPROVALS];
}

export function getPriceRules(): PriceRule[] {
  return [...PRICE_RULES];
}

/** Distinct adjustment categories, for the stock-adjustment filter drawer. */
export const ADJUSTMENT_CATEGORY_OPTIONS = [
  ...new Set(STOCK_ADJUSTMENTS.map((a) => a.category))
].sort();

// ---------------------------------------------------------------------------
// Mutations. The arrays above are plain (non-reactive) module state, so a page
// that calls one of these has to re-read through the getters to see the change
// — the list page bumps a `refreshTick` for exactly that, same as Purchases.
// ---------------------------------------------------------------------------

/** Which array each tab's rows come out of, so delete needs one entry point
 *  rather than eight. */
const RECORDS_BY_TAB: Record<ProductsTabKey, { id: number }[]> = {
  products_and_services: PRODUCTS,
  masters: PRODUCT_MASTERS,
  stock_adjustments: STOCK_ADJUSTMENTS,
  product_index_approval: PRODUCT_APPROVALS,
  warehouses: WAREHOUSES,
  warehouse_transfers: WAREHOUSE_TRANSFERS,
  warehouse_transfers_approval: WAREHOUSE_APPROVALS,
  price_rules: PRICE_RULES
};

/** Removes records from whichever list the tab shows. Returns how many went. */
export function deleteProductRecords(tab: ProductsTabKey, ids: number[]): number {
  const target = RECORDS_BY_TAB[tab];
  let removed = 0;
  ids.forEach((id) => {
    const index = target.findIndex((record) => record.id === id);
    if (index >= 0) {
      target.splice(index, 1);
      removed++;
    }
  });
  return removed;
}

/** Archiving is the non-destructive alternative the product lists offer beside
 *  Delete: the record leaves the list but survives, and comes back under the
 *  filter drawer's "Show archived". */
export function archiveProducts(tab: ProductsTabKey, ids: number[]): number {
  const target: { id: number; isArchived: boolean }[] =
    tab === "masters" ? PRODUCT_MASTERS : PRODUCTS;
  let archived = 0;
  target.forEach((record) => {
    if (ids.includes(record.id) && !record.isArchived) {
      record.isArchived = true;
      archived++;
    }
  });
  return archived;
}

/**
 * Approving moves the record out of its approval queue and into the list it
 * was waiting to join — "The approved transaction will move to stock
 * adjustment list", as the source's approve modal puts it. A prototype that
 * only deleted it from the queue would leave the user with no way to see that
 * anything had happened.
 *
 * A product conversion is the exception: the source says it shows up on the
 * related product's detail page, not on any list here, so approving one only
 * clears it from the queue.
 */
export function approveProductTransactions(ids: number[]): number {
  let approved = 0;
  ids.forEach((id) => {
    const index = PRODUCT_APPROVALS.findIndex((record) => record.id === id);
    const record = PRODUCT_APPROVALS[index];
    if (!record) return;
    PRODUCT_APPROVALS.splice(index, 1);
    approved++;
    if (record.transactionType === "product_conversion") return;
    STOCK_ADJUSTMENTS.unshift({
      id: record.id,
      date: record.date,
      number: record.number,
      adjustmentType: record.transactionType,
      category: record.category,
      account: record.account,
      warehouse: record.warehouse,
      memo: record.memo,
      tags: record.tags,
      // The approved adjustment keeps the exact lines the approver saw — not
      // freshly generated ones, which would quietly differ from what was
      // reviewed.
      lines: record.lines
    });
  });
  return approved;
}

/** The warehouse half of the same move: an approved transfer joins the
 *  warehouse transfer list. */
export function approveWarehouseTransfers(ids: number[]): number {
  let approved = 0;
  ids.forEach((id) => {
    const index = WAREHOUSE_APPROVALS.findIndex((record) => record.id === id);
    const record = WAREHOUSE_APPROVALS[index];
    if (!record) return;
    WAREHOUSE_APPROVALS.splice(index, 1);
    WAREHOUSE_TRANSFERS.unshift({ ...record });
    approved++;
  });
  return approved;
}

// ---------------------------------------------------------------------------
// Summary strip
// ---------------------------------------------------------------------------

export interface ProductSummary {
  availableStock: number;
  lowStock: number;
  outOfStock: number;
  warehouseTotal: number;
}

/**
 * The four figures above the table, matching the source's `summary_info`
 * endpoint: how many *products* are in stock, low, or out — and how many
 * warehouses are registered.
 *
 * These count **products, not units**, which is why the boxes' caption reads
 * "Total product". They are also deliberately all-time and unscoped: they do
 * not follow the active tab, the filter or the search. That is the same
 * resolution Purchases uses (see docs/patterns/SummaryBox.md) — the strip is
 * labelled with its own scope rather than re-scoped to whatever is below it.
 *
 * Products whose stock isn't tracked (services, non-inventory) are excluded
 * from all three stock counts: they have no stock to be in, low on, or out of.
 * Archived products are excluded too — an archived product is out of the
 * catalogue, and counting it as "out of stock" would put a permanent floor
 * under a number the user is meant to act on.
 */
export function getProductSummary(): ProductSummary {
  const tracked = PRODUCTS.filter((p) => !p.isArchived && p.quantity !== null);
  return {
    availableStock: tracked.filter((p) => (p.quantity ?? 0) > (p.buffer ?? 0)).length,
    lowStock: tracked.filter((p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= (p.buffer ?? 0))
      .length,
    outOfStock: tracked.filter((p) => (p.quantity ?? 0) === 0).length,
    warehouseTotal: WAREHOUSES.filter((w) => w.isActive).length
  };
}

// ---------------------------------------------------------------------------
// Single-record lookups and writers — what the detail and form pages need.
//
// The forms write straight into the module arrays above, the same way the list
// page's delete and archive do; a page that has mutated must re-read through a
// getter to see the change (it is plain, non-reactive state).
// ---------------------------------------------------------------------------

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getProductMasterById(id: number): ProductMaster | undefined {
  return PRODUCT_MASTERS.find((master) => master.id === id);
}

export function getPriceRuleById(id: number): PriceRule | undefined {
  return PRICE_RULES.find((rule) => rule.id === id);
}

/**
 * The ids either side of `id` in the list the detail page came from — what the
 * title band's prev/next chevrons step through.
 *
 * Ordering matters and is deliberately the *list's* order, not id order: the
 * user pressing "next" expects the row that was under the one they opened.
 * Archived records are skipped, since they aren't in the list by default.
 */
export function getAdjacentProductIds(id: number): {
  prevId: number | null;
  nextId: number | null;
} {
  return adjacentIn(
    PRODUCTS.filter((product) => !product.isArchived).map((product) => product.id),
    id
  );
}

export function getAdjacentMasterIds(id: number): { prevId: number | null; nextId: number | null } {
  return adjacentIn(
    PRODUCT_MASTERS.filter((master) => !master.isArchived).map((master) => master.id),
    id
  );
}

function adjacentIn(ids: number[], id: number): { prevId: number | null; nextId: number | null } {
  const index = ids.indexOf(id);
  // An archived record isn't in the list, so it has no neighbours in it —
  // both chevrons disable rather than jumping somewhere arbitrary.
  if (index === -1) return { prevId: null, nextId: null };
  return {
    prevId: index > 0 ? (ids[index - 1] ?? null) : null,
    nextId: index < ids.length - 1 ? (ids[index + 1] ?? null) : null
  };
}

/** Archive or unarchive one product — the detail page's Actions menu. Returns
 *  the new state so the caller can word its toast. */
export function setProductArchived(id: number, archived: boolean): boolean {
  const product = getProductById(id);
  if (product) product.isArchived = archived;
  return archived;
}

export function setProductMasterArchived(id: number, archived: boolean): boolean {
  const master = getProductMasterById(id);
  if (master) {
    master.isArchived = archived;
  }
  return archived;
}

// ---- Product create / update -------------------------------------------

/**
 * What the product form collects. Deliberately NOT `Partial<Product>`: the
 * form owns exactly these fields, and the writer below derives the rest
 * (`avgPrice`, `lastBuyPrice`, `quantityAvailable`, `isArchived`) rather than
 * letting a screen that never showed them set them.
 */
export interface ProductInput {
  name: string;
  description: string;
  code: string;
  barcode: string;
  category: string;
  type: ProductType;
  unit: string;
  isBundle: boolean;
  bundleItems: BundleItem[];
  trackInventory: boolean;
  inventoryTracking: InventoryTracking;
  inventoryAccount: string;
  /** Only meaningful when `trackInventory`; the writer nulls the stock fields
   *  otherwise, so an untracked product can never carry a minimum-stock level
   *  the form had already hidden. */
  buffer: number | null;
  warehouse: string;
  isBuy: boolean;
  buyPrice: number;
  buyAccount: string;
  buyTax: string;
  isSell: boolean;
  sellPrice: number;
  sellAccount: string;
  sellTax: string;
  tags: string[];
}

let nextProductId = 1000;

export function emptyProductInput(): ProductInput {
  return {
    name: "",
    description: "",
    code: "",
    barcode: "",
    category: "",
    type: "inventory",
    unit: "",
    isBundle: false,
    bundleItems: [],
    trackInventory: true,
    inventoryTracking: "qty",
    inventoryAccount: "Inventory",
    buffer: null,
    warehouse: WAREHOUSE_OPTIONS[0] ?? "",
    isBuy: true,
    buyPrice: 0,
    buyAccount: "Purchases",
    buyTax: "",
    isSell: true,
    sellPrice: 0,
    sellAccount: "Sales Revenue",
    sellTax: "",
    tags: []
  };
}

/** Seeds the form from an existing record, for the edit route. */
export function productToInput(product: Product): ProductInput {
  return {
    name: product.name,
    description: product.description,
    code: product.code,
    barcode: product.barcode,
    category: product.category,
    type: product.type,
    unit: product.unit,
    isBundle: product.isBundle,
    bundleItems: product.bundleItems.map((item) => ({ ...item })),
    trackInventory: product.trackInventory,
    inventoryTracking: product.inventoryTracking,
    inventoryAccount: product.inventoryAccount,
    buffer: product.buffer,
    warehouse: product.warehouse,
    isBuy: product.isBuy,
    buyPrice: product.buyPrice,
    buyAccount: product.buyAccount,
    buyTax: product.buyTax,
    isSell: product.isSell,
    sellPrice: product.sellPrice,
    sellAccount: product.sellAccount,
    sellTax: product.sellTax,
    tags: [...product.tags]
  };
}

/** The fields the form never shows, resolved consistently for both create and
 *  update — so a saved product can't end up in a state its own screen couldn't
 *  produce (an untracked product holding a stock figure, say). */
function applyProductInput(target: Product, input: ProductInput): Product {
  const tracked = input.trackInventory;
  target.name = input.name.trim();
  target.description = input.description.trim();
  target.code = input.code.trim();
  target.barcode = input.barcode.trim();
  target.category = input.category;
  target.type = input.type;
  target.unit = input.unit;
  target.isBundle = input.isBundle;
  target.bundleItems = input.isBundle ? input.bundleItems.map((item) => ({ ...item })) : [];
  target.trackInventory = tracked;
  // A bundle can only ever be tracked by quantity — the source says so outright
  // (`tracking_type.tooltip.product-bundle`).
  target.inventoryTracking = input.isBundle ? "qty" : input.inventoryTracking;
  target.inventoryAccount = tracked ? input.inventoryAccount : "";
  target.buffer = tracked ? input.buffer : null;
  target.warehouse = tracked ? input.warehouse : "";
  target.isBuy = input.isBuy;
  target.buyPrice = input.isBuy ? input.buyPrice : 0;
  target.buyAccount = input.isBuy ? input.buyAccount : "";
  target.buyTax = input.isBuy ? input.buyTax : "";
  target.isSell = input.isSell;
  target.sellPrice = input.isSell ? input.sellPrice : 0;
  target.sellAccount = input.isSell ? input.sellAccount : "";
  target.sellTax = input.isSell ? input.sellTax : "";
  target.tags = [...input.tags];
  return target;
}

export function createProduct(input: ProductInput): Product {
  const product = seedProduct({
    id: nextProductId++,
    name: "",
    description: "",
    code: "",
    barcode: "",
    category: "",
    type: "inventory",
    // A new product starts with no stock: opening quantity is recorded through
    // a stock adjustment, exactly as the source's form says
    // (`inventory-account.helper-text`).
    quantity: input.trackInventory ? 0 : null,
    quantityAvailable: input.trackInventory ? 0 : null,
    buffer: null,
    unit: "",
    avgPrice: 0,
    lastBuyPrice: 0,
    buyPrice: 0,
    sellPrice: 0,
    isBundle: false,
    isArchived: false,
    warehouse: "",
    tags: [],
    createdDate: todayIsoDate()
  });
  applyProductInput(product, input);
  PRODUCTS.unshift(product);
  return product;
}

export function updateProduct(id: number, input: ProductInput): Product | undefined {
  const product = getProductById(id);
  if (!product) return undefined;
  applyProductInput(product, input);
  // Turning tracking off retires the stock figures with it; turning it on
  // starts the product at zero rather than resurrecting a stale count.
  if (!input.trackInventory) {
    product.quantity = null;
    product.quantityAvailable = null;
  } else if (product.quantity === null) {
    product.quantity = 0;
    product.quantityAvailable = 0;
  }
  return product;
}

export function todayIsoDate(): string {
  return dateAt(0);
}

// ---- Master create / update ---------------------------------------------

export interface ProductMasterInput {
  name: string;
  description: string;
  code: string;
  category: string;
  unit: string;
  attributes: VariantAttribute[];
  trackInventory: boolean;
  inventoryTracking: InventoryTracking;
  inventoryAccount: string;
  isBuy: boolean;
  buyPrice: number;
  buyAccount: string;
  buyTax: string;
  isSell: boolean;
  sellPrice: number;
  sellAccount: string;
  sellTax: string;
  sellDiscountAccount: string;
  tags: string[];
}

let nextMasterId = 200;

export function emptyProductMasterInput(): ProductMasterInput {
  return {
    name: "",
    description: "",
    code: "",
    category: "",
    unit: "",
    attributes: [{ name: "", options: [] }],
    trackInventory: true,
    inventoryTracking: "qty",
    inventoryAccount: "Inventory",
    isBuy: true,
    buyPrice: 0,
    buyAccount: "Purchases",
    buyTax: "",
    isSell: true,
    sellPrice: 0,
    sellAccount: "Sales Revenue",
    sellTax: "",
    sellDiscountAccount: "",
    tags: []
  };
}

export function productMasterToInput(master: ProductMaster): ProductMasterInput {
  return {
    name: master.name,
    description: master.description,
    code: master.code,
    category: master.category,
    unit: master.unit,
    attributes: master.attributes.map((attribute) => ({
      name: attribute.name,
      options: [...attribute.options]
    })),
    trackInventory: master.trackInventory,
    inventoryTracking: master.inventoryTracking,
    inventoryAccount: master.inventoryAccount,
    isBuy: master.isBuy,
    buyPrice: master.buyPrice,
    buyAccount: master.buyAccount,
    buyTax: master.buyTax,
    isSell: master.isSell,
    sellPrice: master.sellPrice,
    sellAccount: master.sellAccount,
    sellTax: master.sellTax,
    sellDiscountAccount: master.sellDiscountAccount,
    tags: [...master.tags]
  };
}

/** Attributes with a name and at least one option — the only ones that can
 *  contribute a dimension to the variant table. */
export function usableAttributes(attributes: VariantAttribute[]): VariantAttribute[] {
  return attributes.filter((attribute) => attribute.name && attribute.options.length > 0);
}

/** How many variants a given attribute set would produce. The form shows this
 *  live ("Apply to 12 variant"), so it has to be the same arithmetic
 *  `seedMaster` uses — hence one exported function rather than two. */
export function variantCountFor(attributes: VariantAttribute[]): number {
  const usable = usableAttributes(attributes);
  if (usable.length === 0) return 0;
  return usable.reduce((total, attribute) => total * attribute.options.length, 1);
}

function applyMasterInput(seed: ProductMasterSeed, input: ProductMasterInput): ProductMasterSeed {
  return {
    ...seed,
    name: input.name.trim(),
    description: input.description.trim(),
    code: input.code.trim(),
    category: input.category,
    unit: input.unit,
    attributes: usableAttributes(input.attributes),
    buyPrice: input.isBuy ? input.buyPrice : 0,
    sellPrice: input.isSell ? input.sellPrice : 0,
    trackInventory: input.trackInventory,
    inventoryTracking: input.inventoryTracking,
    inventoryAccount: input.trackInventory ? input.inventoryAccount : "",
    isBuy: input.isBuy,
    buyAccount: input.isBuy ? input.buyAccount : "",
    buyTax: input.isBuy ? input.buyTax : "",
    isSell: input.isSell,
    sellAccount: input.isSell ? input.sellAccount : "",
    sellTax: input.isSell ? input.sellTax : "",
    sellDiscountAccount: input.isSell ? input.sellDiscountAccount : "",
    tags: [...input.tags]
  };
}

export function createProductMaster(input: ProductMasterInput): ProductMaster {
  const master = seedMaster(
    applyMasterInput(
      {
        id: nextMasterId++,
        name: "",
        description: "",
        code: "",
        category: "",
        unit: "",
        quantity: 0,
        buyPrice: 0,
        sellPrice: 0,
        isArchived: false,
        tags: [],
        attributes: [],
        createdDate: todayIsoDate()
      },
      input
    )
  );
  PRODUCT_MASTERS.unshift(master);
  return master;
}

export function updateProductMaster(
  id: number,
  input: ProductMasterInput
): ProductMaster | undefined {
  const index = PRODUCT_MASTERS.findIndex((master) => master.id === id);
  const existing = PRODUCT_MASTERS[index];
  if (!existing) return undefined;
  // Re-seeded rather than patched in place: changing an attribute changes the
  // whole variant table, which is exactly why the source warns before letting
  // you do it ("The filled options and product variant table data will be
  // reset"). Patching fields would leave stale variants behind.
  const next = seedMaster(
    applyMasterInput(
      {
        id: existing.id,
        name: existing.name,
        description: existing.description,
        code: existing.code,
        category: existing.category,
        unit: existing.unit,
        quantity: existing.quantity,
        buyPrice: existing.buyPrice,
        sellPrice: existing.sellPrice,
        isArchived: existing.isArchived,
        tags: existing.tags,
        attributes: existing.attributes,
        createdDate: existing.createdDate
      },
      input
    )
  );
  PRODUCT_MASTERS.splice(index, 1, next);
  return next;
}

// ---- Price rule create / update -----------------------------------------

export interface PriceRuleInput {
  name: string;
  ruleType: PriceRuleType;
  startDate: string;
  endDate: string;
  amount: number;
  tiers: PriceRuleTier[];
  products: string[];
  contacts: string[];
  isActive: boolean;
}

let nextPriceRuleId = 800;

export function emptyPriceRuleInput(): PriceRuleInput {
  return {
    name: "",
    ruleType: "percent",
    startDate: "",
    endDate: "",
    amount: 0,
    tiers: [{ threshold: 0, discount: 0 }],
    products: [],
    contacts: [],
    isActive: true
  };
}

export function priceRuleToInput(rule: PriceRule): PriceRuleInput {
  return {
    name: rule.name,
    ruleType: rule.ruleType,
    startDate: rule.startDate,
    endDate: rule.endDate,
    amount: rule.amount,
    tiers: rule.tiers.length
      ? rule.tiers.map((tier) => ({ ...tier }))
      : [{ threshold: 0, discount: 0 }],
    products: [...rule.products],
    contacts: [...rule.contacts],
    isActive: rule.isActive
  };
}

/** Drops whichever half of the shape this rule type doesn't use, so a rule
 *  can't store a tier table it was never edited with (or an amount for a
 *  tiered type). Shared by create and update — the same reason
 *  `applyProductInput` exists. */
function normalisePriceRule(input: PriceRuleInput): Omit<PriceRule, "id"> {
  const shape = PRICE_RULE_SHAPE[input.ruleType];
  return {
    name: input.name.trim(),
    ruleType: input.ruleType,
    startDate: input.startDate,
    endDate: input.endDate,
    amount: shape === "tier" ? 0 : input.amount,
    tiers: shape === "tier" ? input.tiers.map((tier) => ({ ...tier })) : [],
    products: [...input.products],
    contacts: [...input.contacts],
    isActive: input.isActive
  };
}

export function createPriceRule(input: PriceRuleInput): PriceRule {
  const rule: PriceRule = { id: nextPriceRuleId++, ...normalisePriceRule(input) };
  PRICE_RULES.unshift(rule);
  return rule;
}

export function updatePriceRule(id: number, input: PriceRuleInput): PriceRule | undefined {
  const index = PRICE_RULES.findIndex((rule) => rule.id === id);
  if (index === -1) return undefined;
  const rule: PriceRule = { id, ...normalisePriceRule(input) };
  PRICE_RULES.splice(index, 1, rule);
  return rule;
}

// ---------------------------------------------------------------------------
// Storage locations
// ---------------------------------------------------------------------------

const STORAGE_LOCATIONS: StorageLocation[] = [
  { id: 4101, warehouseId: 401, code: "A-01-01", name: "Rak A / Baris 1 / Bin 1" },
  { id: 4102, warehouseId: 401, code: "A-01-02", name: "Rak A / Baris 1 / Bin 2" },
  { id: 4103, warehouseId: 401, code: "A-02-01", name: "Rak A / Baris 2 / Bin 1" },
  { id: 4104, warehouseId: 402, code: "PK-01", name: "Area Packing 1" },
  { id: 4105, warehouseId: 402, code: "PK-02", name: "Area Packing 2" },
  { id: 4106, warehouseId: 403, code: "BB-01", name: "Rak Bahan Baku 1" },
  { id: 4107, warehouseId: 404, code: "SBY-01", name: "Blok Distribusi A" }
];

let nextStorageLocationId = 4200;

export function getStorageLocations(warehouseId: number): StorageLocation[] {
  return STORAGE_LOCATIONS.filter((location) => location.warehouseId === warehouseId);
}

export function createStorageLocation(
  warehouseId: number,
  code: string,
  name: string
): StorageLocation {
  const location: StorageLocation = {
    id: nextStorageLocationId++,
    warehouseId,
    code: code.trim(),
    name: name.trim()
  };
  STORAGE_LOCATIONS.push(location);
  return location;
}

// ---------------------------------------------------------------------------
// Warehouse — lookups and writers
// ---------------------------------------------------------------------------

export function getWarehouseById(id: number): Warehouse | undefined {
  return WAREHOUSES.find((warehouse) => warehouse.id === id);
}

export function getAdjacentWarehouseIds(id: number): {
  prevId: number | null;
  nextId: number | null;
} {
  // Inactive warehouses stay in the list (the tab shows them with a Status
  // badge), so unlike products they are NOT filtered out of the walk.
  return adjacentIn(
    WAREHOUSES.map((warehouse) => warehouse.id),
    id
  );
}

export interface WarehouseInput {
  code: string;
  name: string;
  address: string;
  pic: string;
  description: string;
}

export function emptyWarehouseInput(): WarehouseInput {
  return { code: "", name: "", address: "", pic: "", description: "" };
}

export function warehouseToInput(warehouse: Warehouse): WarehouseInput {
  return {
    code: warehouse.code,
    name: warehouse.name,
    address: warehouse.address,
    pic: warehouse.pic,
    description: warehouse.description
  };
}

let nextWarehouseId = 500;

export function createWarehouse(input: WarehouseInput): Warehouse {
  const warehouse: Warehouse = {
    id: nextWarehouseId++,
    code: input.code.trim(),
    name: input.name.trim(),
    address: input.address.trim(),
    pic: input.pic.trim(),
    description: input.description.trim(),
    isActive: true
  };
  WAREHOUSES.unshift(warehouse);
  return warehouse;
}

export function updateWarehouse(id: number, input: WarehouseInput): Warehouse | undefined {
  const warehouse = getWarehouseById(id);
  if (!warehouse) return undefined;
  Object.assign(warehouse, {
    code: input.code.trim(),
    name: input.name.trim(),
    address: input.address.trim(),
    pic: input.pic.trim(),
    description: input.description.trim()
  });
  return warehouse;
}

/**
 * Deactivating is the warehouse equivalent of archiving — the record stays,
 * but it stops being offered on new transactions. The source refuses outright
 * when the warehouse still holds a storage location, which is the one rule
 * worth keeping: an inactive warehouse with live locations underneath it is a
 * state neither screen can explain.
 */
export function setWarehouseActive(id: number, active: boolean): { ok: boolean; reason?: string } {
  const warehouse = getWarehouseById(id);
  if (!warehouse) return { ok: false, reason: "Warehouse not found." };
  if (!active && getStorageLocations(id).length > 0) {
    return {
      ok: false,
      reason: "Unable to deactivate this warehouse because it has a storage location."
    };
  }
  warehouse.isActive = active;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Stock adjustment — lookups and writers
// ---------------------------------------------------------------------------

export function getStockAdjustmentById(id: number): StockAdjustment | undefined {
  return STOCK_ADJUSTMENTS.find((record) => record.id === id);
}

export function getProductApprovalById(id: number): ProductApproval | undefined {
  return PRODUCT_APPROVALS.find((record) => record.id === id);
}

export function getAdjacentStockAdjustmentIds(id: number): {
  prevId: number | null;
  nextId: number | null;
} {
  return adjacentIn(
    STOCK_ADJUSTMENTS.map((record) => record.id),
    id
  );
}

export interface StockAdjustmentInput {
  date: string;
  adjustmentType: AdjustmentType;
  category: string;
  account: string;
  warehouse: string;
  memo: string;
  tags: string[];
  lines: StockAdjustmentLine[];
}

export function emptyStockAdjustmentInput(): StockAdjustmentInput {
  return {
    date: todayIsoDate(),
    adjustmentType: "stock_count",
    category: ADJUSTMENT_CATEGORY_OPTIONS[0] ?? "",
    account: "Inventory Adjustment",
    warehouse: WAREHOUSE_OPTIONS[0] ?? "",
    memo: "",
    tags: [],
    lines: []
  };
}

export function stockAdjustmentToInput(record: StockAdjustment): StockAdjustmentInput {
  return {
    date: record.date,
    adjustmentType: record.adjustmentType,
    category: record.category,
    account: record.account,
    warehouse: record.warehouse,
    memo: record.memo,
    tags: [...record.tags],
    lines: record.lines.map((line) => ({ ...line }))
  };
}

/** Turns a catalogue product into a blank adjustment line — the form's product
 *  picker calls this, so `recorded` is always the product's real current stock
 *  rather than something typed in beside it. */
export function adjustmentLineForProduct(product: Product): StockAdjustmentLine {
  const recorded = product.quantity ?? 0;
  return {
    productId: product.id,
    name: product.name,
    code: product.code,
    unit: product.unit,
    recorded,
    // Starts equal, so an untouched line is a zero-difference line.
    actual: recorded,
    avgPrice: product.avgPrice
  };
}

let nextAdjustmentId = 2000;

function adjustmentNumber(id: number): string {
  return `ADJ/2026/09/${String(id % 10000).padStart(4, "0")}`;
}

export function createStockAdjustment(input: StockAdjustmentInput): StockAdjustment {
  const record: StockAdjustment = {
    id: nextAdjustmentId++,
    date: input.date,
    number: adjustmentNumber(nextAdjustmentId),
    adjustmentType: input.adjustmentType,
    category: input.category,
    account: input.account,
    warehouse: input.warehouse,
    memo: input.memo.trim(),
    tags: [...input.tags],
    lines: input.lines.map((line) => ({ ...line }))
  };
  STOCK_ADJUSTMENTS.unshift(record);
  applyAdjustmentToStock(record);
  return record;
}

export function updateStockAdjustment(
  id: number,
  input: StockAdjustmentInput
): StockAdjustment | undefined {
  const record = getStockAdjustmentById(id);
  if (!record) return undefined;
  Object.assign(record, {
    date: input.date,
    adjustmentType: input.adjustmentType,
    category: input.category,
    account: input.account,
    warehouse: input.warehouse,
    memo: input.memo.trim(),
    tags: [...input.tags],
    lines: input.lines.map((line) => ({ ...line }))
  });
  return record;
}

/**
 * An adjustment that doesn't move stock is theatre. Saving one writes each
 * line's `actual` back onto its product, so the count the user just took is
 * what the catalogue, the summary strip and the product's own page all report
 * a moment later.
 *
 * Only applied on create — re-applying on edit would need the previous lines
 * reversed first, and the prototype has no ledger to reverse against.
 */
function applyAdjustmentToStock(record: StockAdjustment) {
  record.lines.forEach((line) => {
    const product = getProductById(line.productId);
    if (!product || product.quantity === null) return;
    const delta = line.actual - line.recorded;
    product.quantity = Math.max(0, product.quantity + delta);
    product.quantityAvailable = Math.max(0, (product.quantityAvailable ?? 0) + delta);
  });
}

// ---------------------------------------------------------------------------
// Warehouse transfer — lookups and writers
// ---------------------------------------------------------------------------

export function getWarehouseTransferById(id: number): WarehouseTransfer | undefined {
  return WAREHOUSE_TRANSFERS.find((record) => record.id === id);
}

export function getWarehouseApprovalById(id: number): WarehouseTransfer | undefined {
  return WAREHOUSE_APPROVALS.find((record) => record.id === id);
}

export function getAdjacentTransferIds(id: number): {
  prevId: number | null;
  nextId: number | null;
} {
  return adjacentIn(
    WAREHOUSE_TRANSFERS.map((record) => record.id),
    id
  );
}

export interface WarehouseTransferInput {
  date: string;
  fromWarehouse: string;
  toWarehouse: string;
  memo: string;
  lines: TransferLine[];
}

export function emptyWarehouseTransferInput(): WarehouseTransferInput {
  return {
    date: todayIsoDate(),
    fromWarehouse: "",
    toWarehouse: "",
    memo: "",
    lines: []
  };
}

export function warehouseTransferToInput(record: WarehouseTransfer): WarehouseTransferInput {
  return {
    date: record.date,
    fromWarehouse: record.fromWarehouse,
    toWarehouse: record.toWarehouse,
    memo: record.memo,
    lines: record.lines.map((line) => ({ ...line }))
  };
}

export function transferLineForProduct(product: Product): TransferLine {
  return {
    productId: product.id,
    name: product.name,
    unit: product.unit,
    quantity: 0,
    quantityAtSource: product.quantity ?? 0
  };
}

let nextTransferId = 3000;

export function createWarehouseTransfer(input: WarehouseTransferInput): WarehouseTransfer {
  const record: WarehouseTransfer = {
    id: nextTransferId++,
    date: input.date,
    number: `WT/2026/09/${String(nextTransferId % 10000).padStart(4, "0")}`,
    fromWarehouse: input.fromWarehouse,
    toWarehouse: input.toWarehouse,
    memo: input.memo.trim(),
    lines: input.lines.map((line) => ({ ...line }))
  };
  WAREHOUSE_TRANSFERS.unshift(record);
  return record;
}

export function updateWarehouseTransfer(
  id: number,
  input: WarehouseTransferInput
): WarehouseTransfer | undefined {
  const record = getWarehouseTransferById(id);
  if (!record) return undefined;
  Object.assign(record, {
    date: input.date,
    fromWarehouse: input.fromWarehouse,
    toWarehouse: input.toWarehouse,
    memo: input.memo.trim(),
    lines: input.lines.map((line) => ({ ...line }))
  });
  return record;
}
