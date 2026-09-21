# Drawer

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (filter drawer).
> See also [`FilterBar`](./FilterBar.md), [`Form`](./Form.md), [`Modal`](./Modal.md).

## Purpose

A right-side panel for the full filter set (or any secondary form that shouldn't
take over the whole screen). Composed from the `MpDrawer` parts.

## When to use

- **Filters** that don't fit the one-line filter bar (the canonical use here).
- Side forms / detail editors where context behind the panel should stay visible.

For destructive confirmation or a focused single-task dialog, use a [`Modal`](./Modal.md) instead.

## Markup

```vue
<MpDrawer
  :is-open="isFilterDrawerOpen"
  placement="right"
  size="sm"
  @close="isFilterDrawerOpen = false"
>
  <MpDrawerOverlay />
  <MpDrawerContent>
    <MpDrawerHeader>
      <span :class="drawerTitleClass">Filter</span>   <!-- fontSize: lg (16px) -->
      <MpDrawerCloseButton />
    </MpDrawerHeader>
    <MpDrawerBody>
      <div :class="filterDrawerFormClass"><!-- flex column, gap:4 -->
        <MpFormControl><MpFormLabel>Category</MpFormLabel><MpSelect …/></MpFormControl>
        <MpFormControl><MpFormLabel>Status</MpFormLabel><MpSelect …/></MpFormControl>
        <MpFormControl><MpFormLabel>Keyword</MpFormLabel><MpInput …/></MpFormControl>
      </div>
    </MpDrawerBody>
    <MpDrawerFooter>
      <div :class="filterDrawerFooterClass"><!-- space-between, full width -->
        <MpButton variant="ghost" @click="resetFilters">Reset</MpButton>
        <MpButton variant="primary" @click="isFilterDrawerOpen = false">Apply</MpButton>
      </div>
    </MpDrawerFooter>
  </MpDrawerContent>
</MpDrawer>
```

## Rules

- **Open state:** drive with `:is-open` + `@close` — this version emits `open`/`close`, **not** `update:isOpen`, so there is **no `v-model:is-open`**. `@close` covers the × button, overlay click, and Esc.
- **Close button placement:** `MpDrawerCloseButton` does **not** self-position — it must live **inside `MpDrawerHeader`** (a flex `space-between` container). As a bare sibling it drops to the top-left.
- **Header title size:** the header recipe sizes text at `md` (14px). Wrap the title in `<span :class="drawerTitleClass">` to bump it to **`lg` (16px)**; weight is inherited from the recipe.
- **Live filters → Apply just closes.** Because fields bind shared refs via `v-model`, filtering happens as you type/select. `Apply` only closes; `Reset` clears the shared refs.
- Form fields are wrapped in `MpFormControl` + `MpFormLabel` — see [`Form`](./Form.md).
- **A multi-select field that filters by picking known entities** (customers,
  tags, groups) uses `MpInputTag` instead of a checkbox list or a plain
  `MpSelect`: type to search, click a suggestion, it becomes a removable tag
  inside the field. Set `is-enable-create-new-tag="false"` so only real
  matches become tags (no free text), `is-show-suggestions="true"`, and pass
  `suggestions` as `{ id, label, value }[]`. Bind the current tag list via
  `:data` + `@change` (not `v-model` — there is no `update:data` event):
  ```vue
  <MpFormControl><MpFormLabel>Customer</MpFormLabel>
    <MpInputTag
      :data="customerTagData"
      :suggestions="customerSuggestions"
      suggestion-key="label"
      :is-show-suggestions="true"
      :is-enable-create-new-tag="false"
      @change="customerTagData = $event"
    />
  </MpFormControl>
  ```
  Reference impl: [`report.vue`](../../app/pages/sales/credit-memo/report.vue)'s
  Customer and Grup Customer filter fields.

## Gotchas

- `placement="right"`, `size="sm"` for the filter use case. A panel whose body
  needs real table width (e.g. a transaction history panel) should use
  `size="lg"` instead — don't force wide content into the `sm` width.
- The drawer fields and the quick filters bind the **same** refs (see [`FilterBar`](./FilterBar.md)).
- **Every `MpFormLabel` must be a descendant of `MpFormControl`.** `MpFormLabel`
  reads its required/invalid state via `MpFormControl`'s provide/inject
  context; used outside one, it throws `Cannot read properties of undefined
(reading 'value')` during render. This is an easy mistake for a bare label
  above a non-form-field wrapper (e.g. a min/max range row) — wrap the whole
  section in `MpFormControl` even if the "field" is really two inputs side by
  side.
