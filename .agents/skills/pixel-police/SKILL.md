---
name: pixel-police
description: Final design-system reviewer for the Mekari Jurnal prototype. Use when a change, a screen, a PRD or a design (screenshot / Figma / pasted Vue) needs verifying against OUR Pixel 3 v2.1 components, tokens, patterns and copy rules — then rewriting to compliant code. Trigger on "/pixel-police", "police this", "is this on-system?", "check before I push", "cek design ini", or any request to audit or fix a screen for design-system compliance.
metadata:
  author: Mekari Jurnal
  version: "2026.9.4"
---

# Pixel Police (Jurnal)

The **last gate before a push**. Two things happen: **verify** (surface every
deviation as an evidence-backed finding) and **fix** (rewrite to on-system Vue
using our real components, tokens and patterns). You never "approve" a design
as final — you make it compliant and hand the human the judgement calls.

## Not the same as `/pixel-review`

|        | `/pixel-review`                                       | `pixel-police` (this)                           |
| ------ | ----------------------------------------------------- | ----------------------------------------------- |
| Asks   | "Is this a good screen?"                              | "Is this on-system?"                            |
| Method | Playwright exploration + CHOICE/NNG-weighted UX audit | Static + visual compliance pass against `docs/` |
| Output | HTML report / chat summary of UX findings             | Findings + the corrected code                   |
| When   | After an implementation session, before push          | Before a push, and on every PR via CI           |

They compose: run `/pixel-review` for design quality, `pixel-police` for
system compliance. Neither replaces the other.

## ⚠️ Token mode 2.1 — the one rule that must not be broken

This repo is **Pixel 3, Design Tokens v2.1** (`app/app.vue` →
`setNextTheme(false)`). Sibling repos (e.g. `pixel-erp`) run **v2.4 Enterprise**
— never carry a component rule, token value or pattern across from them.

| Concern                                         | ONLY source of truth                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Components, props, variants, icon names         | `@mekari/pixel3` + the Pixel MCP (`get-component`, `get-icon-name`, `get-docs`) |
| Tokens, spacing, colour, type                   | `docs/tokens.md` (`--mp-*`, v2.1 values)                                        |
| Shell: header / sidebar / PageTitle / PageStage | `docs/design.md`                                                                |
| Page construction                               | `docs/patterns/*.md` — start at `page-recipes.md`                               |
| Index/list screens (long form)                  | `docs/index-page-pattern.md` + `app/pages/templates/index-template.vue`         |
| Enforceable rule list + exceptions              | `references/rules.md` (this skill)                                              |
| Finding format                                  | `references/finding-schema.md` (this skill)                                     |
| UI copy                                         | the `mekari-product-writing` skill                                              |
| UX principles (CHOICE + NNG)                    | `scripts/pixel-review-principles.md`                                            |

**Never guess a prop, token or icon name.** Confirm through the Pixel MCP.

## Input

- **A change** — the current branch's diff, a set of files, or "what I just built".
- **A design** — a screenshot, Figma link, or pasted HTML/Vue to fix.
- **A PRD** — pasted text, a Confluence URL, or a local `.md`.

Work with whatever is given; mark the rest `cannot-verify`.

## Workflow

### Phase 0 — Load the rules (always, before judging anything)

1. Read `references/rules.md` — the enforceable checklist.
2. Read `docs/design.md` §7–§10 and the `docs/patterns/*.md` files for the page
   type in front of you (pick them via `docs/patterns/page-recipes.md`).
3. For a list screen, read `docs/index-page-pattern.md` and diff the code
   against `app/pages/templates/index-template.vue` — that file is the
   reference implementation, not an example.
4. Keep the Pixel MCP open for every component assertion.

### Phase 1 — VERIFY (produce findings)

Review across ALL dimensions on every pass — don't stop at the first one that
finds something:

1. **Pixel component** — does every element map to a real `@mekari/pixel3`
   component? Flag bespoke UI that should be an existing one, and guessed or
   wrong props. Verify each via MCP.
2. **Pixel token (v2.1)** — hardcoded colour/px instead of a `--mp-*` token or
   `css()` shorthand; inline `style`; a `<style>` block; v2.4 values.
3. **Pattern conformance** — does the page follow its recipe
   (`page-recipes.md`)? One `PageTitle` + one `PageStage` (Home is the single
   documented exception); commit buttons at the bottom of a form, in the title
   band on a details page; `<colgroup>` + `table-layout: fixed` on tables;
   `MpFormControl` around every validated field; `MpBadge type` mapped through
   a `STATUS_TYPE` record.
4. **Cross-screen consistency** — money and dates use the module's single
   exported `formatCurrency` / `formatDate` (`page-recipes.md` → "one format
   per value type, per module").
5. **State coverage** — initial, empty, loading (skeleton), populated,
   validation error, system error, success, permission-restricted.
6. **UX flow** — task progression, validation, feedback, recovery.
7. **Copy** — labels, buttons, placeholders, empty/error/toast text, via the
   `mekari-product-writing` skill. App copy is **English** by default.
8. **Accessibility** — `aria-label` on every icon-only button, `aria-label` on
   an `MpInput` with no `MpFormControl`, no `outline: none` without a
   replacement focus ring.
9. **PRD ↔ design** (when a PRD is in play) — requirements the design misses,
   and behaviour the design adds that the PRD never mentioned.

Emit findings per `references/finding-schema.md` — most-severe first, each
citing real evidence, each ending in a concrete `fix` or `decisionQuestion`.
Absence ≠ proof (`cannot-verify`). Guidelines are defaults: flag a deviation as
`intentional-exception-candidate` with a question rather than declaring it
wrong.

### Phase 2 — FIX (rewrite to on-system Vue)

For every `confirmed-gap` that's a hard rule (component / token / pattern /
copy), rewrite the code:

- Import UI from `@mekari/pixel3`; Pixel primitives before raw HTML; wrap
  validated fields in `MpFormControl`.
- **Styling is `css()`** (Panda) with token shorthands (`gap: 4`, `bg: "gray.25"`).
  No inline `style`, no `<style>` block. Raw `var(--mp-*)` only inside `css()`
  where a shorthand can't express it (hairlines, shadows).
- **Never invent a new pattern** when an existing one can be composed or
  extended — reuse the `app/components/template/*` building blocks and the
  patterns in `docs/patterns/`.
- Mock data lives in `app/data/` with its type, not hardcoded inside the `.vue`.
- Leave `decisionQuestion` items for the human — don't silently pick.
- When a pattern legitimately changes, update its `docs/patterns/` file in the
  same change (and `docs/index-page-pattern.md` if it's the index page). This
  repo's docs are the system of record.

### Phase 3 — ENFORCE (self-check, must be green)

```bash
bash scripts/pixel-police.sh   # added lines vs. merge-base with origin/main (working tree included)
pnpm lint && pnpm format:check && pnpm typecheck
```

The same script runs on `git push` (husky `pre-push`) and on every PR to `main`
(`.github/workflows/ci.yml`). Treat its output as blocking: fix and re-run
until clean. It only checks **added lines**, so a violation it reports is
always yours. If a line is a genuine, documented exception, add a trailing
`pixel-police-allow` comment **and** write the exception into `docs/` in the
same change — never to silence a real finding.

The script catches 7 mechanical rules. Everything in `references/rules.md`
marked _reviewer-only_ is on you — the script cannot see it.

## Output to the human

1. **Findings** — grouped by dimension, most-severe first, with sources.
2. **The corrected code** (or a diff).
3. **Open decisions** — the `decisionQuestion` items with `suggestedOwner`.
4. **Gate status** — the `scripts/pixel-police.sh` + lint + typecheck result, verbatim.

Keep it honest: report what you couldn't verify, and never present a judgement
call as a hard rule.
