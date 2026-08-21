# Pagination

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) Zone E.
> See also [`TablePage`](./TablePage.md).

## Purpose

The footer row beneath the table: rows-per-page + record range on the left, a
page-jump + prev/next on the right. Follows the official Mekari pagination
pattern (no top border).

## Markup

```vue
<div :class="paginationClass"><!-- space-between, no top border -->
  <div :class="pagerLeftClass">
    <MpText size="body-small" color="gray.600">Rows per page</MpText>
    <MpPopover use-portal is-adaptive-width>
      <MpPopoverTrigger>
        <MpButton variant="ghost" size="sm" right-icon="chevrons-down">{{ perPage }}</MpButton>
      </MpPopoverTrigger>
      <MpPopoverContent>
        <MpPopoverList>
          <MpPopoverListItem v-for="opt in [5, 10, 25, 50]" :key="opt"
            :is-active="perPage === opt" @click="setPerPage(opt)">{{ opt }}</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
    <MpText size="body-small" color="gray.600">
      Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredRows.length }}
    </MpText>
  </div>

  <div :class="pagerRightClass">
    <div :class="pageJumpClass"><!-- 100px wrapper -->
      <MpAutocomplete :data="pageOptions" :model-value="page" is-searchable is-full-width @change="onJumpPage" />
    </div>
    <MpText size="body-small" color="gray.600">of {{ pageCount }} page</MpText>
    <MpTooltip label="Previous page">
      <MpButton variant="ghost" size="sm" left-icon="chevrons-left"
        :is-disabled="page <= 1" aria-label="Previous page" @click="page--" />
    </MpTooltip>
    <MpTooltip label="Next page">
      <MpButton variant="ghost" size="sm" left-icon="chevrons-right"
        :is-disabled="page >= pageCount" aria-label="Next page" @click="page++" />
    </MpTooltip>
  </div>
</div>
```

## Rules

- **Reset `page` to 1** whenever per-page or sort changes (`setPerPage`, `toggleSort`) — **or whenever any filter criteria change**, quick filter, search, or a drawer's Apply (see [`AdvancedFilter`](./AdvancedFilter.md)). The reference `templates/index-template.vue` currently only resets on per-page/sort; `app/pages/sales.vue` is the reference for the broader rule, via a `deep` watch on the applied filter state.
- **Clamp** `page` into `[1, pageCount]` via `watch([page, pageCount], …)`.
- `pageOptions` is `[{ label, value }]`; `MpAutocomplete @change` gives an **option object** — unwrap `.value` in `onJumpPage`.
- Prev/next are icon-only ghost buttons → require `aria-label` and `:is-disabled` at the ends.

## Gotchas

- The page-jump wrapper is **100px** (`pageJumpClass`): the inner `MpInput` has an ~88px min-width, so a narrower wrapper would overflow and cover the "of N page" text.
- Derived units: `pageCount`, `pagedRows`, `rangeStart`, `rangeEnd` are all computed from `filteredRows` + `page` + `perPage`.
