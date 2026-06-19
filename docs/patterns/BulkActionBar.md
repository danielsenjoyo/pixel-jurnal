# Bulk Action Bar

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (table head, `v-if="selected.length"`).
> See also [`TablePage`](./TablePage.md).

## Purpose

When one or more rows are selected, the table's **column-header row is replaced**
by a bulk-action bar: the select-all checkbox + `{n} selected` + a primary
`Actions` dropdown + a ghost `Delete`. The body below does **not** move.

## Markup

```vue
<MpTableRow v-if="selected.length">
  <MpTableCell as="th" :class="checkboxCellClass">
    <MpCheckbox
      :is-checked="allOnPageSelected"
      :is-indeterminate="someOnPageSelected && !allOnPageSelected"
      @change="toggleAllOnPage"
    />
  </MpTableCell>
  <MpTableCell as="th" :colspan="columns.length + 1" :class="bulkCellClass">
    <div :class="bulkBarClass">
      <MpText size="label" weight="semiBold" color="dark">{{ selected.length }} selected</MpText>
      <MpPopover placement="bottom-start" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="primary" size="sm" right-icon="caret-down">Actions</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent><MpPopoverList>…</MpPopoverList></MpPopoverContent>
        </template>
      </MpPopover>
      <MpButton variant="ghost" size="sm" @click="onBulkDelete">Delete</MpButton>
    </div>
  </MpTableCell>
</MpTableRow>
```

## Rules

- The bar is a **single `colspan` cell** (`:colspan="columns.length + 1"`) sitting beside the checkbox cell. Because the table is `table-layout: fixed` with a `<colgroup>` (see [`TablePage`](./TablePage.md)), swapping in this single wide cell does **not** reflow the body columns.
- **Match the height to the default header.** The default header cell is `py:16 + 20px label = 52px`; the sm action button is 30px, so set `bulkCellClass` to `py: 11px` (11 + 30 + 11 = 52) so the 1px bottom border stays on the same sub-pixel line and the body doesn't jump. Don't hardcode a `height` — it lands off-grid and the border looks bolder.
- The bulk row keeps the **same 1px header divider** as the default row (`tableHeadClass` applies to both).

## Selection model

- Selection is **scoped to the current page**: `toggleAllOnPage` only touches `pagedRows` ids; `allOnPageSelected` / `someOnPageSelected` drive the header checkbox's checked/indeterminate state.
- Clearing selection (or paging away) returns the header to the default column row.

## Gotchas

- The label uses `size="label"` / `weight="semiBold"` to match the column-header type exactly.
