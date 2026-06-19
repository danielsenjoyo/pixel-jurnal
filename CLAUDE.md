# Project: Mekari Jurnal Prototype

Nuxt 4 SPA — UI prototype for Mekari Jurnal using the Pixel 3 design system.

## Stack

- **Framework**: Nuxt 4, Vue 3, TypeScript
- **Design system**: `@mekari/pixel3` (token mode 2.1 — see `app/app.vue`)
- **Module**: `@mekari/pixel3-nuxt` auto-injects Pixel CSS + scrollbar
- **Deployment**: Cloudflare Pages (`nitro preset: cloudflare-pages`)
- **Auth**: Dummy auth via localStorage (no Pinia, no library)

## Pixel 3

**MANDATORY**: Before writing or editing any component, always call the Pixel MCP skill first. Never guess props, tokens, or patterns.

## Docs & patterns

See [`docs/README.md`](docs/README.md) for the full index. Key entries:

- `docs/design.md` — the app shell (header, sidebar, page title, page stage) + token/styling rules.
- `docs/tokens.md` — raw token values.
- `docs/patterns/` — **one file per page-construction pattern** (title bar, tabs, summary box, filter bar, drawer, table, bulk bar, pagination, status badge, blank slate, form, modal) plus the page-composition recipes (`page-recipes.md`, `index-page-format.md`, `details-page-format.md`). Start at `docs/patterns/page-recipes.md` to pick patterns for a page.
- `docs/index-page-pattern.md` — the **exhaustive index/list-page reference** (full rationale + state model + gotchas). Follow it and its reference impl `app/pages/templates/index-template.vue` whenever building a new list screen.

When a pattern changes, update its `docs/patterns/` file (and `index-page-pattern.md` if it's the index page) in the same change.
