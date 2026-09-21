# Nested Table (Group / Detail Rows)

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`report.vue`](../../app/pages/sales/credit-memo/report.vue) (customer → credit memo rows).
> See also [`TablePage`](./TablePage.md), [`StatusBadge`](./StatusBadge.md).

## Purpose

A two-level table where a **group header row** (customer, project, batch — any
parent entity) sits above a variable set of **detail rows**, with an optional
**group footer row** for a subtotal. Used when data has a natural parent/child
grouping and the parent needs its own summary (total, count, status) rather
than being just another column.

## When to use

- Rows naturally group under a parent that itself needs a rendered summary row
  (e.g. "Total remaining balance" per customer).
- The group should be collapsible/expandable, defaulting to expanded so
  detail-level data needs no extra click (see `index-page-pattern.md`'s
  "expanded by default" rationale for report-style pages).

For a flat list with no natural parent grouping, use the plain [`TablePage`](./TablePage.md)
pattern instead — don't reach for this just to add a decorative header row.

## Markup

```vue
<MpTableContainer>
  <MpTable :is-hoverable="false" :class="tableFixedClass">
    <colgroup>
      <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
    </colgroup>
    <MpTableHead is-fixed>
      <MpTableRow>
        <MpTableCell as="th">Column A</MpTableCell>
        <!-- ...remaining column headers... -->
      </MpTableRow>
    </MpTableHead>
    <MpTableBody>
      <template v-for="block in groupedRows" :key="block.group.id">
        <!-- Group header row: ONE cell with colspan, plain <div> inside for
             the flex layout — see Gotchas below. -->
        <MpTableRow>
          <MpTableCell as="td" :colspan="columnCount" :class="groupHeaderCellClass">
            <div :class="groupHeaderRowClass">
              <button type="button" @click="toggleGroup(block.group.id)">
                <MpIcon name="chevrons-down" :class="block.isExpanded ? openClass : closedClass" />
                {{ block.group.label }}
              </button>
              <MpText weight="semiBold">{{ formatTotal(block.total) }}</MpText>
            </div>
          </MpTableCell>
        </MpTableRow>

        <template v-if="block.isExpanded">
          <MpTableRow v-for="row in block.rows" :key="row.id">
            <MpTableCell as="td">{{ row.a }}</MpTableCell>
            <!-- ...remaining detail cells... -->
          </MpTableRow>

          <!-- Group footer row: same colspan-cell + inner-div technique. -->
          <MpTableRow>
            <MpTableCell as="td" :colspan="columnCount" :class="groupFooterCellClass">
              <div :class="groupFooterRowClass">
                <MpText color="gray.600">Total</MpText>
                <MpText weight="semiBold">{{ formatTotal(block.total) }}</MpText>
              </div>
            </MpTableCell>
          </MpTableRow>
        </template>
      </template>
    </MpTableBody>
  </MpTable>
</MpTableContainer>
```

```ts
// Frame tone on group header/footer cells only — bg: "gray.25" (no other
// override). Never set display on the <td> itself (see Gotchas).
const groupHeaderCellClass = css({ bg: "gray.25" });
const groupHeaderRowClass = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
});
```

## Rules

- **Group header/footer rows use ONE `MpTableCell` with `:colspan="columnCount"`.**
  `colspan` is a real prop-fallthrough attribute here (`MpTableCell` doesn't
  declare it, but Vue forwards unknown attrs to the root element) — confirmed
  working in `index-template.vue`'s bulk-action row and reused here.
- Detail rows use the real per-column cells, one `MpTableCell` per column,
  matching the `<colgroup>` exactly.
- Expanded by default (`isExpanded` defaults `true` per group) — no extra
  click needed to see detail rows, consistent with the index-page pattern's
  general bias toward showing data over hiding it behind interaction.
- Sort groups and detail rows server-side (or in the computed that builds
  `groupedRows`) — never re-sort in the template.
- **Declare the columns once and derive everything from that array.** The header
  is rendered at least twice (the real table and the loading skeleton), the
  skeleton's cells-per-row must match it, and `columnCount` feeds every
  `colspan`. A literal column count silently desyncs the skeleton the moment a
  column is added:

  ```ts
  const COLUMNS = [
    { key: "date", label: "Tanggal", width: "130px", numeric: false },
    { key: "desc", label: "Deskripsi", width: "", numeric: false }, // auto-width
    { key: "saldo", label: "Saldo", width: "150px", numeric: true }
  ] as const;
  const columnCount = COLUMNS.length;
  ```

- **A column that only applies to detail rows stays blank on group rows** — do
  not repurpose it at the group level. In the credit-memo report, `Mutasi` (the
  signed movement) is blank on customer and CM rows, which is what makes the
  column read as "only ledger lines move". Pair it with a running-balance column
  rather than making one column mean two different things by row depth.

## Gotchas

- **Never set `display: flex` (or any non-`table-cell` display) directly on
  the colspan `<td>`.** Doing so drops the browser's table-cell layout
  algorithm for that cell entirely — `colspan` becomes meaningless, the cell
  collapses to roughly one column's width, and its content visually overlaps
  the cells in the row below. Put the flex layout on an inner `<div>` instead
  (see the `groupHeaderRowClass` div in the markup above) and leave the cell
  itself with its native `table-cell` display — only override its
  background/padding.
- One flexible ("auto-width") column in a `table-layout: fixed` table must
  have **no width in its `<col>`** (leave the string empty, not `"1%"`). A
  percentage width is sized literally against the table's own width, not
  against remaining space — `"1%"` renders as a near-zero column instead of
  absorbing leftover width the way an unset/auto column does.
- If a row needs a temporary "flash" highlight (e.g. scrolled-to via search),
  give it a stable `:id` and swap its class conditionally — don't add a
  separate always-mounted overlay element for the highlight.
