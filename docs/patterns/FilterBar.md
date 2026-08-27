# Filter Bar

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) Zone C.
> See also [`Drawer`](./Drawer.md) (the full filter set), [`BlankSlate`](./BlankSlate.md) (recovery).

## Purpose

The control row above the table: quick filters and search on one line, with a
**Filter** button that opens the full filter [`Drawer`](./Drawer.md).

## Anatomy

A flex `space-between` row (`filterBarClass`):

- **Left (`filterLeftClass`)** — quick-filter `MpSelect`s, each in a fixed 180px box (`quickFilterClass`).
- **Right (`filterRightClass`)** — the **Filter** button + a search field (260px, `searchGroupClass`).

```vue
<div :class="filterBarClass">
  <div :class="filterLeftClass">
    <div :class="quickFilterClass">
      <MpSelect v-model="filterCategory" placeholder="All categories" is-full-width is-clearable>
        <option value="">All categories</option>
        <option v-for="opt in categoryOptions" :key="opt" :value="opt">{{ CATEGORY_LABEL[opt] }}</option>
      </MpSelect>
    </div>
  </div>

  <div :class="filterRightClass">
    <MpButton variant="secondary" left-icon="filter" @click="isFilterDrawerOpen = true">Filter</MpButton>

    <div :class="searchGroupClass"><!-- position:relative -->
      <MpInputGroup>
        <MpInputLeftAddon><MpIcon name="search" size="sm" color="gray.400" /></MpInputLeftAddon>
        <MpInput v-model="search" placeholder="Search..." />
      </MpInputGroup>
      <!-- own clear (×): only with a keyword, revealed on hover/focus -->
      <button v-if="searchTerm" type="button" data-search-clear aria-label="Clear search"
              :class="searchClearClass" @click="search = ''">
        <MpIcon name="reset" size="sm" color="gray.400" />
      </button>
    </div>
  </div>
</div>
```

## Rules

- **`MpSelect` options are native `<option>` children** — this version has **no `:options` prop**. Always include a `<option value="">All …</option>` for the cleared state, plus `is-full-width is-clearable`.
- **Own search clear (×).** Do **not** use `MpInput is-clearable` for search: its native clear is an `<svg>` whose click emits `undefined` (breaking `search.trim()`) and doesn't reliably reset. Render an own `<button data-search-clear @click="search = ''">` inside the `position:relative` `searchGroupClass`, gated by `v-if="searchTerm"` and faded in on `&:hover / &:focus-within`.
- **Shared refs.** Quick filters and the drawer fields bind the **same** refs (`filterCategory`, `filterStatus`, `search`) so both surfaces stay in sync.
- This still holds when the drawer itself uses the staged draft/applied pattern ([`AdvancedFilter`](./AdvancedFilter.md)): quick filters bind straight to the **applied** state (never through the drawer's draft), so they stay "live" even though the drawer's own fields aren't. The Sales index's status/document-type quick selects and search box are the example.
- The **Filter** button opens the [`Drawer`](./Drawer.md), never a popover.
- Normalize the keyword through a `searchTerm` computed: `computed(() => (search.value ?? "").trim())`.

## Gotchas

- `MpSelect` sizes are `sm`/`md` only.
- The search field keeps a fixed `260px` width so the clear × has a stable anchor.
