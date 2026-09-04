# Price history components — reuse contract

Built for the Purchase Invoice draft-review and entry-form screens
(`app/pages/purchase/invoices/[id].vue` and `new.vue`). Everything here is
document-type-agnostic — porting this to Purchase Order should mean writing
two new page files and **zero new price-history logic**.

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
5. **`mode="apply"`'s "Use this price" only ever changes vendor, never
   currency.** A cross-currency row gets plain "Different currency" text, not
   a disabled button — there's nothing else it could safely do.
6. **No document-level banner.** `PriceHistoryDrawer`'s `MpBanner` is an
   in-drawer scope explainer, not a document-level "this looks off" signal —
   don't repurpose it as one.

## Components

| Component | Responsibility |
|---|---|
| `PriceHistoryDrawer.vue` | The `MpDrawer` shell. Owns scope state, the scope toggle, the count line, the banner, and the footer disclaimer. Props: `isOpen`, `mode`, `productId`, `productName`, `productCode`, `vendorId?`, `vendorName?`, `documentCurrency`, `currentLine?`. Emits `close`, `apply(entry)`. |
| `PriceHistoryRows.vue` | The rows table. Exposes an `#action` scoped slot per row (only used when `showAction` is true) so the drawer decides what renders there. |
| `PriceHistoryCurrentCard.vue` | The read-only "this document · current" card — `mode="reference"` only. |
| `HistoricalPriceCell.vue` | One historical price cell: money + "for 1 {unit}" + the hover/tap IDR estimate. The one place the disclosed currency exception lives. |
| `UnitConversionNote.vue` | The "1 box = 24 pcs" note, driven entirely by props. |

## Data layer

`app/composables/usePriceHistory.ts` is the correctness core (rule 3 above).
`app/data/price-history.ts` is mock data for this prototype — a real
implementation replaces this with an API call but should keep the same
per-scope independent-query shape.

## Porting to Purchase Order

- Reuse every component and the composable as-is.
- Write a new page (or two) that supplies `productId`, `vendorId`,
  `documentCurrency`, and (for `mode="apply"`) handles the `apply` event by
  updating that document's own line-item state — same contract as
  `app/pages/purchase/invoices/new.vue`.
- Keep the line-items table itself page-specific — it isn't part of this
  component set on purpose (see the approved plan).
