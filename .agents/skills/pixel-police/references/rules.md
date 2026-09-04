# The rule list

Two tiers: what `scripts/pixel-police.sh` catches mechanically, and what only a
reviewer can catch. The script is the floor, not the ceiling — a clean run
means "nothing obviously off-system was added", not "this screen is correct".

## Tier 1 — enforced by `scripts/pixel-police.sh`

Checked on **added lines only**, in changed `.vue` files, against the merge-base
with `origin/main`. Comment-only lines are skipped. Any line carrying a trailing
`pixel-police-allow` comment is exempt.

| #   | Violation                                                                                    | Fix                                                           | Source                                                |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Hardcoded colour — `#hex`, `rgb()`, `rgba()`, `hsl()`                                        | `var(--mp-colors-*)` or a `css()` shorthand (`bg: "gray.25"`) | `docs/design.md` §8.4, `docs/tokens.md` §1            |
| 2   | Raw `<button\|input\|select\|textarea>`                                                      | `MpButton` / `MpInput` / `MpSelect` / `MpTextarea`            | `docs/design.md` §7                                   |
| 3   | Inline `style=""` / `:style=""`                                                              | `css()`                                                       | `docs/README.md` → Conventions, `docs/design.md` §8.1 |
| 4   | A `<style>` block in an SFC                                                                  | `css()`                                                       | `docs/README.md` → Conventions                        |
| 5   | Hardcoded px on `padding` / `margin` / `gap` / `font-size` / `line-height` / `border-radius` | token or shorthand (`gap: 4`, `p: 4`, `var(--mp-spacing-*)`)  | `docs/design.md` §8.3                                 |
| 6   | An `@mekari/pixel…` import that isn't `@mekari/pixel3`                                       | `@mekari/pixel3`                                              | `docs/design.md` §7                                   |
| 7   | `setNextTheme(true)`                                                                         | mode 2.1 — `setNextTheme(false)`                              | `docs/tokens.md`                                      |

### Built-in exceptions (already whitelisted — don't "fix" them)

| Exception                                                                                     | Why                                                                                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Sortable table-header `<button>` (`sortHeaderClass`)                                          | A real button is the accessible control for a sortable header — `docs/patterns/TablePage.md`                |
| Search-clear `<button data-search-clear>`                                                     | `MpInput is-clearable` emits `undefined` on clear and doesn't reliably reset — `docs/patterns/FilterBar.md` |
| Inline width on a `<col>` in a `<colgroup>`                                                   | `table-layout: fixed` needs authoritative per-column widths — `docs/patterns/TablePage.md`                  |
| The horizontal scroll-shadow gradient (`linear-gradient(to right, var(--mp-colors-white) …)`) | The rgba fade has no token equivalent                                                                       |

Width / height / `top` in px are **not** flagged: `docs/design.md` §8.3 permits
Figma-spec'd layout sizes that have no token. Comment the source next to them.

## Tier 2 — reviewer-only (the script cannot see these)

**Components**

- Every element maps to a real `@mekari/pixel3` component, with props confirmed
  via the Pixel MCP — not guessed, not carried over from a v2.4 repo.
- Icon names confirmed via `get-icon-name`. Sidebar/header icons 24px, in-button
  icons 20px (16px at `size="sm"`).
- `MpBadge` uses the `type` API through a `STATUS_TYPE` record — not the
  deprecated variant API, not an ad-hoc colour (`docs/patterns/StatusBadge.md`).

**Page construction**

- Exactly one `PageTitle` + one `PageStage` per page. The Home landing page is
  the single documented exception (`docs/patterns/home-page-format.md`).
- The page follows its recipe in `docs/patterns/page-recipes.md`.
- Form pages put commit buttons at the **bottom** of the form body; details
  pages put lifecycle actions in the **title band**. Getting these backwards is
  the most common drift.
- Tables: `table-layout: fixed` + `<colgroup>`, pinned 44px checkbox / 140px
  Actions column, header swaps to the bulk bar as a single `colspan` cell.
- `PageStage` padding comes from the `padding` prop, never a style override.

**Forms**

- Every validated field is wrapped in `MpFormControl` — the control owns label,
  helper text and error state.
- An `MpInput` with no wrapping `MpFormControl` carries an explicit `aria-label`.

**States**

- Initial, empty (`BlankSlate`), loading (skeleton), populated, validation
  error, system error, success, permission-restricted. A screen that only
  renders the happy path is incomplete.

**Consistency**

- Money and dates go through the module's single exported `formatCurrency` /
  `formatDate`. A screen that needs a different presentation says why in a
  comment at the call site (`docs/patterns/page-recipes.md`).
- Purchase settled on `Rp10.016.640,00` and `27 Aug 2026` — match the module.

**Copy**

- English by default. Run it through the `mekari-product-writing` skill:
  sentence case, approved verbs (Add vs. Create, Delete vs. Remove, Send vs.
  Submit), and the component copy patterns for modals, toasts, empty states.

**Accessibility**

- `aria-label` on every icon-only button.
- No `outline: none` without a replacement focus ring.
- Focus rings come from Pixel's `:focus-visible` — don't re-implement.

## Adding a rule

A mechanical rule earns its place when (a) the docs already state it, and (b)
the current codebase is clean of it — otherwise the gate cries wolf on day one.
Check the baseline before adding:

```bash
grep -rnE '<your-regex>' app --include='*.vue' | wc -l
```

Add it to `scripts/pixel-police.sh` as a `check` call with a message that names
the fix, then add the row to Tier 1 above.
