# MoneyField

> Part of the Mekari Jurnal page-construction pattern set.
> See also the Purchase module's own formatters: `docs/patterns/page-recipes.md`
> § "Cross-page rule: one format per value type, per module".

## Purpose

There are two genuinely different money-formatting jobs in this app, and
they deliberately use two different formatters — this doc is about not
confusing the two.

## The document's own currency — use the module's formatter

A page displaying or editing amounts in **the record's own currency** (an
invoice's line prices, its subtotal/total) must use that module's single
exported formatter — for Purchase, `formatCurrency`/`formatAmount`/
`parseAmount` from [`~/data/purchase-transactions.ts`](../../app/data/purchase-transactions.ts).
Don't hand-roll a second one; see `page-recipes.md`'s "one format per value
type" rule for what happened the one time this drifted.

## A foreign/historical currency — use `~/utils/currency.ts`

[`app/utils/currency.ts`](../../app/utils/currency.ts) is a **different,
narrower job**: displaying a **historical** price that may be in a currency
other than the current document's — the Purchase Price History feature's
core case (see [`price-history/README.md`](../../app/components/price-history/README.md)).
This isn't a competing formatter for the same value type as `formatCurrency`
— the Purchase module's own generated data is always IDR by design (see the
scoping comment in `purchase/invoice/[id].vue`), so nothing else in the app
needs to format a USD or SGD amount. Price history does, because "never
convert currency, show the original" is one of its non-negotiable rules.

**Never convert currency for comparison, sorting, or applying a value.**
Money in this app is always displayed and acted on in its **original**
currency. The only place a converted figure may appear at all is a
**disclosed, informational-only** estimate (an IDR hover estimate on a
foreign-currency historical price) — and that estimate must:

- be computed at the rate that applied **at the relevant historical moment**,
  never today's rate,
- never feed into a calculation, sort, filter, or default value,
- be visually distinct from the actual (non-converted) amount, and
- be disclosed in the UI (a header note), not a silent hover-only discovery.

## What `~/utils/currency.ts` exports

| Function                             | Use                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `formatMoney(amount, currency)`      | `Rp`/`US$`/`SGD` display — 2 decimals for every currency, IDR included, so a historical rupiah figure is recognisable as the same value the Purchase module renders with `formatCurrency`. |
| `currencySymbol(currency)`           | Just the symbol, for a label or addon.                                                                                                                                                     |
| `formatRate(rate)`                   | An exchange rate, always IDR-denominated: `Rp16,470`.                                                                                                                                      |
| `historicalIdrEstimate(price, rate)` | The disclosed hover-estimate calculation itself.                                                                                                                                           |

There is no editable multi-currency input here — historical rows are
read-only display only. An editable **document-currency** money field still
follows the Purchase module's own convention: `MpInputGroup` +
`MpInputLeftAddon` + a `v-model` on a display-text mirror, parsed via
`parseAmount`/formatted via `formatAmount` on `focusout` only — see the
Unit price cell in [`PurchaseTransactionForm.vue`](../../app/components/purchase/PurchaseTransactionForm.vue)
for the live reference, and its inline comment for why live-reformatting a
field with decimals is unusable.
