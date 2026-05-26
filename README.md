# Mekari Jurnal Prototype

UI prototype for Mekari Jurnal built with **Nuxt 4** and the **Pixel 3** design system.

The shell — header, sidebar, page title, page stage — mirrors the Jurnal
Master Pages Figma template (node `1:17750`) so any new screen drops into a
visually correct context from day one.

## Stack

- **Framework**: Nuxt 4, Vue 3, TypeScript
- **Design system**: `@mekari/pixel3` (token mode 2.1)
- **Module**: `@mekari/pixel3-nuxt` auto-injects the Pixel CSS surface
- **Deployment**: Cloudflare Pages (`nitro preset: cloudflare-pages`)

## Prerequisites

- Node.js ≥ 22 (`.nvmrc` pins to `22`)
- pnpm ≥ 9

## Getting Started

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`.

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start dev server                 |
| `pnpm build`        | Build for production             |
| `pnpm preview`      | Preview production build locally |
| `pnpm lint`         | Lint with ESLint                 |
| `pnpm lint:fix`     | Auto-fix lint issues             |
| `pnpm format`       | Format with Prettier             |
| `pnpm format:check` | Check formatting                 |

## Token mode

Mekari Jurnal targets **Pixel 3 token mode 2.1**. `app/app.vue` calls
`usePixelTheme().setNextTheme(false)` to keep the runtime on 2.1. Flip to
`true` to opt into the 2.4 token surface.

## Project structure (Nuxt 4 `app/` layout)

```
app/
  app.vue              ← root, enables Pixel theme
  assets/css/          ← project-local tokens + global resets
  components/          ← AppHeader, AppSidebar, AppUserPopover, …
  composables/         ← useNavigation, useQuickAccessItems, …
  layouts/             ← default.vue
  pages/               ← Nuxt-routed pages
docs/                  ← design.md, tokens.md
patches/               ← pnpm patches for pixel3-nuxt + pixel3-postcss
```
