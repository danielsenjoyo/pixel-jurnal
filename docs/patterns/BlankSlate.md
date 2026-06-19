# Blank Slate / Empty State

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) Zone I (`v-else` of the table).
> Illustration: [`public/illustrations/search-not-found.png`](../../public/illustrations/search-not-found.png).

## Purpose

What replaces the table when nothing matches. Follows the library **"search not
found"** pattern — a centred column of **3D illustration → title → body** — with
copy that **adapts to the cause** (search keyword vs. quick filter vs. genuinely
empty source). No CTA.

## Markup

```vue
<div v-else :class="emptyStateClass"><!-- centered column, gap:3, py:16 -->
  <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
  <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ emptyTitle }}</MpText>
  <MpText size="body-small" color="gray.600" :class="emptyDescClass">{{ emptyDescription }}</MpText>
</div>
```

```ts
const emptyTitle = computed(() => {
  if (searchTerm.value) return `"${searchTerm.value}" not found`;
  if (filterCategory.value || filterStatus.value) return "No results found";
  return "No data yet";
});
const emptyDescription = computed(() => {
  if (searchTerm.value) return "Check the keywords you entered and try your search again.";
  if (filterCategory.value || filterStatus.value)
    return "No items match your filters. Try adjusting them, or clear all filters to start over.";
  return "There's nothing here yet.";
});
```

## Three cases, one block

| Cause                  | Title                | Body                                                                     |
| ---------------------- | -------------------- | ------------------------------------------------------------------------ |
| Search keyword         | `"<term>" not found` | "Check the keywords you entered and try your search again."              |
| Quick filter only      | `No results found`   | "No items match your filters. Try adjusting them…"                       |
| Genuinely empty source | `No data yet`        | "There's nothing here yet." _(swap in a "Create …" CTA on real screens)_ |

## Rules

- **Illustration, not a flat icon.** Use the Mekari Pixel "search not found" asset (3D card + magnifier with a red ✕) at `width: 180px` (`height: auto`) on a decorative `<img alt="">`. New blank-slate illustrations go under `public/illustrations/`.
- **No in-slate CTA.** Title `lg` (16px) semibold; body `body-small / gray.600` capped at `maxWidth: 320px`. Recovery happens through the [`FilterBar`](./FilterBar.md)'s search × and the clearable quick-filter selects — which **stay mounted** above the blank slate (they're outside the `v-if`).
- For the **truly-empty** (first-run) case on a real screen, this is where a "Create …" primary CTA belongs.

## Gotchas

- The empty state and the table are mutually exclusive (`v-if="filteredRows.length"` / `v-else`) — never render both.
- The illustration source is 1500×1250 (6:5); display width is what controls its size, height auto-scales.
