# Report page format

> A **report** screen: pick a date range and criteria, press a button, read a
> table with a TOTAL row. Looks like an index page and isn't one.
> Reference impl: [`app/pages/reports/purchases_list.vue`](../../app/pages/reports/purchases_list.vue),
> [`PurchaseReportFilterDrawer.vue`](../../app/components/reports/PurchaseReportFilterDrawer.vue);
> data: [`purchase-report.ts`](../../app/data/purchase-report.ts),
> [`purchase-report-filter.ts`](../../app/data/purchase-report-filter.ts).
> See also [`index-page-format`](./index-page-format.md), [`TablePage`](./TablePage.md),
> [`Drawer`](./Drawer.md), [`reports-index-format`](./reports-index-format.md).

Ported from `jurnal-frontend-app` → `src/pages/reports/purchases_list/`.

## How it differs from an index page

Same table, different contract. Copying the index recipe wholesale gives you
three controls that don't belong and loses the two that matter.

| Index page                                 | Report page                                       |
| ------------------------------------------ | ------------------------------------------------- |
| Filters live — list re-renders as you type | **Runs on demand** — press Filter                 |
| Keyword search box                         | **No search** — narrowed by criteria, not by text |
| Row checkboxes + bulk bar                  | None — a report row isn't an actionable record    |
| Row `Actions` menu                         | None — the record's own page is one link away     |
| Rows are the data                          | Rows plus a **TOTAL** footer row                  |
| Fixed column set                           | **Column layout picker** ("template")             |

**The Filter button is the whole point.** A report is a query someone composes
and then submits — that's why the first thing on screen is "Report will appear
here" and not a table. Wire the filter live and both the button and that blank
state become lies.

## Composition

```
page-title-bar ("Purchase list", breadcrumb → /reports)
  #actions: [Template ▾] [Export ▾]
  → stage:
      filter bar:  Start date │ End date │ Period ▾ │ [Filter] │ [More filter •]
      meta strip:  "Purchase Invoice · Last month · 01/08/2026 – 31/08/2026 · IDR"
      table (+ TOTAL row)  ── OR ── blank slate
      pagination
```

**Filter bar.** One `flex-end` row, no `space-between`: the two dates, the
period select, then the two buttons. The buttons act on the controls beside
them, so they stay beside them. Date fields are **180px** — at 160 the
`DD/MM/YYYY` value clips behind `MpDatePicker`'s calendar addon.

**Template and Export** are page-scoped actions, not filters, so they sit in
the title band's `#actions` (production keeps them on the filter row). Export
is disabled until the report has been run — there is nothing to export before.

**Meta strip.** Transaction type · period · date range · currency, in one
`body-small / gray.600` line under the filter bar. It exists so an exported or
screenshotted table can be read on its own; it also gives the Filter button
visible feedback, since the criteria that produced the table are otherwise only
in the drawer.

## Two filter objects, never one

```ts
const filter = reactive<PurchaseReportFilter>(defaultPurchaseReportFilter()); // being edited
const applied = ref<PurchaseReportFilter | null>(null); // what the table reads
```

`filteredRows` reads **`applied`**, never `filter`. `runReport()` snapshots one
into the other. Collapsing them into a single ref re-runs the report on every
keystroke, which makes the Filter button and the "not run yet" blank state
meaningless.

`applied === null` **is** the "not run yet" state — no separate `hasRun` flag to
drift out of sync with it.

## The dot on More filter

`isReportFilterActive` deliberately **ignores the date range and transaction
type**: those two sit on the filter bar in plain sight. Only the drawer-only
criteria (vendor, status, tags, date-by) light the dot, because only those
vanish when the drawer closes. A dot that's always lit says nothing.

## Column layouts

Production persists per-company layouts and edits them in a builder; the
prototype ships three fixed sets (Standard / Detailed / Summary) in
`PURCHASE_REPORT_LAYOUTS`. Each column carries its own **px width**, and the
table's `min-width` is their sum — with a variable column set, percentages
summing to 100% (the index-page rule) can't work.

## The TOTAL row

Last row of `MpTableBody`, `semiBold`, with a `gray.300` top rule. First cell
reads `TOTAL`; every `numeric` column shows its sum.

**It sums every filtered row, not the current page** — that's what the number is
for. Production renders it only on the last page, which hides it entirely
unless you happen to navigate there.

## Two blank states

| Cause                | Title                                          | Body                                                    |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Not run yet          | "Report will appear here"                      | "Select dates or period, then click the Filter button." |
| Ran, matched nothing | "There was no report data on this date/period" | "Recheck the filter or select another date/period."     |

Copy is verbatim from production. The second one gets a **Clear filters**
button when the drawer filter is active — same rule as
[`BlankSlate`](./BlankSlate.md): a staged drawer hides its own criteria, so an
empty table needs a visible way out.

## Rows come from the module, not a new fixture

`buildPurchaseReportRows()` projects
[`purchase-transactions.ts`](../../app/data/purchase-transactions.ts) — the same
array the Purchases list, detail and form pages read and write. A report over a
parallel fixture drifts from the module it reports on, and its money and date
formats drift with it (see [`page-recipes`](./page-recipes.md) § "one format per
value type, per module"). Derived figures like `grossAmount` are computed in the
projection rather than stored, so they can't disagree with the transaction.

**Default period is `this_quarter`, not production's `today`.** A real company
books transactions daily; this fixture spreads 13 records per type over ~5
weeks, so "Today" would return one row and demonstrate nothing.

## Gotchas

- **`formatDisplayDate` and `formatAmount` come from `purchase-transactions.ts`.** Never hand-roll a formatter here.
- The transaction-number link is only rendered for types that have a detail page — `financing` has none, so those rows show plain text rather than a link that 404s.
- Column heads are **Title Case** ("Balance Due"), unlike the rest of the app. That's production's shared report dictionary, and reports are their own vocabulary in the product — don't sentence-case them to match other screens.
