/**
 * Purchase Price Rule engine (one-pager PD 51412239134, §5).
 *
 * Resolves which purchase price rule applies to one line of a Purchases
 * document (Quote / Order / Invoice) and what the vendor's PKP status is. Pure
 * functions over `getPriceRules()` so the rule form and the transaction form
 * read one source.
 *
 * Priority (no stacking — the single best match wins):
 *   tier 1  vendor + specific products
 *   tier 2  vendor + all products
 *   tier 3  all vendors + specific products
 * Ties inside a tier: the most recently created rule (highest id).
 * A rule with no vendor AND no products never applies to purchases (it would
 * be a blanket discount on everything — out of scope).
 */
import { getPriceRules, type PriceRule } from "~/data/products";

export type PurchaseRuleTier = 1 | 2 | 3;

export const PURCHASE_RULE_TIER_LABEL: Record<PurchaseRuleTier, string> = {
  1: "Vendor + product",
  2: "Vendor only",
  3: "Product only"
};

export interface PurchaseRuleMatch {
  rule: PriceRule;
  tier: PurchaseRuleTier;
  /** The rule expressed as a line discount %, which is the only discount
   *  field a Purchases line has. A "value" rule (Rp per unit) converts against
   *  the line's unit price, rounded to 2 decimals. */
  discountPercent: number;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function inPeriod(rule: PriceRule, isoDate: string): boolean {
  if (rule.startDate && isoDate < rule.startDate) return false;
  if (rule.endDate && isoDate > rule.endDate) return false;
  return true;
}

function tierOf(rule: PriceRule): PurchaseRuleTier | null {
  const hasVendor = rule.contacts.length > 0;
  const hasProducts = rule.products.length > 0;
  if (hasVendor && hasProducts) return 1;
  if (hasVendor) return 2;
  if (hasProducts) return 3;
  return null;
}

export function activePurchaseRules(isoDate: string = toIso(new Date())): PriceRule[] {
  return getPriceRules().filter(
    (r) => r.transactionType === "purchase" && r.isActive && inPeriod(r, isoDate)
  );
}

export function resolvePurchaseRule(
  vendor: string,
  product: string,
  unitPrice: number,
  isoDate?: string
): PurchaseRuleMatch | null {
  if (!vendor || !product) return null;
  const candidates = activePurchaseRules(isoDate)
    .map((rule) => ({ rule, tier: tierOf(rule) }))
    .filter(
      (c): c is { rule: PriceRule; tier: PurchaseRuleTier } =>
        c.tier !== null &&
        (c.rule.contacts.length === 0 || c.rule.contacts.includes(vendor)) &&
        (c.rule.products.length === 0 || c.rule.products.includes(product))
    )
    .sort((a, b) => a.tier - b.tier || b.rule.id - a.rule.id);
  const best = candidates[0];
  if (!best) return null;
  const { rule } = best;
  const discountPercent =
    rule.ruleType === "value"
      ? unitPrice > 0
        ? Math.round((rule.amount / unitPrice) * 10000) / 100
        : 0
      : rule.amount;
  return { rule, tier: best.tier, discountPercent: Math.min(discountPercent, 100) };
}

/** true = PKP, false = Non-PKP, null = not set on any rule (tax follows the
 *  product, i.e. today's behaviour). */
export function vendorPkpStatus(vendor: string): boolean | null {
  if (!vendor) return null;
  const rule = getPriceRules().find(
    (r) => r.transactionType === "purchase" && r.vendorPkp !== null && r.contacts.includes(vendor)
  );
  return rule ? rule.vendorPkp : null;
}

/** The first other purchase rule that records one of `vendors` with the
 *  opposite PKP status — saving must be blocked while one exists. */
export function purchasePkpConflict(
  vendors: string[],
  pkp: boolean,
  excludeId?: number
): { rule: PriceRule; vendor: string } | null {
  for (const rule of getPriceRules()) {
    if (rule.transactionType !== "purchase" || rule.vendorPkp === null) continue;
    if (excludeId !== undefined && rule.id === excludeId) continue;
    if (rule.vendorPkp === pkp) continue;
    const vendor = vendors.find((v) => rule.contacts.includes(v));
    if (vendor) return { rule, vendor };
  }
  return null;
}
