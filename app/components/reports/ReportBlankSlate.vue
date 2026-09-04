<template>
  <div :class="emptyStateClass">
    <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
    <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ title }}</MpText>
    <MpText size="body-small" color="gray.600" :class="emptyDescClass">{{ description }}</MpText>
    <MpButton v-if="canClear" variant="secondary" @click="$emit('clear')">Clear filters</MpButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpButton, MpText } from "@mekari/pixel3";

/**
 * A report's two empty states, in one block (`docs/patterns/BlankSlate.md`):
 * it hasn't been run yet, or it ran and matched nothing. Copy is verbatim from
 * production.
 *
 * The second state gets a **Clear filters** button whenever the drawer filter
 * is active — a staged drawer closes over its own criteria, so an empty table
 * would otherwise have no visible cause and no way out.
 */
const props = defineProps<{
  hasRun: boolean;
  /** Whether anything in the staged drawer is set — gates the Clear button. */
  isFilterActive?: boolean;
}>();

defineEmits<{ clear: [] }>();

const title = computed(() =>
  props.hasRun ? "There was no report data on this date/period" : "Report will appear here"
);
const description = computed(() =>
  props.hasRun
    ? "Recheck the filter or select another date/period."
    : "Select dates or period, then click the Filter button."
);
const canClear = computed(() => props.hasRun && Boolean(props.isFilterActive));

const emptyStateClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  py: 16,
  textAlign: "center"
});
// The illustration source is 1500×1250 (6:5); width controls the size.
const emptyIllustrationClass = css({ width: "180px", height: "auto", mb: 1 });
const emptyTitleClass = css({ fontSize: "lg" });
const emptyDescClass = css({ maxWidth: "320px" });
</script>
