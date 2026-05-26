# Mekari Jurnal — Design System Notes

> Living document. Update this file whenever component behavior, layout
> dimensions, or interaction rules are clarified or change. Pair this with
> [`tokens.md`](./tokens.md) — that file owns the raw values, this file owns
> the rules and rationale.

**Token mode:** Pixel 3 — Design Tokens **v2.1**.
**Reference Figma:** Jurnal Master Pages → node `1:17750` (Master Template).

---

## 1. Layout system

The Jurnal master template is composed of three regions:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AppHeader                                                       (56px)  │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │  PageTitle                                       (72px)  │
│  AppSidebar  ├──────────────────────────────────────────────────────────┤
│   (216px)    │  PageStage  (white card, rounded-top-left, border-l/t)  │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

| Region          | Component    | Size                                | Tokens                                                                                                            |
| --------------- | ------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Top bar         | `AppHeader`  | `--layout-header-height` (56px)     | `--color-bg-surface`, `--color-border-default` (bottom)                                                           |
| Left navigation | `AppSidebar` | `--layout-sidebar-width` (216px)    | `--color-bg-sidebar` — **no right border** (the visual seam comes from PageStage's left border + top-left radius) |
| Page heading    | `PageTitle`  | `--layout-page-title-height` (72px) | `--color-bg-page` (transparent over shell)                                                                        |
| Body card       | `PageStage`  | flex `1 1 auto`                     | `--color-bg-surface`, `--border-radius-md` top-left, `--color-border-default` top + left                          |

**Rule — page composition.** Every Nuxt page renders **exactly one**
`<PageTitle />` followed by **exactly one** `<PageStage />`. The default
layout (`layouts/default.vue`) injects the header and sidebar — pages must not
render those themselves.

---

## 2. AppHeader

| Slot    | Component            | Spec                                                                                                                                                                                                                              |
| ------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo    | `AppLogo`            | 114×40 lockup, mark uses `--color-brand-jurnal`                                                                                                                                                                                   |
| Search  | `MpInput`            | 480px wide, `rounded="full"`, **`#prefix` slot** with `MpIcon search`, **`#suffix` slot** with a plain `.app-header__search-shortcut` chip (`⌘K`). Do NOT use the `prefix-icon` prop — it conflicts with the suffix slot in v2.1. |
| Actions | `MpButton` icon-only | `quick-access`, `live-chat`, `gift`, `help`, `time`, `notification`, `shortcut`                                                                                                                                                   |
| User    | `MpAvatar` + label   | 32px avatar, two-line label (Semibold name + Regular company)                                                                                                                                                                     |

**Rules**

- Header is `position: sticky; top: 0`. Z-index = `--z-header`.
- All inner gaps come from `MpFlex` props (`gap={24}`, `gap={40}`, `gap={8}`) — no margin/padding overrides.
- The notification icon shows a `MpBadge variant="danger"` with `9+` when there are unread items. The badge is absolutely positioned at `top: -2px; right: -2px`.
- Action buttons use `variant="ghost"`, `size="md"`, `icon-only` — never inherit text labels into the visible UI.
- Search input is always visible at desktop ≥1024px. Collapse behavior on smaller breakpoints is **not yet specified** — track in [#TODO].

---

## 3. AppSidebar

The sidebar has **three states** (per Figma node `1029:3771`):

| State                        | Rail width                                | Rail background                            | Submenu?                          |
| ---------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------- |
| Default (expanded)           | `--layout-sidebar-width` (216px)          | `--color-bg-sidebar` (`#F1F5F9`)           | —                                 |
| User-collapsed               | `--layout-sidebar-collapsed-width` (56px) | `--color-bg-sidebar-collapsed` (`#E7EDF5`) | —                                 |
| Submenu open (auto-collapse) | 56px (forced)                             | `#E7EDF5` (forced)                         | 208px panel attaches to the right |

- Items are grouped. Groups are separated by `border-bottom: 1px solid var(--color-border-default)`. The last group has no separator.
- Item padding: `var(--spacing-2xs) var(--spacing-xs) var(--spacing-2xs) 10px` (left = 10px to align icons under the logo).
- Item icon size: 24px. Item label: `--font-size-label` / `--line-height-body`.
- In collapsed/submenu-open state: items center their icon (no label, no chevron, `justify-content: center`).

### Item states (Pixel 3 v2.1 — Figma node `1029:3771`)

Sidebar nav uses Pixel's **"blue text + blue icon, no fill"** recipe. Hover
and active share the same visual treatment; the only difference is intent
(transient hover vs. persistent selection). Font weight does **not** change
across states.

| State    | Background                     | Text                                  | Icon style                                        | Font weight              |
| -------- | ------------------------------ | ------------------------------------- | ------------------------------------------------- | ------------------------ |
| Default  | transparent                    | `--color-nav-text-default` (gray-900) | Outline, `--color-nav-icon-default` (gray-500)    | `--font-weight-regular`  |
| Hover    | transparent                    | `--color-nav-text-active` (`#1C44D5`) | Outline, `--color-nav-icon-active` (`#1C44D5`)    | `--font-weight-regular`  |
| Active   | `--color-blue-100` (`#E5EAFE`) | `--color-nav-text-active` (`#1C44D5`) | **Filled**, `--color-nav-icon-active` (`#1C44D5`) | `--font-weight-semibold` |
| Disabled | transparent (60% opacity)      | inherits                              | inherits                                          | `--font-weight-regular`  |

Hover keeps the no-fill blue-text shift; the active state stacks **three**
visual signals: Blue/$blue-100 background, SemiBold blue text, and a
**filled-icon swap**. The boilerplate synthesises the fill via CSS
(`fill: currentColor` on the icon SVG paths), which works for the
closed-path Pixel icons. Swap in dedicated `-fill.svg` assets per icon if
perfect parity is required.

The token pair (`--color-nav-text-*`, `--color-nav-icon-*`) drives both the
main rail items and the submenu items so the recipe stays in lockstep.
**Background fills are reserved for icon-button surfaces** (header action
buttons, user chip) via `--color-bg-interactive-hover` — sidebar items must
never paint a fill. If you find yourself reaching for `--color-bg-interactive-active`
inside a sidebar style, you're off-spec.

### Trailing chevron

Per Figma, only the **Applications** item shows a trailing `chevron-right`
(the chevron signals "links outward to the marketplace"). Items that own a
submenu — like Reports — open an in-rail panel on click and intentionally
display no chevron. Drive this via the `chevron: true` flag on the
`SidebarItem`, not by inspecting `submenu`.

**Chevron size: 16px.** The Pixel `chevron-right` icon is a 24×24 viewBox
with a small ~6×12 mark — rendering it inside a 16×16 slot keeps it visually
secondary to the 24px row icon.

### Submenu animation

Submenu open/close uses Pixel motion tokens — `200ms` ease-out, with an
`8px` translateX offset and fade. The Nuxt impl wraps the panel in a
`<Transition name="app-submenu">` so both enter and leave animate. A
`@media (prefers-reduced-motion: reduce)` block disables the transitions
for accessibility.

### Rail collapse animation

The 216 ↔ 56 px rail width change is symmetric, so it uses
`--motion-duration-slow` (320ms) with `--motion-ease-in-out`. Item labels
and chevrons fade via `opacity` in parallel — **no** `display: none`
toggles, which previously caused a snap mid-transition. The rail has
`overflow-x: hidden` so faded content is clipped automatically. Item
`padding` also animates so the icon ends up centred in the collapsed
56 px slot without an abrupt jump.

### Sidebar scrolling

The nav region (`.app-sidebar__scroll`) is **scrollable but has no visible scrollbar**:

```css
.app-sidebar__scroll {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
.app-sidebar__scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
```

Apply the same pattern to `.app-submenu__scroll`. Don't disable scrolling itself — keyboard / trackpad scrolling must still work.

### Footer (Company ID strip)

- Height: 68px.
- Contains: collapse toggle (icon button) + `Company ID: <id>` text.
- Border-top: `1px solid var(--color-border-default)`.
- **Collapse icon names (Pixel 3 v2.1):**
  - Rail expanded → click to collapse: `sidebar-collapse` (`|←` — arrow into a left-aligned bar).
  - Rail collapsed (incl. submenu-open state) → click to expand: `sidebar-expand` (`→|`).
  - Submenu close button (right-aligned at the submenu footer): `chevrons-left` (double `«`).

### Groups (current Jurnal nav order)

UI copy is **English by default**. Layer i18n on top if Bahasa Indonesia is needed — don't fork the source data.

1. **Core** — Home, Dashboard, **Reports** (has submenu), Budget
2. **Transactions** — Cash & bank, Sales, Purchase, Expenses, Job order, Mekari Pay
3. **Master data** — Contacts, Products, **Production** (has submenu), **Fulfillment** (has submenu), Assets, Chart of accounts
4. **Apps** — Applications (trailing chevron)
5. **Settings** — Other lists, Integrations, **Settings** (has submenu)

Items with submenus per Figma node `1030:3360`:

- **Reports** → Business overview, Sales, Purchase, Products, Assets, Exchange rate, Bank, Tax, Jurnal Insights
- **Production** → Bill of Material (BOM), Work order, Standard cost, Production account mapping
- **Fulfillment** → Sales, Purchases, Sold / Released, Depreciation
- **Settings** → Company, User settings, Sales, Purchases, Products, Production, Templates, Custom fields, Account mapping, Billing, Approval rules, Tagging rules

The grouping is owned by `composables/useNavigation.ts`. Update there, not in the template.

### Submenu

A sidebar item with a `submenu` field doesn't navigate on click — it opens a
submenu panel and **forces the main rail into collapsed mode**. Spec:

| Element          | Value                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel width      | `--layout-submenu-width` (208px)                                                                                                                         |
| Panel background | `--color-bg-sidebar` (`#F1F5F9`, Extra/$background) — **not white**                                                                                      |
| Panel borders    | `border-left`: `1px solid var(--color-border-default)` only (no right border)                                                                            |
| Panel padding    | `var(--spacing-md) var(--spacing-xs)` (16/8)                                                                                                             |
| Heading          | Inter SemiBold 12/16, color `--color-accent-blue-400` (`#4B61DD`), letter-spacing **2.88px**, uppercase. Padding: `var(--spacing-2xs) var(--spacing-sm)` |
| Submenu item     | Inter Regular 14/20, color `--color-text-default`. Padding `var(--spacing-xs) var(--spacing-sm)`. Radius `--border-radius-md`                            |
| Item hover       | Background `--color-gray-50`                                                                                                                             |
| Item active      | Background `--color-gray-50`, font-weight SemiBold                                                                                                       |
| Submenu footer   | 68px tall, right-aligned chevron-left button to close the submenu                                                                                        |

**Rules**

- Only one submenu is open at a time. Clicking the parent item again toggles closed.
- When a submenu is open, the rail's user-collapse toggle becomes a "close submenu" affordance (clicking it returns to the previous rail state).
- The submenu state is component-local. If we need cross-route persistence (e.g. remember which submenu was last open), promote it to a `useState` composable later.
- The rail's right border is suppressed when a submenu is open — the submenu panel's `border-left` carries the seam.

Example data (Reports):

```ts
{
  label: 'Reports',
  icon: 'reports',
  to: '/reports',
  submenu: {
    heading: 'REPORTS',
    items: [
      { label: 'Business overview', to: '/reports/business-overview' },
      { label: 'Sales', to: '/reports/sales' },
      // ...
    ]
  }
}
```

---

## 4. PageTitle

- Height: 72px fixed (`--layout-page-title-height`).
- Padding: `var(--spacing-md) var(--spacing-lg)` (16px × 24px).
- Heading: H1 = 24/32 SemiBold, letter-spacing **-0.48px** (from Figma, do not round to -0.5).
- Optional `subtitle` slot renders below heading as `--font-size-body-sm` / `--color-text-subtle`.
- Optional `#actions` named slot, right-aligned, `--spacing-xs` gap between actions.

### Master-template action row (Figma node `1:16062`)

The master-template page header carries a **3-button row**:

1. **"More" dropdown** — `MpButton variant="secondary"`, trailing `chevron-down` icon at 16px, `aria-haspopup="menu"`. Opens a popover (not yet implemented).
2. **Secondary action** — `MpButton variant="secondary"`. Use a verb label (e.g. `Export`).
3. **Primary action** — `MpButton variant="primary"`. Use a verb label (e.g. `Create new`).

Button color tokens (Pixel 3 v2.1):

| Variant   | Background fill                                                                                                                  | Border                                                            | Text                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| Primary   | `--color-primary` (`#1C44D5`, Blue/$blue-500) — **not** `--color-brand-university` which is the lighter Mekari University accent | same as fill                                                      | `--color-text-inverse` (white)    |
| Secondary | `--color-white`                                                                                                                  | `--color-border-default` (gray-100) → `--color-gray-300` on hover | `--color-text-default` (gray-900) |

Pixel md-button geometry:

- Height: `36px`.
- Horizontal padding: **`var(--spacing-md)` (16px)** — `--spacing-sm` (12px) is the small-size padding.
- Gap between icon and label: `var(--spacing-xs)` (8px).
- Icon size inside the button: 20px (sm: 16px).
- Font: `--font-size-label` SemiBold.
- Border radius: `--border-radius-md` (6px).
- Focus ring: `0 0 0 3px var(--color-blue-100)` — same Blue/$blue-100 token the active-nav fill uses, so focus and selection stay visually coherent.

Figma labels the 2nd and 3rd buttons "Label" as placeholders — substitute meaningful copy in your page. Buttons do **not** carry leading icons in this row (the 3-button pattern intentionally reads as label-only). Gap between buttons in the row: `--spacing-xs` (8px).

---

## 5. PageStage

The white card content sits on. Visual rules:

- Background: `--color-bg-surface`.
- `border-top` + `border-left`: `1px solid var(--color-border-default)`.
- `border-top-left-radius: --border-radius-md` (6px). No other rounded corners.
- No bottom or right border — the card runs to the viewport edge.
- Padding is selected via the `padding` prop (`none | sm | md | lg | xl`). Default is `lg` (24px). **Do not use `:style="padding: …"`** — choose a token-keyed preset or extend the prop.

---

## 6. Iconography

- Icon set: Pixel 3 icon library, accessed via `<MpIcon name="…" :size="24" />`.
- Sidebar icons: 24px. Header action icons: 24px. Inline-with-text icons (e.g. inside buttons): 20px.
- Always verify icon name with `get-icon-name` from the Pixel MCP before using a new icon. Don't guess names.
- Icon-only buttons must carry an `aria-label`.

| Concept           | Icon name                             |
| ----------------- | ------------------------------------- |
| Quick access      | `add`                                 |
| Live chat         | `live-chat`                           |
| Referral          | `gift`                                |
| Help              | `help`                                |
| Activity log      | `time`                                |
| Notification      | `notification`                        |
| App switcher      | `shortcut`                            |
| Home              | `home`                                |
| Reports           | `reports`                             |
| Budget / Finance  | `finance`                             |
| Bank              | `bank`                                |
| Sales             | `sales`                               |
| Purchase          | `cart`                                |
| Expense           | `expense`                             |
| Job order / Tax   | `task-check`                          |
| Mekari Pay        | `mekari-pay`                          |
| Contacts          | `contact`                             |
| Product           | `product`                             |
| Production        | `fulfillment`                         |
| Fulfillment       | `truck`                               |
| Assets            | `assets`                              |
| Chart of accounts | `chart-of-account`                    |
| Marketplace       | `application`                         |
| Other lists       | `doc`                                 |
| Integrations      | `add-ons`                             |
| Settings          | `settings`                            |
| Chevron right     | `chevron-right`                       |
| Chevron down/up   | `chevron-down` / `chevron-up`         |
| Sidebar collapse  | `sidebar-collapse` / `sidebar-expand` |
| External link     | `external-link`                       |
| Check (selected)  | `check`                               |

---

## 7. Component-import discipline

- **All Pixel primitives come from `@mekari/pixel3`.** Never `@mekari/pixel-vue` or `@mekari/pixel` directly.
- Pixel components are registered globally via the `plugins/pixel.ts` plugin, but for SFC clarity we still `import` them explicitly at the top of each `<script setup>` block.
- For new components, validate props with the Pixel MCP `get-component` tool before adding. Update this doc when a non-obvious prop combination is required.

### Form fields

- All validated form fields **must** be wrapped in `<MpFormControl>`. The form control owns the label, helper text, and error state — fields do not manage those themselves.
- For Mp inputs without a wrapping form control (e.g. the header search), an explicit `aria-label` is required.

---

## 8. Styling rules

1. **No inline CSS, anywhere.** No `style="…"` attribute, no `:style="…"` binding. If a value needs to be computed, use a `class` toggle and a token-keyed CSS rule in `<style scoped>`.
2. Prefer CSS Props on `MpFlex`, `MpScrollbar`, `MpSkeleton` (e.g. `gap`, `padding`, `align`) — see [Pixel styling notes](https://docs.pixel.mekari.com/styling). Use `css()` only when CSS Props are unavailable.
3. Every length value in `<style>` should resolve to a token (`var(--…)`). Raw `px` is permitted **only** for hairlines (`1px`, `2px`) and Figma-spec'd values that don't yet have a token (call those out with a comment).
4. Colors must resolve to a `--color-*` token. Direct hex literals are a code-review block.

---

## 9. Behavior notes (update as discovered)

- **Search input keyboard.** `⌘K` (macOS) / `Ctrl+K` (other) should focus the header search. Not yet wired up.
- **User pulldown popover** (Figma node `25:134179`) is implemented in `components/AppUserPopover.vue`, anchored to the user chip in `AppHeader`. Spec:
  - Width 320px, `--border-radius-md` (6px, not lg), `1px solid --color-border-default`, `z-index: --z-popover`. Shadow per Figma: `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)`.
  - Header band: **`--color-gray-25` (`#F8F9FB`)** — centred **48px** avatar + SemiBold name + subtle company line. Bottom border `--color-border-default`.
  - Sections separated by `--color-gray-50` hairlines (lighter than the popover border): (1) Personal info / Support center (external-link icon) / **Companies on Jurnal** (expandable, chevron-up/down) / API credentials; (2) Language (with right-aligned current locale) / Sign out; (3) footer.
  - Row spec: 36px min-height, `var(--spacing-xs) var(--spacing-sm)` (8/12) padding, hover bg gray-50.
  - **Companies sub-list** is an inset card: `var(--spacing-sm)` (12px) margin on each side, **`--color-gray-25` fill**, 1px `--color-gray-50` border, `--border-radius-md`. Contains a scrollable list (`max-height: 180px`) plus a trailing **"View all companies"** link in `--color-accent-blue-400`.
  - Each company row: name (14/20) + ID (12/20 subtle) stacked with `var(--spacing-3xs)` gap. Current company is SemiBold with a trailing **gray-900** `check` icon (NOT the bright nav-active blue).
  - Footer: Overline 10/12 type, `--color-text-subtle`. Two stacked lines: legal links separated by `·` middots, then copyright.
  - Toggle: click the chip → open. Outside-click or `Escape` → close. Both are bound globally in `AppHeader` via `pointerdown` / `keydown`. Enter animation: `--motion-duration-fast` ease-out, 4px translateY + fade.
- **Quick Access popover** (`Popover / Quick Access` in Figma) is 240×268. Not yet implemented.
- **Submenu auto-close on route change** — currently the submenu stays open across route changes. Decide whether to auto-close on `to` route activation (probably yes, with an exception when the route is inside the submenu). Not yet wired up.

---

## 10. Accessibility baseline

- All icon-only buttons → `aria-label`.
- Sidebar `<aside>` → `aria-label="Navigasi utama"`.
- Active sidebar route → relies on `NuxtLink active-class` for semantic active state; don't add `aria-current` manually until pages reflect actual routes.
- Focus styles on the user button and sidebar items are inherited from Pixel's focus ring (`:focus-visible`). Don't override with `outline: none` without providing a replacement.

---

## Changelog

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
