# Mekari Jurnal — Design Tokens (Pixel 3 v2.1)

> Living document. Update this file when a token is added, renamed, or
> retired. Pair this with [`design.md`](./design.md) — that file owns the
> rules, this file owns the values.

**Token source of truth:** `@mekari/pixel-tokens` v2.1, mirrored locally for
documentation and emergency fallback in [`assets/css/tokens.css`](../assets/css/tokens.css).

**Mode:** Pixel 3 — v2.1. Do **not** mix v2.4 tokens into this project until a
coordinated migration is planned.

---

## 1. How to use tokens

```vue
<style scoped>
.card {
  background: var(--color-bg-surface);
  color: var(--color-text-default);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}
</style>
```

**Rules**

1. Always reach for the CSS variable, not the raw value. The raw values in this
   file are documentation only — never paste a hex code into a component.
2. Prefer Pixel component **CSS Props** (`gap`, `padding`, `align`) over custom
   margins on `MpFlex`, `MpScrollbar`, `MpSkeleton`.
3. If you need a value that doesn't have a token, propose adding one — open a
   PR against [`assets/css/tokens.css`](../assets/css/tokens.css) and add it
   here before using.

---

## 2. Color

### Brand

| Token                              | Value     | Used for                                            |
| ---------------------------------- | --------- | --------------------------------------------------- |
| `--color-brand-jurnal`             | `#40C3FF` | Jurnal mark; primary product accent (alias of 500)  |
| `--color-brand-jurnal-50`          | `#E3F5FF` | Active sidebar/submenu background tint              |
| `--color-brand-jurnal-100`         | `#C6EBFF` | (reserved — emphasis surfaces)                      |
| `--color-brand-jurnal-500`         | `#40C3FF` | Brand base                                          |
| `--color-brand-jurnal-600`         | `#1AA7E6` | Hover on brand-filled buttons (when used)           |
| `--color-brand-jurnal-700`         | `#008CBE` | Active text/icon on jurnal-50 backgrounds (accessibility) |
| `--color-brand-university`         | `#448AFF` | Cross-product Mekari University accent              |
| `--color-brand-university-700`     | `#3576DC` | Hover on `MpButton variant="primary"`               |

### Blue scale (Pixel 3 v2.1)

| Token                          | Value     | Used for                                            |
| ------------------------------ | --------- | --------------------------------------------------- |
| `--color-blue-100`             | `#E5EAFE` | Active-nav background; button focus ring            |
| `--color-blue-400`             | `#4B61DD` | Alias of `--color-accent-blue-400`                  |
| `--color-blue-500`             | `#1C44D5` | Alias of `--color-primary` (Pixel primary button)   |

### Accent

| Token                          | Value     | Used for                                            |
| ------------------------------ | --------- | --------------------------------------------------- |
| `--color-accent-blue-400`      | `#4B61DD` | Submenu heading label, "View all companies" link    |

### Primary action

| Token                          | Value     | Used for                                            |
| ------------------------------ | --------- | --------------------------------------------------- |
| `--color-primary`              | `#1C44D5` | `MpButton variant="primary"` fill — Blue/$blue-500  |
| `--color-primary-hover`        | `#163DBA` | Primary button hover                                |
| `--color-primary-active`       | `#11339A` | Primary button pressed                              |

### Neutral / Gray scale

| Token                | Value     | Notes                                       |
| -------------------- | --------- | ------------------------------------------- |
| `--color-white`      | `#FFFFFF` | Page card, modal backgrounds                |
| `--color-gray-25`    | `#F8F9FB` | Popover headers, inset cards (user popover) |
| `--color-gray-50`    | `#EDF0F2` | Muted chip background (`⌘K` badge, hover)   |
| `--color-gray-100`   | `#D0D6DD` | Default border, divider                     |
| `--color-gray-200`   | `#B0B8C1` | (reserved — disabled controls)              |
| `--color-gray-300`   | `#8B95A5` | Placeholder text, subtle icons              |
| `--color-gray-400`   | `#8B95A5` | Alias of 300 in v2.1                        |
| `--color-gray-500`   | `#626B79` | Secondary text                              |
| `--color-gray-600`   | `#626B79` | Alias of 500 in v2.1                        |
| `--color-gray-700`   | `#404A5C` | (reserved)                                  |
| `--color-gray-800`   | `#2D3340` | (reserved)                                  |
| `--color-gray-900`   | `#232933` | Primary text                                |
| `--color-dark`       | `#232933` | Alias for `gray-900`                        |

### Surface / Background

| Token                  | Value     | Used for                                  |
| ---------------------- | --------- | ----------------------------------------- |
| `--color-bg-page`      | `#F1F5F9` | App shell background (under stage card)   |
| `--color-bg-surface`   | `#FFFFFF` | PageStage, AppHeader, cards               |
| `--color-bg-muted`     | `#EDF0F2` | Search shortcut badge, chip backgrounds   |
| `--color-bg-sidebar`   | `#F1F5F9` | AppSidebar — expanded (default)            |
| `--color-bg-sidebar-collapsed` | `#E7EDF5` | AppSidebar — collapsed or with-submenu (Extra/$ash-100) |

### Text

| Token                          | Value     | Used for                          |
| ------------------------------ | --------- | --------------------------------- |
| `--color-text-default`         | `#232933` | Headings, body text, active state |
| `--color-text-subtle`          | `#626B79` | Secondary, helper, captions       |
| `--color-text-placeholder`     | `#8B95A5` | Input placeholders                |
| `--color-text-inverse`         | `#FFFFFF` | Text on dark / colored fills      |

### Border

| Token                       | Value     | Used for                       |
| --------------------------- | --------- | ------------------------------ |
| `--color-border-default`    | `#D0D6DD` | All hairlines, dividers        |
| `--color-border-strong`     | `#8B95A5` | Emphasized borders (reserved)  |

### Status / Chart

| Token                       | Value     | Used for                       |
| --------------------------- | --------- | ------------------------------ |
| `--color-status-danger`     | `#EF4444` | Notification badge, errors     |
| `--color-status-success`    | `#10B981` | Positive delta, success toast  |
| `--color-status-warning`    | `#F59E0B` | Warnings                       |
| `--color-status-info`       | `#448AFF` | Informational, links           |

### Semantic interactive states

Two parallel token families:

1. **Sidebar nav (`--color-nav-*`)** — drives `AppSidebar` items and submenu
   items. Follows Pixel's "blue text + blue icon, no fill" recipe (Figma node
   `1029:3771`). Hover and active resolve to the same blue.
2. **Icon-button surfaces (`--color-bg-interactive-*`, `--color-icon-*`)** —
   drives header action buttons, the user chip, and any other icon-only ghost
   button. These keep the gray-50 hover fill.

**Reference these in component styles, not the raw tokens.**

| Token                                  | Resolves to                | Used for                                  |
| -------------------------------------- | -------------------------- | ----------------------------------------- |
| `--color-nav-text-default`             | `--color-text-default`     | Sidebar item text — default state         |
| `--color-nav-text-active`              | `#1C44D5` (Blue/$blue-500) | Sidebar item text — hover & active        |
| `--color-nav-icon-default`             | `--color-gray-500`         | Sidebar icon — default state              |
| `--color-nav-icon-active`              | `#1C44D5`                  | Sidebar icon — hover & active             |
| `--color-icon-default`                 | `--color-gray-500`         | Default icon stroke (icon-buttons)        |
| `--color-icon-hover`                   | `--color-gray-700`         | Icon stroke on icon-button hover/focus    |
| `--color-icon-active`                  | `#1C44D5`                  | Icon stroke on selected icon-button       |
| `--color-bg-interactive-hover`         | `--color-gray-50`          | Hover background for icon-buttons         |
| `--color-bg-interactive-active`        | `--color-brand-jurnal-50`  | (Reserved) selected icon-button fill      |
| `--color-text-interactive-active`      | `#1C44D5`                  | Text on icon-button selected state        |

---

## 3. Spacing

Pixel 3 v2.1 uses a t-shirt scale. **Always use the token** — never a literal `px`.

| Token              | Value | Typical use                                  |
| ------------------ | ----- | -------------------------------------------- |
| `--spacing-4xs`    | 2px   | Badge dot inset, hairline gaps               |
| `--spacing-3xs`    | 4px   | Inline icon-to-text gap, tight stacks        |
| `--spacing-2xs`    | 6px   | Sidebar item vertical padding, small chips   |
| `--spacing-xs`     | 8px   | Default gap between adjacent controls        |
| `--spacing-sm`     | 12px  | Form field internal gap, user-chip gap       |
| `--spacing-md`     | 16px  | Card padding, sidebar group vertical padding |
| `--spacing-lg`     | 24px  | Page padding, primary card padding           |
| `--spacing-xl`     | 32px  | Section spacing                              |
| `--spacing-2xl`    | 40px  | Header inner gap (logo → search)             |
| `--spacing-3xl`    | 48px  | Hero / empty-state vertical padding          |
| `--spacing-4xl`    | 64px  | Page-level large gaps                        |

---

## 4. Border radius

| Token                       | Value | Use                                  |
| --------------------------- | ----- | ------------------------------------ |
| `--border-radius-xs`        | 2px   | Tag chips                            |
| `--border-radius-sm`        | 4px   | Inline pills, tiny badges            |
| `--border-radius-md`        | 6px   | Buttons, sidebar items, PageStage TL corner |
| `--border-radius-lg`        | 8px   | Cards, stat tiles                    |
| `--border-radius-xl`        | 12px  | Modals, large cards                  |
| `--border-radius-full`      | 999px | Avatars, search input, badges        |

---

## 5. Border width

| Token                         | Value | Use                                  |
| ----------------------------- | ----- | ------------------------------------ |
| `--border-width-default`      | 1px   | All hairlines, dividers              |
| `--border-width-strong`       | 2px   | Notification badge ring, focus rings |

---

## 6. Typography

Font family: `--font-family-base` → `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

All Inter usage enables tabular figures via `font-feature-settings: 'lnum' 1, 'tnum' 1;` (applied globally in `assets/css/global.css`).

### Type styles

| Style              | Size | LineH | Weight     | LetterSpacing | Tokens                                                              |
| ------------------ | ---- | ----- | ---------- | ------------- | ------------------------------------------------------------------- |
| H1                 | 24   | 32    | 600        | -0.48px       | `--font-size-h1`, `--line-height-h1`, `--letter-spacing-h1`         |
| H2                 | 20   | 28    | 600        | 0             | `--font-size-h2`, `--line-height-h2`                                |
| H3                 | 18   | 24    | 600        | 0             | `--font-size-h3`, `--line-height-h3`                                |
| Body / Regular     | 14   | 24    | 400        | 0             | `--font-size-body`, `--line-height-body`                            |
| Body small         | 12   | 20    | 400        | 0             | `--font-size-body-sm`, `--line-height-body-sm`                      |
| Label / Regular    | 14   | 20    | 400        | 0             | `--font-size-label`, `--line-height-label`                          |
| Label / Semibold   | 14   | 20    | 600        | 0             | `--font-size-label`, `--line-height-label`, `--font-weight-semibold`|
| Label small        | 12   | 16    | 400        | 0             | `--font-size-label-sm`, `--line-height-label-sm`                    |
| Overline / Semibold| 10   | 12    | 600        | 0             | `--font-size-overline`, `--line-height-overline`                    |

### Weights

| Token                          | Value |
| ------------------------------ | ----- |
| `--font-weight-regular`        | 400   |
| `--font-weight-medium`         | 500   |
| `--font-weight-semibold`       | 600   |
| `--font-weight-bold`           | 700   |

---

## 7. Elevation / Shadow

| Token            | Value                                       | Use                                         |
| ---------------- | ------------------------------------------- | ------------------------------------------- |
| `--shadow-sm`    | `0 1px 2px rgba(35,41,51,0.06)`             | Active sidebar item, raised chips           |
| `--shadow-md`    | `0 4px 8px rgba(35,41,51,0.08)`             | Floating cards, popovers                    |
| `--shadow-lg`    | `0 12px 24px rgba(35,41,51,0.10)`           | Modals, drawers                             |

---

## 8. Layout primitives

These are project-level (not part of `@mekari/pixel-tokens`) and live in
[`assets/css/tokens.css`](../assets/css/tokens.css). Update both here and
there together.

| Token                                | Value | Use                              |
| ------------------------------------ | ----- | -------------------------------- |
| `--layout-header-height`             | 56px  | AppHeader fixed height           |
| `--layout-sidebar-width`             | 216px | AppSidebar — expanded width      |
| `--layout-sidebar-collapsed-width`   | 56px  | AppSidebar — collapsed or with-submenu width |
| `--layout-submenu-width`             | 208px | Sidebar submenu panel width      |
| `--layout-page-title-height`         | 72px  | PageTitle fixed height           |

---

## 9. Z-index scale

| Token            | Value | Use                          |
| ---------------- | ----- | ---------------------------- |
| `--z-sidebar`    | 10    | AppSidebar                   |
| `--z-header`     | 20    | AppHeader (sticky)           |
| `--z-popover`    | 30    | Popovers, dropdowns          |
| `--z-modal`      | 40    | Modals, drawers              |
| `--z-toast`      | 50    | Toasts, notifications        |

---

## 10. Migration notes (v2.1 → v2.4)

Not in scope for this boilerplate. When the migration is planned, document:

- Token rename map (e.g. `--spacing-2xs` → `--spacing-100`).
- Color renames (Pixel 2.4 introduces semantic color slots like `--color-bg-positive` etc.).
- Component prop deltas.
- Coordinated bump of `@mekari/pixel-tokens` + `@mekari/pixel3`.

Until then: **stay on v2.1, do not import v2.4 variables**.

---

## Changelog

- **v0.8.0** — Added Pixel 2.1 tokens missing from the v0.6 cut: `--color-gray-25` (`#F8F9FB`) for popover headers and inset cards; `--color-gray-400` alias of gray-300 for strong popover borders; `--color-blue-100` (`#E5EAFE`) for active-nav background and the button focus ring; plus `--color-blue-400` and `--color-blue-500` aliases so the full Blue scale is addressable as a family. The active-nav background now consumes `--color-blue-100` and button focus rings now consume the same token, keeping selected + focused state visually coherent.
- **v0.6.0** — Added a dedicated primary-action token family (`--color-primary` `#1C44D5`, `--color-primary-hover` `#163DBA`, `--color-primary-active` `#11339A`). The `MpButton variant="primary"` now resolves to these, NOT `--color-brand-university` (which is the lighter Mekari University accent and was incorrectly serving as primary).
- **v0.5.0** — Added Pixel motion tokens: `--motion-duration-fast` (120ms), `--motion-duration-base` (200ms), `--motion-duration-slow` (320ms), `--motion-ease-out`, `--motion-ease-in`, `--motion-ease-in-out`. Use these for all transitions and keyframe animations; never hardcode timing values in components.
- **v0.4.0** — Added the sidebar nav-state token family (`--color-nav-text-default`, `--color-nav-text-active`, `--color-nav-icon-default`, `--color-nav-icon-active`). Re-pointed `--color-icon-active` / `--color-text-interactive-active` from `jurnal-700` to `#1C44D5` (Blue/$blue-500) to match the Figma selected-nav pattern. `--color-bg-interactive-active` is no longer applied to sidebar items.
- **v0.3.0** — Added brand step palette (`--color-brand-jurnal-50/100/500/600/700`, `--color-brand-university-700`) and semantic interactive-state tokens (`--color-icon-default/hover/active`, `--color-bg-interactive-hover/active`, `--color-text-interactive-active`).
- **v0.2.0** — Added accent (`--color-accent-blue-400`), sidebar-collapsed bg (`--color-bg-sidebar-collapsed`), and layout tokens for the submenu pattern (`--layout-sidebar-collapsed-width`, `--layout-submenu-width`).
- **v0.1.0** — Initial token map extracted from Figma master template (node `1:17750`) and Pixel 3 v2.1 reference.
