# Price history components — reuse contract

Built for the real Purchase module: [`app/pages/purchase/invoice/[id].vue`](../../pages/purchase/invoice/%5Bid%5D.vue)
(read-only, and only while the record is awaiting approval — see "When the
reference appears" below) and [`PurchaseTransactionForm.vue`](../purchase/PurchaseTransactionForm.vue)
(interactive, gated to `type === "invoice"` — see that file's `onApplyPrice`
and the trigger in its line-items table). Everything here is document-type
-agnostic — extending to Purchase Order is a one-line guard change in
`PurchaseTransactionForm.vue` (it already renders Order via the same
component), not a new component set.

## When the reference appears

Price history is a **pre-commit check**. It helps someone judge a price that can
still be changed; once the invoice leaves draft the price is committed and the
reference is a fact with no available action.

| Surface                                                    | Shown?                                        |
| ---------------------------------------------------------- | --------------------------------------------- |
| Create form (`PurchaseTransactionForm.vue`, no `recordId`) | Always — nothing is committed yet.            |
| Edit form (`PurchaseTransactionForm.vue`, `recordId` set)  | Only when the record's `status` is `"draft"`. |
| Detail page (`invoice/[id].vue`)                           | Only when `status` is `"draft"`.              |

Both surfaces read the same condition, so one invoice never offers the
reference in one place and hides it in the other.

**Gate on the status, not on a flag.** An earlier iteration gated the detail
page on `needsApproval`, which is independent of `status` in this dataset — the
page could read "Paid" while behaving like a record under review, and nothing
on screen explained why one invoice carried the link and another did not. The
draft status sits in the page's own badge, so the condition is visible right
where the affordance is. Same status-conditional principle as the bottom action
bar in `docs/patterns/details-page-format.md`.

Phase 1 is Purchase Invoice only. `"draft"` is seeded into the invoice slice of
`STATUS_POOL` in `app/data/purchase-transactions.ts`, and its position in that
array is load-bearing: it puts the draft status on invoices 2 and 8, both of
which carry Wireless Mouse next to products with no history, and both of whose
vendors have bought it before — so the drawer opens vendor-scoped and every
state of the feature is reachable from a seeded page. Extending to another
type means adding `"draft"` to that type's pool as well.

## Non-negotiable rules (carry these into any new caller)

1. **No currency conversion anywhere actionable.** History is grouped by
   original billing currency. The only converted figure is the hover/tap IDR
   estimate on a foreign-currency price (`HistoricalPriceCell`), computed at
   **that transaction's own historical rate** — never today's rate, never
   used in a calculation, sort, or filter.
2. **Unit conversion factor is per-transaction-historical.** `UnitConversionNote`
   only accepts `factor` as a prop — it has no access to today's unit-factor
   map, so a caller structurally cannot violate this by "helpfully" wiring it
   to a live lookup. See `app/data/price-history.ts` row `ph-9` for a seeded
   example where the historical factor differs from today's.
3. **"Last 10" is fetched independently per scope.** `usePriceHistory`'s
   `vendorResult` and `allResult` are two separate computeds, each an
   independent query — never derive one by filtering the other's already
   -capped result. This was a real bug in an earlier iteration.
4. **`mode="reference"` has no mutation path.** No apply action, no vendor-set,
   no currency-block logic — there's nothing to guard because there's nothing
   to mutate. Don't add an action slot in reference mode.
5. **`mode="apply"`'s "Use this price" changes vendor and unit, never
   currency.** A cross-currency row gets plain "Different currency" text, not
   a disabled button — there's nothing else it could safely do. The unit is
   not optional: a price is only meaningful with the unit it was charged for,
   so writing `entry.price` onto a line whose unit differs multiplies that
   line by the packaging factor (a per-box price on a per-pcs line was off by
   24× before this was fixed). Price and unit move together, and both side
   effects are previewed under the button before the click. This is a copy of
   the recorded pair, not a conversion — `unitFactorAtPurchase` is never
   consulted here, which is what keeps rule 2 intact.
6. **No document-level banner.** `PriceHistoryDrawer`'s `MpBanner` is an
   in-drawer scope explainer, not a document-level "this looks off" signal —
   don't repurpose it as one.

## Keyed by name, not id — deliberately

`app/data/purchase-transactions.ts` has no `productId`/`vendorId` anywhere —
vendor and product are referenced by name throughout that module
(`VENDOR_OPTIONS`, `PRODUCT_OPTIONS`). Price history follows the same
convention: `PriceHistoryEntry.product`/`.vendorName` are names, matched
directly against `PurchaseTransactionLine.product` and
`PurchaseTransaction.vendorName`. Don't introduce ids here — it would make
this the one part of the Purchase module that doesn't join the way
everything else does.

## Components

| Component                     | Responsibility                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PriceHistoryDrawer.vue`      | The `MpDrawer` shell. Owns scope state, the scope toggle, the count line, and the banner. Props: `isOpen`, `mode`, `product`, `vendorName?`, `documentCurrency`, `currentLine?`. Emits `close`, `apply(entry)`. `currentLine` is used by both modes — it renders the current card in `reference`, and in `apply` it is what the unit-change preview compares against, so pass it there too.                      |
| `PriceHistoryRows.vue`        | The rows table. Exposes an `#action` scoped slot per row (only used when `showAction` is true) so the drawer decides what renders there.                                                                                                                                                                                                                                                                         |
| `PriceHistoryCurrentCard.vue` | The read-only "this document · current" card — `mode="reference"` only.                                                                                                                                                                                                                                                                                                                                          |
| `HistoricalPriceCell.vue`     | One historical price cell: money + "for 1 {unit}" + the hover/tap IDR estimate. The one place the disclosed currency exception lives. Uses `~/utils/currency`'s `formatMoney` — a multi-currency formatter kept separate from the Purchase module's own `formatCurrency` (see `docs/patterns/MoneyField.md` for why that's the right call, not a violation of the module's "one formatter per value type" rule). |
| `UnitConversionNote.vue`      | The "1 box = 24 pcs" note, driven entirely by props.                                                                                                                                                                                                                                                                                                                                                             |

## Data layer

`app/composables/usePriceHistory.ts` is the correctness core (rule 3 above).
`app/data/price-history.ts` is mock data for this prototype, seeded against
real names from `PRODUCT_OPTIONS`/`VENDOR_OPTIONS` (`PRODUCT_WITH_HISTORY` =
"Wireless Mouse", `PRODUCT_NO_HISTORY` = "LED Desk Lamp") so the feature has
real data to show on the actual invoice pages, not a disconnected mock
dataset. A real implementation replaces this with an API call but should
keep the same per-scope independent-query shape.

## Porting to Purchase Order

- Reuse every component and the composable as-is.
- In `PurchaseTransactionForm.vue`, drop (or extend) the `props.type === "invoice"`
  guard around the trigger and the `<PriceHistoryDrawer>` mount — the rest of
  the wiring (`activeLineKey`, `activeLine`, `onApplyPrice`) already works for
  any type that shares this form component.
- Keep the line-items table itself page-specific — it isn't part of this
  component set on purpose (see `docs/patterns/details-page-format.md` §
  "Resolved — Purchase Price History").
