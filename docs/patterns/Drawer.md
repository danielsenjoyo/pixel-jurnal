# Drawer

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (filter drawer).
> See also [`FilterBar`](./FilterBar.md), [`Form`](./Form.md), [`Modal`](./Modal.md).

## Purpose

A right-side panel for the full filter set (or any secondary form that shouldn't
take over the whole screen). Composed from the `MpDrawer` parts.

> **Two drawer flavors.** This page describes the **live** filter drawer —
> fields bind the same refs as the toolbar, so "Apply just closes." For a
> drawer with many fields, per-field validation, or edits that must be
> discardable via Cancel, use the **staged draft/applied** pattern instead:
> see [`AdvancedFilter`](./AdvancedFilter.md). Don't assume "Apply just closes"
> applies universally — check which flavor a given drawer actually implements.

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

## Gotchas

- `placement="right"`, `size="sm"` for the filter use case. Larger forms can use `md`.
- The drawer fields and the quick filters bind the **same** refs (see [`FilterBar`](./FilterBar.md)).
