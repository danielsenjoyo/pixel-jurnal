<!--
  SummaryBox — port of the official Mekari Pixel "summary box" pattern
  (Pixel-Sandbox/pixel3-templates-patterns · src/patterns/summary-box).

  Anatomy: a two-tone card — a type-tinted TOP band (label + count badge)
  over a neutral white BOTTOM band ("Total" caption + amount), with an
  optional loading spinner and filter affordance.

  The upstream component styles with 2.4 semantic tokens (background.warning,
  border.warning, …) which only resolve under the next theme. This project is
  pinned to token mode 2.1 (app.vue → setNextTheme(false)), so the same tokens
  are mapped to their 2.1 raw equivalents here. Structure, props, and slots
  match the upstream component.
-->
<script setup lang="ts">
import { computed } from "vue";
import { css, MpText, MpTooltip, MpIcon, MpSpinner } from "@mekari/pixel3";

type Variant = "orange" | "red" | "green" | "blue" | "gray";

const props = withDefaults(
  defineProps<{
    as?: string;
    isLoading?: boolean;
    variant?: Variant;
    label?: string;
    badge?: string | number;
    caption?: string | number;
    amount?: string | number;
    isFilter?: boolean;
    isActive?: boolean;
    isHoverable?: boolean;
  }>(),
  {
    as: "div",
    variant: "gray",
    label: "Label",
    caption: "Total",
    amount: 0
  }
);

// Per-variant token classes written as LITERAL css() calls so Panda's static
// extractor emits the atomic rules. Object indirection (css({ bg: map[x] }))
// is NOT extracted, so each value must appear literally in a css() argument.
// 2.1 raw-token equivalents of the upstream 2.4 semantic tokens.
const BORDER = {
  orange: css({ borderColor: "orange.400" }),
  red: css({ borderColor: "red.400" }),
  green: css({ borderColor: "green.400" }),
  blue: css({ borderColor: "blue.400" }),
  gray: css({ borderColor: "gray.100" })
} as const;

const HOVER = {
  orange: css({ _hover: { borderColor: "orange.700", boxShadow: "lg" } }),
  red: css({ _hover: { borderColor: "red.700", boxShadow: "lg" } }),
  green: css({ _hover: { borderColor: "green.700", boxShadow: "lg" } }),
  blue: css({ _hover: { borderColor: "blue.700", boxShadow: "lg" } }),
  gray: css({ _hover: { borderColor: "gray.400", boxShadow: "lg" } })
} as const;

const TOP_BG = {
  orange: css({ bg: "orange.50" }),
  red: css({ bg: "red.50" }),
  green: css({ bg: "green.50" }),
  blue: css({ bg: "blue.50" }),
  gray: css({ bg: "gray.25" })
} as const;

const BADGE_BG = {
  orange: css({ bg: "orange.500" }),
  red: css({ bg: "red.500" }),
  green: css({ bg: "green.500" }),
  blue: css({ bg: "blue.500" }),
  gray: css({ bg: "gray.400" })
} as const;

const rootBaseClass = css({
  display: "flex",
  flexDirection: "column",
  borderWidth: "sm",
  rounded: "md",
  overflow: "hidden",
  transition: "all 0.1s ease, box-shadow 0.5s ease"
});

const topBaseClass = css({
  display: "flex",
  position: "relative",
  px: 3,
  py: 2,
  gap: 2,
  justifyContent: "space-between",
  alignItems: "center"
});

const badgeBaseClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  px: "1.5",
  py: "0.5",
  height: "5",
  rounded: "full"
});

const rootClass = computed(() => [
  rootBaseClass,
  BORDER[props.variant],
  props.isHoverable || props.isFilter ? HOVER[props.variant] : "",
  props.isFilter ? filterHoverRevealClass : ""
]);
const topContentClass = computed(() => [topBaseClass, TOP_BG[props.variant]]);
const badgeClass = computed(() => [badgeBaseClass, BADGE_BG[props.variant]]);

const labelWrapClass = css({ minWidth: 0, flex: "1 1 auto" });
const bottomContentClass = css({ position: "relative", bg: "white", width: "full" });
const bottomWrapClass = css({ display: "flex", flexDirection: "column", px: 3, py: 2 });
// Bottom-band affordance (filter icon, action button, or text link + button),
// pinned to the right and vertically centred against the amount row.
const filterWrapClass = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  right: "3",
  display: "flex",
  alignItems: "center"
});

// Filter-icon variant: hide the affordance at rest, fade it in when the card is
// hovered. Applied to the root so it can react to the card's :hover; the inner
// [data-summary-filter] element carries a transition for the fade.
const filterHoverRevealClass = css({
  "& [data-summary-filter]": { opacity: "0", transition: "opacity 0.12s ease" },
  _hover: { "& [data-summary-filter]": { opacity: "1" } }
});
const loadingWrapClass = css({
  position: "absolute",
  inset: "0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
});
</script>

<template>
  <component
    :is="props.as"
    :class="rootClass"
    :style="{ cursor: props.isHoverable || props.isFilter ? 'pointer' : '' }"
  >
    <!-- Top band: label + count badge (tinted by variant). -->
    <div :class="topContentClass">
      <div :class="labelWrapClass">
        <!-- #label overrides the text label with custom content (e.g. a product
             logo, as in the Mekari Pay summary-box variant). -->
        <slot name="label">
          <MpTooltip :label="String(label)">
            <MpText weight="semiBold" color="dark" is-truncated>{{ label }}</MpText>
          </MpTooltip>
        </slot>
      </div>

      <div v-if="badge !== undefined && badge !== '' && !props.isLoading" :class="badgeClass">
        <MpText size="body-small" color="white">{{ badge }}</MpText>
      </div>

      <slot name="top-right-content" />
    </div>

    <!-- Bottom band: caption + amount (neutral white). -->
    <div :class="bottomContentClass">
      <div :class="bottomWrapClass" :style="{ visibility: props.isLoading ? 'hidden' : 'visible' }">
        <MpText size="label-small" color="gray.600">{{ caption }}</MpText>
        <MpText as="p" size="h2" weight="semiBold" color="dark">{{ amount }}</MpText>

        <!-- data-summary-filter marks the filter affordance: hidden at rest,
             revealed on card hover (see filterHoverRevealClass). Inline opacity
             keeps it visible while a filter is active. Bottom-right slot content
             (buttons/links) is never marked, so it always stays visible. -->
        <div
          v-if="props.isFilter || $slots['bottom-right-content']"
          :class="filterWrapClass"
          :data-summary-filter="props.isFilter ? '' : undefined"
          :style="props.isFilter && props.isActive ? { opacity: 1 } : undefined"
        >
          <MpTooltip v-if="props.isFilter" label="Filter" placement="bottom">
            <MpIcon
              name="filter"
              size="sm"
              :color="props.isActive ? 'dark' : 'gray.400'"
              :variant="props.isActive ? 'duotone' : 'outline'"
            />
          </MpTooltip>
          <slot v-else name="bottom-right-content" />
        </div>
      </div>

      <div v-if="props.isLoading" :class="loadingWrapClass">
        <MpSpinner size="md" />
      </div>
    </div>
  </component>
</template>
