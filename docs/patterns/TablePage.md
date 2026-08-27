# Table

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) Zone D.
> Full rationale: [`index-page-pattern.md` §9](../index-page-pattern.md).
> See also [`BulkActionBar`](./BulkActionBar.md), [`StatusBadge`](./StatusBadge.md), [`Pagination`](./Pagination.md), [`BlankSlate`](./BlankSlate.md).

## Purpose

The record table — a **fixed-layout** `MpTable` with a sticky header, a pinned
Actions column, sortable headers, a skeleton loading state, and a header row that
swaps to the [`BulkActionBar`](./BulkActionBar.md) while rows are selected.

## Structure

The whole block is gated by `v-if="filteredRows.length"`; otherwise the
[`BlankSlate`](./BlankSlate.md) renders instead.

```
MpTableContainer (ref=tableContainerRef, overflow-x:auto)
└ MpTable (is-hoverable, tableFixedClass)
  ├ <colgroup>          ← authoritative column widths
  ├ MpTableHead (is-fixed, tableHeadClass)
  │   ├ bulk-action row (v-if selected.length)   → see BulkActionBar.md
  │   └ column-header row (v-else)
  └ MpTableBody
      ├ skeleton rows   (v-if isLoading)
      └ data rows       (v-else)
```

## Column widths — fixed layout + `<colgroup>`

```ts
const colWidths = ["44px", "18.7%", "14.5%", "17.7%", "17.9%", "16.1%", "15%", "140px"];
const tableFixedClass = css({ tableLayout: "fixed", minWidth: "800px" });
```

- `table-layout: fixed` + a `<colgroup>` make widths **authoritative and content-independent** — this is what stops the body reflowing when the header swaps to the bulk bar (a single `colspan` cell).
- **Checkbox column = fixed `44px`; Actions column = fixed `140px`.** The middle columns are **percentages summing to 100%**, so they absorb remaining width and the two fixed columns never grow.
- `min-width: 800px` preserves natural width: on a narrow container `MpTableContainer` **scrolls horizontally** instead of squeezing columns.
- **Don't pick the middle-column percentages evenly** — weight them by each column's real minimum need (header label + sort icon, and typical data like "Sales Invoice #10040" or a "Partially paid" badge). An even split looks fine until a column's header can't fit in its share and starts clipping (see the two gotchas below).
- **A page whose column _set_ varies at runtime** (tabs with different field counts, e.g. `app/pages/sales.vue`'s 6–8 columns per document type) can't use one static `minWidth` literal — a value sized for the narrow tab is too tight for the wide one. Compute both `colWidths` and the table's `min-width` from the **same per-column-key minimum-px map**, and apply the `min-width` as an inline `:style` on `MpTable` (same treatment as the `<col>` widths below — genuinely per-instance data, not a themeable value, so this is a deliberate, narrow exception to the "no inline `style`" rule). A single shared source of truth keeps the ratios and the overall minimum consistent.

```ts
const COLUMN_MIN_PX: Record<ColKey, number> = {
  number: 150,
  customer: 160,
  date: 90,
  status: 110,
  total: 110 /* … */
};
const colWidths = computed(() => {
  const totalMin = columns.value.reduce((sum, c) => sum + COLUMN_MIN_PX[c.key], 0);
  return [
    "44px",
    ...columns.value.map((c) => `${((COLUMN_MIN_PX[c.key] / totalMin) * 100).toFixed(2)}%`),
    "140px"
  ];
});
const tableMinWidth = computed(() => {
  const totalMin = columns.value.reduce((sum, c) => sum + COLUMN_MIN_PX[c.key], 0);
  return `${44 + totalMin + 140}px`;
});
```

```vue
<MpTable is-hoverable :class="tableFixedClass" :style="{ minWidth: tableMinWidth }">
```

## Header

- `MpTableHead is-fixed` (sticky). The library draws its bottom border as a **2px box-shadow on `<thead>`** — override to **1px** via `tableHeadClass` (`box-shadow: 0 1px 0 0 var(--mp-colors-gray-100)`).
- Sortable headers are a borderless `<button>` (`sortHeaderClass`): label + sort icon (`sortIconFor`: `sort-default` / `sort-ascending` / `sort-descending`). Numeric columns add `numCellClass` (`text-align: right`).
- The **Actions header cell has no label** — an empty `<th>` carrying the sticky/divider classes.

## Pinned Actions column

```ts
const actionHeadClass = css({ position: "sticky", right: "0", zIndex: 3, bg: "gray.25" });
const actionCellClass = css({ position: "sticky", right: "0", zIndex: 1 }); // no bg → inherits td bg
const actionBorderClass = css({ boxShadow: "inset 2px 0 0 0 var(--mp-colors-gray-100)" });
```

- `position: sticky; right: 0` keeps the column pinned at any resolution.
- **Header** cell sets `bg: gray.25` (matches the header band); **body** cell sets **no background** so it inherits the native `td` bg — white at rest, `gray.50` on hover — keeping the pinned cell in sync with row hover.
- The **2px left divider** (`actionBorderClass`, an inset shadow → no layout width) applies **only while the table overflows**, tracked via a `ResizeObserver` on the container (`isTableOverflowing`).

## Body

- First data cell is the record link: `<MpTextlink as="button" variant="primary" @click="onOpen(row)">`.
- Status cell uses an [`StatusBadge`](./StatusBadge.md) (`MpBadge for="tableStatus"`).
- Last cell = row actions: an `MpPopover` (`placement="bottom-end"`) → secondary `Actions` dropdown → `MpPopoverList` of `role="menuitem"` items.

## Loading (skeleton)

While `isLoading`, render 5 skeleton rows of `columns.length + 2` cells, each an
`MpSkeleton is-loading` wrapping a `skeletonBarClass` bar. Toggle `isLoading`
around your fetch.

## Gotchas

- **No classes on `tr`/`td`** for table styling — `MpTable` styles via `.mp-table` descendants. Pass layout via `:class` on `MpTable` / `MpTableHead`, and the sticky/width classes on the specific `as="th"`/`as="td"` cells.
- Re-check overflow after the row set changes: `watch(() => filteredRows.length, () => requestAnimationFrame(checkTableOverflow))`.
- **`MpTableContainer` has no default overflow behavior at all.** Its Panda recipe ships zero base CSS; horizontal scroll only turns on via the `has-shadow` prop (`<MpTableContainer has-shadow>`), which sets the inner scroll div's `overflow-x: scroll`. Without it, a table wider than its container **doesn't scroll — it just overflows the page**, silently defeating the whole fixed-layout-plus-`min-width` design above. `templates/index-template.vue` is missing this too (its own comment claims "scrolls horizontally (overflow-x:auto)," which isn't accurate for the installed version) — always pass `has-shadow` explicitly, don't assume it's a default.
- **Every body/header cell needs its own overflow clipping** (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) — `table-layout: fixed` gives each column an authoritative _width_, but without clipping, content wider than that width still renders past the column's edge and visually bleeds into (or behind) the next one instead of truncating. Apply a clip class directly on every `as="th"`/`as="td"` (it's safe there — it doesn't touch `display`, so the cell keeps `display: table-cell`). One level _inside_ that, anything laid out as `inline-flex`/`flex` (an `MpTextlink` button, the sortable-header button + icon) needs its own inner text wrapped in a **block-level** span with `min-width: 0` — flex items default to `min-width: auto` (shrink-to-content), so without it the parent cell's clipping never gets a chance to bite and, worse, a `justify-content: center` flex button clips symmetrically from both ends instead of truncating with a trailing "…".
