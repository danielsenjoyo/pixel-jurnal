// Purchase price rules — a negotiated price for one product from one vendor.
// Mock data for this prototype; a real implementation replaces this with an
// API call but should keep the same product-plus-vendor key.
//
// Why this exists here: where a price rule governs a line, past prices are
// not decision-support, they are a distraction. The price has already been
// agreed with that supplier, so offering "what we paid before" invites
// someone to contradict a contract — and on the form, to overwrite the
// contracted price with an older one. The reference steps aside instead, and
// says why (see the note under the unit price on both invoice surfaces).
//
// Keyed by name, not id — same reason as price history: the Purchase module
// has no `productId`/`vendorId` anywhere, so everything joins on the names in
// `PRODUCT_OPTIONS` / `VENDOR_OPTIONS`. See `app/types/price-history.ts`.
//
// A rule is product AND vendor: a contract is with one supplier, so the same
// product can be governed when bought from one vendor and open when bought
// from another. On the form that means the note and the trigger swap as the
// vendor changes, which is correct — the vendor is what makes a rule apply.

export interface PriceRule {
  /** Matches `PurchaseTransactionLine.product`. */
  product: string;
  /** Matches `PurchaseTransaction.vendorName`. */
  vendorName: string;
  /** Shown to the user, so it has to read as a thing someone agreed to. */
  name: string;
  /** The governed price, per the product's own unit. Display only here. */
  price: number;
}

export const PRICE_RULES: PriceRule[] = [
  // Seeded onto invoice 8's vendor, and deliberately NOT onto invoice 2's
  // (Toko Elektronik Jaya) — the two draft invoices then show the two
  // outcomes side by side, same product, different supplier.
  {
    product: "Wireless Mouse",
    vendorName: "PT Maju Bersama",
    name: "Annual supply contract",
    price: 118_000
  },
  {
    product: "Office Chair",
    vendorName: "PT Cipta Karya",
    name: "Annual supply contract",
    price: 1_390_000
  },
  {
    product: "LED Desk Lamp",
    vendorName: "CV Sumber Rejeki",
    name: "Volume tier A",
    price: 162_000
  },
  {
    product: "Printer Paper A4 (Ream)",
    vendorName: "Toko Elektronik Jaya",
    name: "Preferred vendor rate",
    price: 51_000
  }
];

/**
 * The rule governing this product from this vendor, if any.
 *
 * No vendor means no rule — a contract is with a specific supplier, so an
 * empty vendor on a half-filled form can't match one. That is the right
 * answer rather than a missing case: until a vendor is chosen, nothing
 * governs the price, and the price reference should be offered.
 */
export function findPriceRule(
  product: string | undefined,
  vendorName: string | undefined
): PriceRule | undefined {
  if (!product || !vendorName) return undefined;
  return PRICE_RULES.find((rule) => rule.product === product && rule.vendorName === vendorName);
}
