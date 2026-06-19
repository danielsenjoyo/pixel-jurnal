# Mekari Jurnal — App Shell Boilerplate

A **Nuxt 4 + Pixel 3** boilerplate for building Mekari Jurnal screens. The app
shell — header, sidebar (with submenus), page title, and page stage — mirrors the
Jurnal Master Pages Figma template (node `1:17750`), so any new page drops into a
visually correct context from day one. Drop your screen into a route and it
inherits the chrome, navigation, and design tokens automatically.

## Stack

- **Framework**: Nuxt 4 (SPA, `ssr: false`), Vue 3 `<script setup>`, TypeScript
- **Design system**: `@mekari/pixel3` — **token mode 2.1** (see `app/app.vue`)
- **Styling**: Panda CSS via `css()` with Pixel token shortcuts
- **Module**: `@mekari/pixel3-nuxt` auto-injects the Pixel CSS surface
- **i18n**: lightweight `useLanguage()` singleton (English default, Bahasa Indonesia overlay) — no library
- **Auth**: dummy auth via `localStorage` (no Pinia, no library)
- **Deployment**: Cloudflare Pages (`nitro preset: cloudflare-pages`)

## Prerequisites

- Node.js ≥ 22 (`.nvmrc` pins `22`)
- pnpm ≥ 9

## Getting started

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:3000` (a fallback port like `3002` is used if 3000 is busy).

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start the dev server         |
| `pnpm build`        | Build for production         |
| `pnpm preview`      | Preview the production build |
| `pnpm lint`         | Lint with ESLint             |
| `pnpm lint:fix`     | Auto-fix lint issues         |
| `pnpm format`       | Format with Prettier         |
| `pnpm format:check` | Check formatting             |

## Token mode

Jurnal targets **Pixel 3 token mode 2.1**. `app/app.vue` calls
`usePixelTheme().setNextTheme(false)` to keep the runtime on 2.1 (and
`setDarkMode(false)`). Flip `setNextTheme(true)` to opt into the 2.4 token
surface. The Pixel token CSS is imported explicitly in `nuxt.config.ts`
(`@mekari/pixel3-styled-system/styles.css`), with the project-local
`assets/css/tokens.css` + `global.css` layered on top.

## Project structure

```
app/
  app.vue                 ← root; pins Pixel theme to 2.1
  layouts/default.vue     ← injects navbar + sidebar (+ submenu rail), renders <slot/>
  assets/css/             ← tokens.css (project token layer) + global.css (resets)
  components/
    navbar/               ← TheNavbar (index) + QuickAction, Notification, SwitchAccount…
    sidebar/              ← TheSidebar (index) + SidebarItem, SidebarChild* (submenu rail)
    template/             ← DefaultPageContent (title + stage), SummaryBox
  composables/
    useAppMenu.ts         ← active route → menu/submenu/page-title resolution
    usePixelLayout.ts     ← shell-layout singleton (rail collapse, account chip)
    useLanguage.ts        ← locale singleton (en/id), persisted to localStorage
  data/
    menu.ts               ← sidebar source of truth (APP_MENU_GROUPS / APP_MENU_ITEMS)
    constants.ts          ← layout primitives (navbar/sidebar/title dimensions)
  pages/                  ← Nuxt-routed pages (+ pages/templates/index-template.vue)
docs/                     ← design.md, tokens.md, index-page-pattern.md, patterns/
patches/                  ← pnpm patches for pixel3-nuxt + pixel3-postcss
public/                   ← logo, favicon, illustrations/
```

## The app shell

`layouts/default.vue` composes the shell; pages never render it themselves.

- **AppHeader** (`components/navbar/`) — fixed 56px bar: logo, search, action icons, account chip. Z-index `sticky`.
- **AppSidebar** (`components/sidebar/`) — 216px rail with three states (expanded / user-collapsed 56px / submenu-open). Items come from `data/menu.ts`. Items that own a `submenu` open a 208px child rail (`SidebarChild`) and force the main rail to collapse.
- **PageTitle + PageStage** — provided by `components/template/DefaultPageContent.vue`: the 72px title band (heading + `#actions` + optional `#tabs`) over the white, top-left-rounded page stage.

Navigation is data-driven: edit **`app/data/menu.ts`** (the sidebar source of
truth), not the components. `useAppMenu()` resolves the active route into the
active top menu, submenu, child, and page title. Full shell spec + rationale:
**[`docs/design.md`](./docs/design.md)**.

## Building a new page

1. Add a Vue file under `app/pages/` (Nuxt routes it by path).
2. Wrap the body in `<DefaultPageContent title="…">` — you get the title band + white stage for free.
3. Compose the body from the documented patterns. Start at
   **[`docs/patterns/page-recipes.md`](./docs/patterns/page-recipes.md)** to pick the right ones.
4. For a **list/index screen**, copy [`app/pages/templates/index-template.vue`](./app/pages/templates/index-template.vue) and follow **[`docs/patterns/index-page-format.md`](./docs/patterns/index-page-format.md)**.

### Styling rules (short version)

- Page-body styling uses Panda **`css()`** with Pixel token shortcuts only (`gap: 4`, `px: 6`, `bg: "gray.25"`). No `<style>` blocks, no inline `style` in pages.
- Raw `var(--mp-*)` is allowed inside `css()` values only for hairline borders/shadows a shorthand can't express.
- The shell's scoped CSS uses the project `--color-*` / `--spacing-*` tokens — a separate layer from the page-body `css()` layer. Don't mix them.

## Documentation

All design + construction docs live in **[`docs/`](./docs/)** — start with the
[docs index](./docs/README.md). Key entries:

- [`docs/design.md`](./docs/design.md) — the app shell.
- [`docs/tokens.md`](./docs/tokens.md) — raw token values.
- [`docs/patterns/`](./docs/patterns/) — one file per page-construction pattern.
- [`docs/index-page-pattern.md`](./docs/index-page-pattern.md) — the exhaustive index-page reference.

## Deployment

Built for **Cloudflare Pages** (`nitro preset: cloudflare-pages`). `pnpm build`
produces the deployable output; `pnpm preview` runs it locally.

---

> **Working in this repo?** Before writing or editing any component, call the
> Pixel MCP / `pixel-docs-jurnal` skill first — never guess props, tokens, or
> icon names. See [`CLAUDE.md`](./CLAUDE.md) / [`AGENTS.md`](./AGENTS.md).
