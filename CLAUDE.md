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
