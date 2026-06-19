# Page Recipes

> Quick lookup: **which patterns assemble which kind of page.** Start here, then
> open the linked pattern files. For the deep index-page walkthrough see
> [`index-page-pattern.md`](../index-page-pattern.md).

## Every page starts the same

One [`page-title-bar`](./page-title-bar.md) (via `DefaultPageContent`) → optional
page-level [`Tabs`](./Tabs.md) → the white `PageStage` body. The recipes below
only differ in what fills the stage.

## Recipe: Index / list page

> Browse + filter + paginate a collection. Full recipe: [`index-page-format`](./index-page-format.md).

`page-title-bar` → `Tabs` (page-level, optional) → **stage:** `SummaryBox` (opt) →
`Tabs` (content, opt) → `FilterBar` + `Drawer` → `TablePage` (+ `BulkActionBar`,
`StatusBadge`) **or** `BlankSlate` → `Pagination`.

## Recipe: Details / single-record page

> View or edit one record. Full recipe: [`details-page-format`](./details-page-format.md).

`page-title-bar` (record name + lifecycle actions) → `Tabs` (sections, opt) →
**stage:** identity header (`StatusBadge`) → `SummaryBox` (opt) → `Form` (read/edit
sections) → compact `TablePage` (related lists) → `Modal` (destructive confirm).

## Recipe: Create / edit form page

> A focused data-entry screen. _No dedicated format doc — compose from [`Form`](./Form.md)._

`page-title-bar` (`{Verb} {Entity}` + Save/Cancel actions) → **stage:** stacked
[`Form`](./Form.md) sections → footer action row (Cancel / Save). Confirm
discard-on-leave via a [`Modal`](./Modal.md).

## Recipe: Settings page

> A list of settings groups or a single settings form.

`page-title-bar` → `Tabs` (settings sections, opt) → **stage:** either a
[`Form`](./Form.md) (single group) or a list of grouped controls. Reuse
[`TablePage`](./TablePage.md) only when the settings are genuinely tabular
(e.g. user/role lists, custom-field definitions).

## Pattern index

| Pattern                                           | One-liner                                        |
| ------------------------------------------------- | ------------------------------------------------ |
| [`page-title-bar`](./page-title-bar.md)           | Title + action row at the top of every page.     |
| [`Tabs`](./Tabs.md)                               | Page-level (flush to stage) vs. content tabs.    |
| [`SummaryBox`](./SummaryBox.md)                   | KPI strip of two-tone summary cards.             |
| [`FilterBar`](./FilterBar.md)                     | Quick filters + search + Filter button.          |
| [`Drawer`](./Drawer.md)                           | Right-side panel for the full filter set / form. |
| [`TablePage`](./TablePage.md)                     | Fixed-layout table, sticky header + Actions.     |
| [`BulkActionBar`](./BulkActionBar.md)             | Header swap while rows are selected.             |
| [`Pagination`](./Pagination.md)                   | Rows-per-page + page-jump footer.                |
| [`StatusBadge`](./StatusBadge.md)                 | Domain status → `MpBadge type`.                  |
| [`BlankSlate`](./BlankSlate.md)                   | Adaptive search-not-found empty state.           |
| [`Form`](./Form.md)                               | `MpFormControl`-wrapped fields.                  |
| [`Modal`](./Modal.md)                             | Centred confirm / focused dialog.                |
| [`index-page-format`](./index-page-format.md)     | Index-page zone composition.                     |
| [`details-page-format`](./details-page-format.md) | Details-page zone composition (proposed).        |
