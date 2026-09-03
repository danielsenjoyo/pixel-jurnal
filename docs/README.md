# Mekari Jurnal — Documentation

Reference docs for building screens in the Mekari Jurnal prototype. Everything
here targets **Pixel 3 token mode 2.1** (`app/app.vue` → `setNextTheme(false)`)
and the `@mekari/pixel3` component library.

> **Before writing or editing any component**, call the Pixel MCP / `pixel-docs-jurnal`
> skill first. Never guess props, tokens, or icon names.

## Start here

| If you want to…                                 | Read                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Understand the app shell (header/sidebar/stage) | [`design.md`](./design.md)                                                                                              |
| Look up a raw token value                       | [`tokens.md`](./tokens.md)                                                                                              |
| Pick patterns for a kind of page                | [`patterns/page-recipes.md`](./patterns/page-recipes.md)                                                                |
| Build a list/index screen                       | [`patterns/index-page-format.md`](./patterns/index-page-format.md) + [`index-page-pattern.md`](./index-page-pattern.md) |
| Build a single-record screen                    | [`patterns/details-page-format.md`](./patterns/details-page-format.md)                                                  |
| Build a create/edit form screen                 | [`patterns/form-page-format.md`](./patterns/form-page-format.md) + [`patterns/Form.md`](./patterns/Form.md)             |

## Map

### Shell & tokens

- **[`design.md`](./design.md)** — the app shell: AppHeader, AppSidebar (+ submenu), PageTitle, PageStage; iconography; import discipline; styling rules.
- **[`tokens.md`](./tokens.md)** — raw Pixel 2.1 token values (colours, spacing, type, layout).

### Page construction — [`patterns/`](./patterns/)

Each file is one focused, copy-pasteable pattern. They link to the reference
implementation [`app/pages/templates/index-template.vue`](../app/pages/templates/index-template.vue).

**Recipes (what goes where)**

- [`page-recipes.md`](./patterns/page-recipes.md) — which patterns assemble which page type.
- [`index-page-format.md`](./patterns/index-page-format.md) — index/list page zone composition.
- [`details-page-format.md`](./patterns/details-page-format.md) — single-record page composition.
- [`form-page-format.md`](./patterns/form-page-format.md) — create/edit form page composition (+ the Purchase module page map).

**Building blocks**

- [`page-title-bar.md`](./patterns/page-title-bar.md) — title + action row.
- [`Tabs.md`](./patterns/Tabs.md) — page-level vs. content tabs.
- [`SummaryBox.md`](./patterns/SummaryBox.md) — KPI strip.
- [`FilterBar.md`](./patterns/FilterBar.md) — quick filters + search.
- [`Drawer.md`](./patterns/Drawer.md) — right-side filter/form panel.
- [`TablePage.md`](./patterns/TablePage.md) — fixed-layout table, sticky header + Actions.
- [`BulkActionBar.md`](./patterns/BulkActionBar.md) — selection header swap.
- [`Pagination.md`](./patterns/Pagination.md) — rows-per-page + page-jump footer.
- [`StatusBadge.md`](./patterns/StatusBadge.md) — domain status → `MpBadge type`.
- [`BlankSlate.md`](./patterns/BlankSlate.md) — adaptive empty state.
- [`Form.md`](./patterns/Form.md) — `MpFormControl`-wrapped fields.
- [`Modal.md`](./patterns/Modal.md) — centred confirm/focused dialog.

### Deep reference

- **[`index-page-pattern.md`](./index-page-pattern.md)** — the exhaustive index-page reference (full rationale, state-model table, component gotchas, changelog). The `patterns/` files are the focused extract; this is the long form.

## Conventions

- **Token mode 2.1.** Page-body styling uses Panda **`css()`** with Pixel token shortcuts (`gap: 4`, `bg: "gray.25"`). The shell's scoped CSS uses the project `--color-*` / `--spacing-*` tokens (see `design.md`). Don't mix the two layers.
- **No inline `style`**, no `<style>` blocks in pages — `css()` only. Raw `var(--mp-*)` is allowed inside `css()` values only for hairline borders/shadows a shorthand can't express.
- **Living docs.** When a pattern changes, update its `patterns/` file (and `index-page-pattern.md` if it's the index page) in the same change.
