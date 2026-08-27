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

## Push workflow

When the user has finished "vibe coding" (an implementation/iteration session) and signals they want to
push the branch to remote, ask first whether the change needs a design review, offering exactly these 3
options:

1. **Review + generate HTML report** — run `/pixel-review` in full and produce the HTML report as usual.
2. **Review + summary in this chat** — run the same review (Playwright exploration + CHOICE+NNG-weighted
   audit) but report the findings as a summary in this chat session only; skip generating the HTML
   report file.
3. **I'll review later** — skip the review now; proceed straight to pushing the branch to remote (still
   following the standard git safety protocol, e.g. confirming the push itself unless already
   pre-authorized).

Don't ask this when the user explicitly requests a plain `git push` with no vibe-coding context (e.g.
they're just syncing an already-reviewed branch).

## Design Review Knowledge

Used by `/pixel-review`. Lives in `scripts/pixel-review-principles.md` so it travels as one portable
asset set with `pixel-review.js` and `report-template.html`. Never guess from memory — always read
that file first.
