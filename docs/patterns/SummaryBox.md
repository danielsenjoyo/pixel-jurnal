# Summary Box (KPI strip)

> Part of the Mekari Jurnal page-construction pattern set.
> Component: [`app/components/template/SummaryBox.vue`](../../app/components/template/SummaryBox.vue).
> Reference usage: [`index-template.vue`](../../app/pages/templates/index-template.vue) Zone A.
> Port of the official Mekari Pixel "summary box" (`Pixel-Sandbox/pixel3-templates-patterns`).

## Purpose

A two-tone KPI card — a type-tinted **top band** (label + count badge) over a
neutral white **bottom band** (caption + amount) — laid out in a responsive grid
at the top of an index page. Optional loading spinner and filter affordance.

## When to use

Optional. Use when a list screen benefits from a KPI summary (overdue totals,
counts by status, …). Omit entirely on pages with no headline numbers.

## Markup

```vue
<div :class="statsGridClass"><!-- repeat(auto-fit, minmax(240px,1fr)); gap:4 -->
  <!-- count badge + hover-reveal filter icon -->
  <SummaryBox variant="red" label="Overdue" :badge="12" amount="1,250,000" is-filter />

  <!-- top-band icon + tooltip -->
  <SummaryBox variant="orange" label="Due soon" amount="680,000">
    <template #top-right-content>
      <MpTooltip label="Due within 7 days" placement="bottom">
        <MpIcon name="doc" size="sm" color="gray.400" />
      </MpTooltip>
    </template>
  </SummaryBox>

  <!-- action button in the bottom band -->
  <SummaryBox variant="gray" label="Paid" amount="3,400,000">
    <template #bottom-right-content>
      <MpButton variant="secondary" size="sm">View</MpButton>
    </template>
  </SummaryBox>
</div>
<div :class="statsCaptionClass">
  <MpText size="body-small" color="gray.600">As of 18 Jun 2026</MpText>
</div>
```

## Props

| Prop          | Values                               | Notes                                                                            |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `variant`     | `orange` `red` `green` `blue` `gray` | Tints the top band + border. `gray` = neutral default.                           |
| `label`       | string                               | Top-band title (truncates with a tooltip).                                       |
| `badge`       | string \| number                     | Count pill in the top band (omit → no pill).                                     |
| `caption`     | string                               | Bottom-band caption (default `Total`).                                           |
| `amount`      | string \| number                     | **Pre-formatted** value string.                                                  |
| `isFilter`    | boolean                              | Filter icon in the bottom band that **reveals on card hover** (tooltip-wrapped). |
| `isActive`    | boolean                              | Keeps the filter icon visible + filled (`duotone`) while a filter is applied.    |
| `isHoverable` | boolean                              | Hover border + shadow lift (also implied by `isFilter`).                         |
| `isLoading`   | boolean                              | Spinner overlay; hides the amount.                                               |

## Slots

| Slot                    | Use                                                       |
| ----------------------- | --------------------------------------------------------- |
| `#label`                | Replace the text title with custom content (e.g. a logo). |
| `#top-right-content`    | Icon/tooltip at the top-right of the tinted band.         |
| `#bottom-right-content` | Action button(s) / text link in the bottom band.          |

## Rules

- Grid is `repeat(auto-fit, minmax(240px, 1fr))`, `gap: 4` — **never** a fixed column count.
- Pick the variant by **intent**: `orange` = warning, `red` = danger/overdue, `green` = success, `blue` = info, `gray` = neutral.
- `amount` is pre-formatted by the caller (`Intl.NumberFormat`) — the component does not format.
- Optional caption row (`statsCaptionClass`) is right-aligned `body-small / gray.600`.

## Gotchas

- Per-variant classes are written as **literal `css()` calls** (a `BORDER`/`TOP_BG`/`BADGE_BG` map). Panda's static extractor won't emit rules for `css({ bg: map[x] })` indirection — each token value must appear literally. Add a new variant by extending all the literal maps, not by computing a token string.
- `#bottom-right-content` content is **always visible**; only the built-in `is-filter` icon hides-until-hover.
- **A KPI strip sitting above a table is read as a summary _of that table_.**
  If the figures are scoped differently — one record type only, or ignoring the
  active tab / filter / search — they will silently describe a different dataset
  than the rows beneath them. The Purchase audit caught exactly this: the strip
  stays on invoice totals while the user is on the Request tab, and keeps showing
  millions while a search renders "not found" (`CHOICE · Contextual`, `reports/`).
  **Two ways out, and the reference picks the second.** Either scope the
  figures to the same query that feeds the table, or keep them global and
  *say so in the caption*. Purchases does the latter: the boxes are always the
  all-time invoice figures and don't move when you change tab, filter or
  search, and the caption reads **"Balance is for all time period, unless
  stated otherwise"**. That works because the labels are themselves
  invoice-specific ("Unpaid invoices", "Payments sent last 30 days") — a strip
  whose labels already name their scope isn't mistaken for a summary of
  whatever happens to be below it. Re-scoping per tab was tried first and
  undone: it forced every metric to be one that made sense for every type,
  which is how "Payments sent last 30 days" became a meaningless "Total value".
- **A click on a scoped box should land you where the figure came from.** These
  boxes describe invoices, so clicking one switches to the Invoice tab *and*
  applies that status. Filtering in place would contradict the number just
  clicked whenever another tab was open.
