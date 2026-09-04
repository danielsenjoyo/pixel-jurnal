# Mekari Jurnal — Design System Notes

> Living document. Update this file whenever component behavior, layout
> dimensions, or interaction rules are clarified or change. Pair this with
> [`tokens.md`](./tokens.md) — that file owns the raw values, this file owns
> the rules and rationale. For building **list/index screens** inside the page
> stage, see [`index-page-pattern.md`](./index-page-pattern.md).

**Token mode:** Pixel 3 — Design Tokens **v2.1** (`app/app.vue` →
`setNextTheme(false)`).
**Reference Figma:** Jurnal Master Pages → node `1:17750` (Master Template).

---

## 0. Token layers

There are exactly **two** layers, and every value in this document resolves to
one of them.

| Layer             | Namespace                                          | Where it comes from                                                        | How to consume it                                                                                                                             |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pixel 3 v2.1**  | `--mp-*`                                           | Auto-injected by `@mekari/pixel3-nuxt`                                     | Panda `css()` shorthands first (`bg: "gray.25"`, `gap: 4`, `rounded: "md"`); raw `var(--mp-colors-*)` only where a shorthand can't express it |
| **Project-local** | `--layout-*`, `--motion-*`, `--border-radius-full` | [`app/assets/css/tokens.css`](../app/assets/css/tokens.css) — 10 variables | `var(--layout-sidebar-width)` etc.                                                                                                            |

The project-local layer exists only for what Pixel doesn't ship: app-shell
layout primitives, a stadium-pill radius (Pixel's `--mp-radii-full` is `50%`,
which makes ellipses, not pills), and cubic-bezier easings (Pixel ships
durations but no easing tokens).

Pixel also injects `--pixel-navbar-height`, which the sidebar and page column
use as their top offset. Don't duplicate it.

**There is no `--color-*` / `--spacing-*` layer.** Earlier revisions of this
document described one; it belonged to the static HTML preview that predated
the Nuxt build and is defined nowhere in `app/`. If you see those names in an
old doc or comment, translate them: `--color-border-default` → `gray.100`,
`--spacing-md` → `4` (16px), `--color-bg-surface` → `white`.

---

## 1. Layout system

The Jurnal shell is composed in [`app/layouts/default.vue`](../app/layouts/default.vue):

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TheNavbar                                       (--layout-header-height)│
├──────────────┬──────────────────────────────────────────────────────────┤
│              │  Page title band            (--layout-page-title-height)  │
│ TheSidebar   ├──────────────────────────────────────────────────────────┤
│ (+SidebarChild) │  Page stage  (white card, rounded-top-left, border-l/t)│
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

| Region          | Component                                      | Size                                                                                   | Surface                                                                                                    |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Top bar         | `navbar/index.vue` (`TheNavbar`)               | `var(--layout-header-height)` (56px)                                                   | `bg: white`, `borderBottomWidth: "sm"` + `borderColor: "gray.100"`                                         |
| Left navigation | `sidebar/index.vue` (`TheSidebar`)             | `var(--layout-sidebar-width)` (216px) / `var(--layout-sidebar-collapsed-width)` (56px) | `background: "gray.25"` — **no right border**; the seam is the stage's left border                         |
| Submenu panel   | `sidebar/SidebarChild.vue`                     | `var(--layout-submenu-width)` (208px), collapses to `4` (1rem)                         | `background: "gray.25"`, `borderLeftWidth: "sm"` + `gray.100`                                              |
| Page heading    | `template/DefaultPageContent.vue` → `<header>` | `minHeight: var(--layout-page-title-height)` (72px)                                    | transparent over the `gray.25` shell                                                                       |
| Body card       | same component → `<section>`                   | `flex: "1 1 auto"`                                                                     | `bg: "white"`, `borderTopWidth`/`borderLeftWidth: "sm"`, `borderColor: "gray.100"`, `roundedTopLeft: "md"` |

The page shell, sidebar and title band all share `gray.25`; the white stage
sits on top of it, separated by a `gray.100` hairline.

**Rule — page composition.** A page renders **one** `<DefaultPageContent>`,
which owns both the title band and the stage. The default layout injects the
navbar and sidebar — pages must not render those themselves.

**One documented exception:** the Home landing page
([`app/pages/index.vue`](../app/pages/index.vue)) renders its stage with no
title band — its first section already opens with the greeting and page
question, so a band reading "Home" above it would repeat itself. See
[`patterns/home-page-format.md`](./patterns/home-page-format.md). Home is a
landing page, not a records screen; nothing else may skip the band.

---

## 2. TheNavbar

`position: fixed`, `zIndex: "sticky"`, full width, `px: 6`, height
`var(--layout-header-height)`.

| Slot    | Component                                                                            | Spec                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logo    | `<img src="/logo-jurnal.svg">`                                                       | 32px tall, wrapped in a `NuxtLink` to `/`                                                                                                              |
| Actions | `MpButton variant="ghost" size="md" icon-only` inside `MpTooltip placement="bottom"` | icons `add` (Quick action), `headphone` (Live chat), `gift` (Referral), `help` (Help), `time` (Activity log), `notification`, `shortcuts` (Switch app) |
| Account | `SwitchAccount` → `MpPopover placement="bottom-end"`                                 | 32px `MpAvatar` (`width: "8!"` — Pixel's `md` is 24 and `lg` is 36) + two-line label                                                                   |

**Rules**

- Icon-only buttons share `padding: "1.5"` (6px square, Figma spec) and always
  carry an `aria-label` as well as a tooltip label.
- The right-hand cluster is `display: flex; gap: 1; marginLeft: auto`.
- Popovers are real Pixel popovers (`MpPopover` + `MpPopoverTrigger` +
  `MpPopoverContent`, `use-portal`). Don't hand-roll outside-click or Escape
  handling — the component owns it.
- **There is no header search input.** Earlier revisions specified a 480px
  `MpInput` with a `⌘K` chip; it was never built. If it comes back, spec it
  here first.

---

## 3. TheSidebar

Two states — expanded and collapsed. Both use the **same** `gray.25` surface;
only the width changes.

| State                                                 | Rail width                                     | Background |
| ----------------------------------------------------- | ---------------------------------------------- | ---------- |
| Default (expanded)                                    | `var(--layout-sidebar-width)` (216px)          | `gray.25`  |
| Collapsed (user toggle, or forced by an open submenu) | `var(--layout-sidebar-collapsed-width)` (56px) | `gray.25`  |

- Groups come from [`app/data/menu.ts`](../app/data/menu.ts) (`APP_MENU_GROUPS`)
  and are separated by an `<MpDivider>` — not a border rule.
- The nav list is `pt: 4; px: 2`, height `calc(100vh - var(--layout-header-height))`,
  with a **hidden-track scrollbar** implemented inside `css()`
  (`&::-webkit-scrollbar { width: 0 }`) — scrolling still works.
- Width, opacity and padding transitions all use `transitionDuration: "fast"`
  - `var(--motion-ease-in-out)`.
- Collapsed rows hide their label by collapsing it to `maxWidth: 0` +
  `opacity: 0` (not `display: none`, which snapped mid-transition), so the
  24px icon centres itself in the 56px rail.
- The rail is hidden below `md` (`display: { base: "none", md: "block" }`).

### Item states — `sidebar/SidebarItem.vue`

Row geometry: `minHeight: var(--layout-sidebar-item-height)` (36px),
`px: 2` (8px), `py: "1.5"` (6px), `rounded: "md"`.

| State   | Row background | Text                                   | Icon                                                  |
| ------- | -------------- | -------------------------------------- | ----------------------------------------------------- |
| Default | `transparent`  | `MpText color="dark" weight="regular"` | `MpIcon variant="outline" size="md" color="gray.600"` |
| Hover   | `transparent`  | `_groupHover: { color: "blue.500" }`   | `_groupHover: { color: "blue.500" }`                  |
| Active  | `blue.50`      | `color="blue.500" weight="semiBold"`   | `variant="fill" color="blue.500"`                     |

Active stacks **three** signals — the `blue.50` fill, SemiBold blue text, and
the filled-icon swap via `MpIcon`'s own `variant` prop (no CSS `fill`
hacks, no `-fill.svg` files).

**Trailing chevron.** Only items that link outward (`isExternal`) render one:
`MpIcon name="chevrons-right" size="sm"` (16px). Items that own a submenu open
the `SidebarChild` panel on click and show no chevron.

### Footer (Company ID strip)

Sticky to the bottom of the rail: `px: 2; py: 3`, `borderTopWidth: "sm"` +
`borderColor: "gray.100"`, `background: "inherit"`. Contains the collapse
toggle plus `Company ID : <id>` in `MpText size="body-small"`, which fades to
`opacity: 0` when collapsed.

**Toggle icons:** `sidebar-show` when collapsed (click to expand),
`sidebar-hide` when expanded. Tooltip carries the `shift + X` shortcut.

---

## 4. SidebarChild (submenu panel)

Rendered by the layout when the active menu item owns a submenu — which also
forces the main rail to collapse (one-way: leaving the section does **not**
auto-expand the rail).

| Element          | Value                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel width      | `var(--layout-submenu-width)` (208px); collapses to `4` (1rem)                                                                                |
| Panel background | `gray.25` — **not white**                                                                                                                     |
| Panel border     | `borderLeftWidth: "sm"` + `borderColor: "gray.100"`                                                                                           |
| Item list        | `pt: 4; px: 2`, height `calc(100vh - var(--pixel-navbar-height) - 4rem)`, scrolls                                                             |
| Section heading  | `MpText size="label-small" color="blue.400"`, `letterSpacing: "widest"`, `textTransform: "uppercase"`, `p: 2`                                 |
| Item             | `minHeight: var(--layout-sidebar-item-height)` (36px), `px: 2; py: "1.5"`, `borderRadius: "md"`, `color: "dark"`, `fontWeight: "regular"`     |
| Item hover       | `color: "blue.500"` (no background fill)                                                                                                      |
| Item active      | `background: "blue.50"`, `color: "blue.500"`                                                                                                  |
| Collapse control | Bottom-right, `MpIcon name="chevrons-previous" size="sm"`, tooltip `View less (shift + C)`                                                    |
| Expand pill      | Visible only when collapsed: 24×40 white pill, `borderRightRadius: var(--border-radius-full)`, `shadow: "md"`, `MpIcon name="chevrons-right"` |

**Rules**

- Only one submenu is open at a time — it's driven by the active route's menu
  item, not by local component state.
- The rail's right border is suppressed while the panel is open; the panel's
  `borderLeftWidth` carries the seam.
- Panel state lives in `usePixelLayout()` (`useSidebarChild`), so it survives
  route changes within the section.

---

## 5. Page title band + stage — `template/DefaultPageContent.vue`

One component owns both. It also sets the page column's top offset
(`paddingTop: var(--pixel-navbar-height)`).

**Title band** (`<header>`)

- `minHeight: var(--layout-page-title-height)` (72px) — `minHeight`, not
  `height`: a details page's optional breadcrumb line makes the column taller,
  and it must grow rather than clip.
- Padding `px: 6` (24px) / `py: 4` (16px), `gap: 4`, `flexShrink: 0`.
- Heading: `MpText as="h1" size="h1" weight="semiBold" color="dark"`. Falls
  back to `activePageTitle` from the menu, so stub pages stay one-liners.
- Optional `subtitle`: `MpText size="body-small" color="gray.600"`.
- Optional `breadcrumb` / `breadcrumbTo`: an `MpTextlink variant="primary"`
  above the title, for a details page one level under its list page.
- Optional `#actions` slot, right-aligned, `gap: 2`.
- Optional `#tabs` slot renders a page-level tab band between the title and
  the stage, aligned to the same `px: 6`.

**Stage** (`<section>`)

- `bg: "white"`, `borderTopWidth`/`borderLeftWidth: "sm"`,
  `borderColor: "gray.100"`, `roundedTopLeft: "md"`.
- Padding is a fixed `p: 6` (24px). **There is no `padding` prop** — an earlier
  revision of this doc specified `none | sm | md | lg | xl`; it doesn't exist.
  A page that genuinely needs different padding should extend the component,
  not override it with a style.
- No bottom or right border — the card runs to the viewport edge.

### Title-band action row (Figma node `1:16062`)

Up to three buttons, labels only (no leading icons), `gap: 2`:

1. **"More" dropdown** — `MpButton variant="secondary"` + trailing
   `chevron-down`, `aria-haspopup="menu"`.
2. **Secondary action** — `MpButton variant="secondary"`, verb label (`Export`).
3. **Primary action** — `MpButton variant="primary"`, verb label (`Create new`).

Button colours, sizing and focus rings come from Pixel's own recipes — don't
restyle them. Verify variants via the Pixel MCP before adding one.

---

## 6. Iconography

- `<MpIcon name="…" size="…" :variant="…" />`. Sizes are Pixel's scale:
  `size="md"` (24px) for sidebar and navbar icons, `size="sm"` (16px) for
  chevrons and inline marks.
- `variant="fill" | "outline"` drives the active-state swap. Don't ship
  `-fill.svg` assets.
- Always verify a new name with `get-icon-name` from the Pixel MCP.
- Icon-only buttons must carry an `aria-label`.

Names in use (from [`app/data/menu.ts`](../app/data/menu.ts) and the navbar):

| Concept                    | Icon name                       |
| -------------------------- | ------------------------------- |
| Quick access               | `add`                           |
| Live chat                  | `headphone`                     |
| Referral                   | `gift`                          |
| Help                       | `help`                          |
| Activity log               | `time`                          |
| Notification               | `notification`                  |
| App switcher               | `shortcuts`                     |
| Home                       | `home`                          |
| Dashboard                  | `dashboard`                     |
| Reports                    | `reports`                       |
| Budget / Finance           | `finance`                       |
| Cash & bank                | `bank`                          |
| Sales                      | `sales`                         |
| Purchases                  | `cart`                          |
| Expenses                   | `expenses`                      |
| Job order                  | `table-view-list`               |
| Mekari Pay                 | `mekari_pay`                    |
| Contacts                   | `contact`                       |
| Products                   | `products`                      |
| Production                 | `fulfillment`                   |
| Fulfillment                | `truck`                         |
| Assets                     | `assets`                        |
| Chart of accounts          | `chart-of-account`              |
| Applications               | `application`                   |
| Other lists                | `doc`                           |
| Integrations               | `add-ons`                       |
| Settings                   | `settings`                      |
| Outward link / expand pill | `chevrons-right`                |
| Submenu collapse           | `chevrons-previous`             |
| Rail toggle                | `sidebar-show` / `sidebar-hide` |

---

## 7. Component-import discipline

- **All Pixel primitives come from `@mekari/pixel3`.** Never `@mekari/pixel-vue`
  or `@mekari/pixel`. (Enforced — see `scripts/pixel-police.sh`.)
- `css` is imported from `@mekari/pixel3` alongside the components.
- Components are registered globally by `@mekari/pixel3-nuxt`, but for SFC
  clarity we still `import` them explicitly in each `<script setup>`.
- Validate props with the Pixel MCP `get-component` before adding a component.
  Update this doc when a non-obvious prop combination is required.

### Form fields

- All validated form fields **must** be wrapped in `<MpFormControl>`. The form
  control owns the label, helper text and error state.
- An `MpInput` with no wrapping form control needs an explicit `aria-label`.

---

## 8. Styling rules

1. **Styling is Panda `css()`.** No `style=""` attribute, no `:style=""`
   binding, no `<style>` block. The one sanctioned inline style is a `<col>`
   width inside a `<colgroup>`, where `table-layout: fixed` needs authoritative
   per-column widths ([`patterns/TablePage.md`](./patterns/TablePage.md)).
2. Prefer Pixel component CSS Props (`gap`, `padding`, `align` on `MpFlex`,
   `MpScrollbar`, `MpSkeleton`) over custom margins.
3. Prefer a Panda token shorthand (`bg: "gray.25"`, `gap: 4`, `rounded: "md"`,
   `borderWidth: "sm"`) over a raw `var()`. Reach for `var(--mp-*)` only where
   no shorthand expresses it.
4. **Colours resolve to a token.** A hex, `rgb()`, `rgba()` or `hsl()` literal
   is a code-review block. (Enforced.)
5. Spacing and type resolve to a token: `padding`, `margin`, `gap`,
   `font-size`, `line-height`, `border-radius` never take a raw px value.
   (Enforced.)
6. Raw px **is** permitted for layout sizes taken straight from Figma that have
   no token (`width: "776px"`, `height: "180px"`) and for hairlines. Note the
   source in a comment next to the value.
7. Escape-hatch values Panda can't type go in square brackets:
   `left: "[calc(-1rem - 1px)]"`, `marginRight: "[1px]"`.

---

## 9. Behavior notes (update as discovered)

- **Quick Access popover** — `navbar/QuickAction.vue`,
  `MpPopover placement="bottom-start"`. Dark panel (`bg: "dark"`,
  `rounded: "md"`, `shadow: "lg"`) with an `MpText size="overline"` heading and
  rows that hover to `gray.600`.
- **Account popover** — `navbar/SwitchAccount.vue` +
  `SwitchAccountContent.vue`, `MpPopover placement="bottom-end"`. 320px card,
  `bg: "white"`, `rounded: "md"`, `shadow: "sm"` (the shadow alone defines the
  edge — no border). Header band `bg: "gray.25"` with a 48px avatar; rows are
  36px, `_hover: { backgroundColor: "gray.50" }`; the companies sub-list is an
  inset `gray.25` card. Includes a language sub-view (in-place, via a back
  button) and Sign out.
- **Notification** — `navbar/Notification.vue`, badge on the bell icon.
- **Submenu persistence** — the panel's collapse state lives in
  `usePixelLayout()`, so it persists across route changes; the rail's collapse
  is one-way (a submenu forces it closed, leaving the section doesn't reopen it).

---

## 10. Accessibility baseline

- All icon-only buttons → `aria-label` (plus an `MpTooltip label` for sighted
  users).
- Active sidebar route comes from `isRouteActive()` in `useAppMenu`; don't add
  `aria-current` manually until pages reflect real routes.
- Focus styles are inherited from Pixel's `:focus-visible`. Don't override with
  `outline: none` without providing a replacement.
- **Known gap:** the sidebar `<aside>` carries no `aria-label`. Add one
  (`aria-label="Main navigation"` — app copy is English) next time the sidebar
  is touched.

---

## Changelog

- **v0.15.0** — **Reconciled this document with the code.** Every token
  reference now names something that exists. The `--color-*` / `--spacing-*` /
  `--font-*` / `--z-*` namespace this doc had used throughout was never defined
  in `app/` — it belonged to the static HTML preview that predated the Nuxt
  build — so §1–§10 are restated in the real two-layer model (Pixel `--mp-*`
  via Panda `css()`, plus the 10 project-local `--layout-*` / `--motion-*` /
  `--border-radius-full` variables), documented in the new §0. Component names
  corrected to the ones that exist: `TheNavbar`, `TheSidebar`, `SidebarChild`,
  and `DefaultPageContent` (which owns both the title band and the stage —
  there are no separate `PageTitle` / `PageStage` components). Specs corrected
  against the source: the sidebar rail is `gray.25` in **both** states (not
  `#F1F5F9` / `#E7EDF5`), the active row is `blue.50` + `blue.500` (not
  `--color-blue-100` / `#1C44D5`), submenu items hover to blue text with no
  fill (not a `gray.50` background), icon names match `app/data/menu.ts`
  (`expenses`, `products`, `mekari_pay`, `table-view-list`, `chevrons-right`,
  `chevrons-previous`, `sidebar-show` / `sidebar-hide`, `headphone`,
  `shortcuts`), and the popovers are real `MpPopover`s rather than hand-rolled
  dismissal logic. Removed two specs for things that don't exist: the 480px
  header search input with its `⌘K` chip, and the stage's `padding` prop.
  §8 restated as the `css()`-first rules the repo actually follows and that
  `scripts/pixel-police.sh` enforces. Earlier changelog entries below describe
  the static preview's history and are kept as provenance — they do **not**
  describe the current code.
- **v0.14.0** — Refactored the preview's `iconSlot(name, variant, cls)` helper to mirror Pixel's `<MpIcon :name :variant>` API: callers now pass `variant: 'fill' | 'outline'` and the helper resolves to `<name>-fill.svg` / `<name>.svg`. The Nuxt sidebar continues to call the real `<MpIcon>` from `@mekari/pixel3` with the same variant prop — so preview and prod share one mental model. Bulletproofed the user-popover company-list alignment: explicit `padding-inline-start: 0` on the `<ul>` (Safari/older WebKit otherwise applies `padding-inline-start: 40px` to lists), explicit `text-align: left` + `padding/margin: 0` on the name/ID `<p>` elements and the View-all `<a>`, so company names and the View-all link now share the exact same left X regardless of browser defaults.
- **v0.13.0** — Restored **`var(--spacing-sm)` (12px)** horizontal padding on `.app-user-popover__company` and `.app-user-popover__view-all` so every row inside the gray-25 card aligns at the same left X with the comfortable indent shown in the live UI screenshot (the previous 0px push was too tight). Redrew 4 filled sidebar icons to match Pixel reference screenshots: `application-fill` (clean isometric box silhouette), `assets-fill` (warehouse with peaked roof + windows + door cutout), `bank-fill` (classical pediment + 4 columns + base slab), `cart-fill` (slanted handle + basket + 2 wheels).
- **v0.12.0** — Hand-crafted **filled SVG variants** for all 20 sidebar icons (`home-fill`, `dashboard-fill`, … `settings-fill`). The previous `sed`-generated approach produced visually broken icons because it just swapped `stroke` → `fill` on outline geometry; the new files are proper solid silhouettes that read as the Pixel filled variant. The preview renderer now loads `icons/<name>-fill.svg` for active rows. Sidebar **icon drift on collapse is fixed** — item padding is now a constant `16px` horizontal in both expanded and collapsed states, so the icon sits at x=16 throughout the width transition (no padding animation needed, no horizontal shift). Company-list rows now have **zero horizontal padding** — text and check icon sit flush within the gray-25 card edge, with all rows aligned at the same left X.
- **v0.11.0** — Sidebar icon fill now uses the **correct Pixel API**: `<MpIcon variant="fill">` (per docs.mekari.design/components/icon.html) instead of the broken `<name>-fill` filename swap. The 20 `*-fill.svg` files generated by `sed` are gone — they didn't render correctly because they were just stroke→fill substitutions on outline geometry, not proper Pixel filled icons. The static preview now synthesizes the fill via CSS (`fill: currentColor` on the icon's SVG paths in `.app-sidebar__item--active`). Quick Access popover anchoring **left-aligned to the `+` button** (was centered with translateX). User popover header: wrapped name + company in their own `.app-user-popover__label` no-gap container so the header's 8px gap applies **only** between avatar and the label stack — not between name and company (matches Figma node 25:132777). Footer legal links switched from `justify-content: space-between` to a wrap-friendly inline flex with `--spacing-xs` gap (per the production Jurnal screenshot, links sit consecutively, not stretched). Active company in the scrollable card already SemiBold + checkmark right (verified against screenshot).
- **v0.10.0** — Buttons re-coloured per the production Jurnal UI: primary fill is now **Blue/$blue-400 (`#4B61DD`)** instead of Blue/$blue-500, and secondary uses the same blue for its **label** (white bg + gray-100 border + blue-400 text + blue-400 hover), so the action row reads as a coherent blue family. Padding back to 16px, radius back to `--border-radius-md` (6px). Added the **Quick Access popover** (`components/AppQuickAccess.vue`, Figma node `25:133776`) — dark surface (`#232933`), 240px wide, uppercase tracked heading ("CREATE / ADD") in Gray/$gray-400, item rows in white. Wired to the `+` icon-button in `AppHeader` with click-toggle, outside-click and Escape dismissal, and mutual exclusion against the user popover (opening one closes the other). Added a **CSS-only Pixel tooltip** (`.mp-tooltip[data-tooltip]`) on every header icon-button — dark surface 200ms after hover/focus-visible, auto-hides while the trigger has an open popover. Fixed the **sidebar mutual-exclusion bug**: when a submenu is open, only the submenu OWNER is now active (not also the current-route item). Removed NuxtLink's `active-class` so it no longer double-applies on top of our `isItemActive()` resolver. New composable `useQuickAccessItems()`. Footer legal links no longer force `whitespace-nowrap` so English labels wrap gracefully (Indonesian fits at 320px).
- **v0.9.0** — User popover re-spec'd against the live Figma design context: border is now **Gray/$gray-400** (`#8B95A5`, not gray-100), companies card is wrapped in an `8/12px`-padded wrapper rather than margined, "View all companies" link is Regular weight (not SemiBold), footer legal links use `justify-between` flex layout (three separate `<p>` elements) instead of `·`-separated text. Active-state sidebar icon now swaps to a real `<name>-fill.svg` variant at the renderer level (no more CSS `fill: currentColor` hack — that approach didn't render correctly for multi-sub-path icons). Generated `-fill.svg` for all 20 sidebar icons. Nuxt sidebar exposes `iconNameFor()` + `isItemActive()` helpers driven by `useRoute()`. Sidebar motion retuned to **`cubic-bezier(0.32, 0.72, 0, 1)` @ 240ms** (Apple-style smooth decelerating curve, was ease-in-out @ 320ms which felt mechanical) and added `will-change: width` to promote the rail to its own compositor layer. Labels + chevrons now fade with a **stagger** — fast-out on collapse (100ms no delay), slow-in on expand (200ms with 120ms delay) — so the rail and its contents read as one fluid gesture. Buttons retargeted to docs.mekari.design Pixel API: padding bumped down to `--spacing-sm` (12px), radius to `--border-radius-sm` (4px), icon size to 16px in md (12px in sm), and the missing variants (`ghost`, `danger`, `textLink`) + `is-rounded` + `is-full-width` + disabled state are now in the preview's `.mp-button` stylesheet. Nuxt pages updated to use the documented `left-icon` / `right-icon` props instead of inline `<MpIcon>` children.
- **v0.8.0** — Sidebar active state now stacks **three** signals: `--color-blue-100` (`#E5EAFE`) background + SemiBold blue text + **filled-icon swap** (CSS `fill: currentColor` on the SVG paths inside `.app-sidebar__item--active .app-sidebar__icon`). Hover stays as the no-fill blue-text shift. User popover re-spec'd per Figma: border-radius **md** (6px, not lg), header bg **Gray/$gray-25** (`#F8F9FB`), **48px** avatar (not 64), companies card inset 12px with gray-25 fill + gray-50 border, "View all companies" link in `--color-accent-blue-400`, footer uses Overline 10/12 type, check icon on the current company is gray-900 (not the bright nav-active blue). Button md padding bumped to **16px** horizontal (was 12 — that's the sm-size padding). Button focus ring re-pointed to `var(--color-blue-100)` for visual coherence with selected-nav. New tokens: `--color-gray-25`, `--color-gray-400`, `--color-blue-100` (+ `-400`, `-500` aliases).
- **v0.7.0** — Added the user pulldown popover (`AppUserPopover.vue`) per Figma node `25:134179` — 320px-wide, sectioned, with a scrollable companies list capped at `180px` max-height. Wired toggle / outside-click / Escape dismissal in `AppHeader`. New composable `useUserCompanies()` seeds the list. Collapsed-rail centring fixed: symmetric 16px L/R padding fits the 24px icon exactly inside the 56px rail (was off-centre because the faded label was still claiming flex space). New icons: `external-link`, `check`, `chevron-up`.
- **v0.6.0** — Replaced the placeholder Mekari Pay icon with the canonical Pixel 2.1 library SVG (24×24 with chip tab). Sidebar active state now uses **SemiBold** blue (regular blue is hover-only) — the persistent selection reads stronger than transient hover. Submenu panel background switched from white to **Extra/$background** (`#F1F5F9`) per design system. Trailing chevron is now flushed to the right edge via `margin-left: auto`. Rail collapse motion retuned: slow ease-in-out (320ms), labels + chevrons fade via opacity instead of `display:none`, item padding animates so icons centre smoothly. Primary button color repointed from Brand/University to **`--color-primary` (#1C44D5, Blue/$blue-500)** — the actual Pixel 3 v2.1 primary fill (Brand/University was the wrong, lighter blue).
- **v0.5.0** — Added Pixel motion tokens (`--motion-duration-fast/base/slow`, `--motion-ease-out/in/in-out`) and wired the submenu panel through a `<Transition>` so open/close animate (200ms ease-out, 8px translateX + fade). Submenu panel lost its right border — the seam belongs to `PageStage`'s `border-left`. Trailing chevron dropped from 20px to **16px**. Replaced the placeholder Mekari Pay icon (broken aspect viewBox) and favicon (sharp polygon "A") with proper 24×24 / 32×32 marks drawn from the Pixel library + canonical Jurnal logo. Added submenus from Figma node `1030:3360` for Production, Fulfillment, and Settings. Master-template action row revised per Figma node `1:16062`: three buttons — `More ⌄` dropdown, secondary, primary — labels only (no leading icons). Chevron-right / chevron-left rewritten with 24×24 viewBox so they scale consistently with the rest of the Pixel icon set. Added `chevron-down.svg` for the dropdown trailing.
- **v0.4.0** — Sidebar state recipe re-aligned with Figma node `1029:3771`. Hover & active now use **blue text + blue icon (`#1C44D5`), no background fill** (the prior jurnal-50 fill was wrong). Removed the sidebar's right border — the visual seam is owned by `PageStage`'s `border-left`. Trailing `chevron-right` is now reserved for items with `chevron: true` (Applications only); Reports — and any other submenu-owning item — render without a chevron. Footer collapse toggle uses `sidebar-collapse` / `sidebar-expand` icons, submenu close uses `chevrons-left`. `MpInput` now uses `#prefix` + `#suffix` slots (the `prefix-icon` prop was the root cause of the broken search bar). Added Pixel-correct `mp-button` sizing in the preview (36px height, 20px icons, 8px gap, focus ring).
- **v0.3.0** — Adopted real `logo-jurnal.svg` asset. Introduced semantic interactive-state tokens (`--color-icon-default/hover/active`, `--color-bg-interactive-hover/active`, `--color-text-interactive-active`) so sidebar/submenu/header buttons share one state recipe. Active state now uses jurnal-50 background + jurnal-700 text/icon (Pixel v2.1 selected-nav pattern). Sidebar scrollbar is hidden (still scrollable). All UI copy is English; Bahasa Indonesia variants belong in an i18n layer.
- **v0.2.0** — Added submenu spec from Figma node `1029:3771` (rail auto-collapse to 56px, 208px white submenu panel, accent heading `#4B61DD` with 2.88px tracking). New tokens: `--color-bg-sidebar-collapsed`, `--color-accent-blue-400`, `--layout-sidebar-collapsed-width`, `--layout-submenu-width`. Verified Pixel icon names against Figma component descriptions.
- **v0.1.0** — Initial scaffold from Figma master template (node `1:17750`). Layout, header, sidebar, page title, page stage, master-template + dashboard sample pages.
