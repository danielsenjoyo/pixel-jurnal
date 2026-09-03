// Landed cost — the cost of getting goods to the warehouse (freight, duty,
// insurance, handling) spread across the products on a purchase, so each
// product's real unit cost reflects what it actually took to land it.
//
// Its own module rather than another `TransactionType`, because it isn't one:
// it has no vendor, no due date, no status and no line items in the usual
// sense. It has *two* tables — the expenses being allocated, and the purchase's
// products receiving the allocation — and it only exists relative to a specific
// purchase. Forcing it through PurchaseTransaction/TYPE_CAPABILITIES would mean
// a row of `false`s and a handful of fields that never apply.
//
// Ported from jurnal-frontend-app src/pages/purchases/landed_cost/.
import {
  formatDate,
  getPurchaseTransactionById,
  getPurchaseTransactions,
  parseLocalIsoDate,
  toLocalIsoDate,
  type PurchaseTransaction,
} from "./purchase-transactions";

/** One cost being allocated. `amount` is what the expense account holds in
 *  total; `amountUsed` is how much of it this landed cost consumes — the rest
 *  stays available for another one. */
export interface LandedCostExpense {
  id: number;
  expense: string;
  description: string;
  amount: number;
  amountUsed: number;
}

/** One product line of the purchase, and the share of cost put onto it.
 *  `allocated` is entered by hand; the two landed figures derive from it. */
export interface LandedCostAllocation {
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  allocated: number;
}

export interface LandedCost {
  id: number;
  number: string;
  /** The purchase whose products this cost is spread across. */
  purchaseId: number;
  createdDate: string;
  createdDateSort: string;
  tags: string[];
  expenses: LandedCostExpense[];
  allocations: LandedCostAllocation[];
  /** Sum of `amountUsed` — must equal the sum of `allocated` to be valid. */
  total: number;
}

export const EXPENSE_OPTIONS = [
  "Freight in",
  "Import duty",
  "Insurance",
  "Customs clearance",
  "Handling & storage",
];

const LANDED_COST_NUMBER_OFFSET = 3_000;

export function landedCostNumber(id: number): string {
  return `Landed Cost #${LANDED_COST_NUMBER_OFFSET + id}`;
}

// ---- derived figures -------------------------------------------------------
// Kept here, not in the pages, so the form preview and the stored record can't
// disagree — the same rule as computeInvoiceTotals for the money forms.

/** The product's unit cost once its share of the landed cost is included. */
export function landedUnitPrice(a: LandedCostAllocation): number {
  if (!a.quantity) return a.unitPrice;
  return Math.round(a.allocated / a.quantity + a.unitPrice);
}
/** The product's line value once its share is included. */
export function landedAmount(a: LandedCostAllocation): number {
  return a.allocated + a.amount;
}
export function totalExpense(expenses: LandedCostExpense[]): number {
  return expenses.reduce((sum, e) => sum + (Number(e.amountUsed) || 0), 0);
}
export function totalAllocated(allocations: LandedCostAllocation[]): number {
  return allocations.reduce((sum, a) => sum + (Number(a.allocated) || 0), 0);
}
/** What's still to be assigned. Must reach 0 before a landed cost can be
 *  saved — an unallocated remainder would silently vanish from the costing. */
export function remainingToAllocate(expenses: LandedCostExpense[], allocations: LandedCostAllocation[]): number {
  return totalExpense(expenses) - totalAllocated(allocations);
}

/** The allocation rows for a purchase, seeded from its product lines with
 *  nothing allocated yet. */
export function allocationsForPurchase(purchase: PurchaseTransaction): LandedCostAllocation[] {
  return purchase.lines.map((l) => ({
    product: l.product,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    amount: l.amount,
    allocated: 0,
  }));
}

// ---- store -----------------------------------------------------------------
// Same in-memory-array approach as purchase-transactions: a plain array
// mutated in place, with pages bumping a refresh counter to re-read it.

function buildSeed(): LandedCost[] {
  const invoices = getPurchaseTransactions().filter((t) => t.type === "invoice" && t.lines.length >= 2);
  return invoices.slice(0, 3).map((invoice, i) => {
    const allocations = allocationsForPurchase(invoice);
    const freight = 250_000 * (i + 1);
    const duty = 100_000 * (i + 1);
    const total = freight + duty;
    // Seed a fully-allocated record, split across the lines by value so the
    // detail page shows a realistic spread rather than a round split.
    const lineTotal = allocations.reduce((sum, a) => sum + a.amount, 0) || 1;
    let assigned = 0;
    allocations.forEach((a, idx) => {
      const share = idx === allocations.length - 1 ? total - assigned : Math.round((a.amount / lineTotal) * total);
      a.allocated = share;
      assigned += share;
    });
    return {
      id: i + 1,
      number: landedCostNumber(i + 1),
      purchaseId: invoice.id,
      createdDate: invoice.transactionDate,
      createdDateSort: invoice.transactionDateSort,
      tags: invoice.tags.slice(0, 1),
      expenses: [
        { id: 1, expense: "Freight in", description: "Sea freight", amount: freight * 2, amountUsed: freight },
        { id: 2, expense: "Import duty", description: "", amount: duty * 2, amountUsed: duty },
      ],
      allocations,
      total,
    };
  });
}

let landedCosts: LandedCost[] | null = null;

export function getLandedCosts(): LandedCost[] {
  if (!landedCosts) landedCosts = buildSeed();
  return landedCosts;
}

export function getLandedCostById(id: number): LandedCost | undefined {
  return getLandedCosts().find((lc) => lc.id === id);
}

/** Every landed cost calculated against a purchase — the reverse of
 *  `purchaseId`, resolved by lookup so the link is stored once. */
export function getLandedCostsForPurchase(purchaseId: number): LandedCost[] {
  return getLandedCosts().filter((lc) => lc.purchaseId === purchaseId);
}

export interface LandedCostInput {
  purchaseId: number;
  createdDateIso: string;
  transactionNo: string;
  tags: string[];
  expenses: LandedCostExpense[];
  allocations: LandedCostAllocation[];
}

export function createLandedCost(input: LandedCostInput): LandedCost {
  const all = getLandedCosts();
  const nextId = all.reduce((max, lc) => Math.max(max, lc.id), 0) + 1;
  const created = input.createdDateIso ? parseLocalIsoDate(input.createdDateIso) : new Date();
  const record: LandedCost = {
    id: nextId,
    number: input.transactionNo || landedCostNumber(nextId),
    purchaseId: input.purchaseId,
    createdDate: formatDate(created),
    createdDateSort: toLocalIsoDate(created),
    tags: [...input.tags],
    expenses: input.expenses.map((e, i) => ({ ...e, id: i + 1 })),
    allocations: input.allocations.map((a) => ({ ...a })),
    total: totalExpense(input.expenses),
  };
  all.unshift(record);
  return record;
}

export function updateLandedCost(id: number, input: LandedCostInput): LandedCost | undefined {
  const record = getLandedCostById(id);
  if (!record) return undefined;
  const created = input.createdDateIso ? parseLocalIsoDate(input.createdDateIso) : parseLocalIsoDate(record.createdDateSort);
  Object.assign(record, {
    // The number stays the record's identity — an edit never renumbers it.
    createdDate: formatDate(created),
    createdDateSort: toLocalIsoDate(created),
    tags: [...input.tags],
    expenses: input.expenses.map((e, i) => ({ ...e, id: i + 1 })),
    allocations: input.allocations.map((a) => ({ ...a })),
    total: totalExpense(input.expenses),
  });
  return record;
}

export function deleteLandedCost(id: number): void {
  const all = getLandedCosts();
  const idx = all.findIndex((lc) => lc.id === id);
  if (idx >= 0) all.splice(idx, 1);
}

/** The purchase a landed cost belongs to, for the pages that show its number. */
export function purchaseForLandedCost(lc: LandedCost): PurchaseTransaction | undefined {
  return getPurchaseTransactionById(lc.purchaseId);
}
