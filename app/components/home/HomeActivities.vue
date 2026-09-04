<template>
  <MpFlex as="section" flexDirection="column" alignItems="center" gap="6" width="full">
    <MpFlex flexDirection="column" alignItems="center" gap="1">
      <MpText size="body" color="gray.600">
        {{ tField(copy.greeting, "label") }}, {{ userName }}
      </MpText>
      <MpText as="h1" size="h1" weight="semiBold" color="dark">
        {{ tField(copy.activitiesTitle, "label") }}
      </MpText>
    </MpFlex>

    <div :class="gridClass">
      <button
        v-for="activity in activities"
        :key="activity.id"
        type="button"
        :class="[tileClass, activity.id === 'mekari-pay' && centeredTileClass]"
        @click="navigateTo(activity.route)"
      >
        <MpIcon :name="activity.icon" size="md" color="blue.400" />
        <MpText size="label" weight="semiBold" color="dark">
          {{ tField(activity, "label") }}
        </MpText>
      </button>
    </div>
  </MpFlex>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpFlex, MpIcon, MpText } from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import { usePixelLayout } from "~/composables/usePixelLayout";
import { HOME_ACTIVITIES as activities, HOME_SECTION_COPY as copy } from "~/data/home";

const { tField } = useLanguage();
const { accountInformation } = usePixelLayout();

/** Greeting name — the same account chip the navbar renders. */
const userName = computed(() => accountInformation.value.fullName);

// Three-column grid capped at the 776px content column every Home section
// shares (production `max-width="776px"`). Drops to two columns on narrow
// viewports, matching the production breakpoint set.
const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 3,
  width: "full",
  maxWidth: "776px",
  "@media (max-width: 768px)": { gridTemplateColumns: "repeat(2, 1fr)" }
});

// Shortcut tile — 56px row, icon + label, lifts on hover. The hover recipe
// (white fill + shadow, border unchanged) is production's `.box-hover`.
const tileClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  height: "56px",
  px: 3,
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "sm",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  _hover: { boxShadow: "md" }
});

// Seven tiles over three columns leaves the last one alone on its row —
// production pins Mekari Pay to the middle column so it sits centred under
// the grid instead of hanging off the left edge.
const centeredTileClass = css({ gridColumn: "2 / 3" });
</script>
