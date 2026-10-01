<template>
  <div :class="paginationClass">
    <div :class="pagerLeftClass">
      <MpText size="body-small" color="gray.600">Rows per page</MpText>
      <MpPopover use-portal is-adaptive-width>
        <MpPopoverTrigger>
          <MpButton variant="ghost" size="sm" right-icon="chevrons-down">{{ perPage }}</MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent>
          <MpPopoverList>
            <MpPopoverListItem
              v-for="opt in PER_PAGE_OPTIONS"
              :key="opt"
              :is-active="perPage === opt"
              @click="$emit('update:perPage', opt)"
            >
              {{ opt }}
            </MpPopoverListItem>
          </MpPopoverList>
        </MpPopoverContent>
      </MpPopover>
      <MpText size="body-small" color="gray.600">
        Showing {{ rangeStart }}-{{ rangeEnd }} of {{ total }}
      </MpText>
    </div>

    <div :class="pagerRightClass">
      <div :class="pageJumpClass">
        <MpAutocomplete
          :class="pageJumpInnerClass"
          :data="pageOptions"
          :model-value="page"
          is-searchable
          is-full-width
          @change="$emit('jump', $event)"
        />
      </div>
      <MpText size="body-small" color="gray.600">of {{ pageCount }} page</MpText>
      <MpTooltip label="Previous page">
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="chevrons-left"
          :is-disabled="page <= 1"
          aria-label="Previous page"
          @click="$emit('update:page', page - 1)"
        />
      </MpTooltip>
      <MpTooltip label="Next page">
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="chevrons-right"
          :is-disabled="page >= pageCount"
          aria-label="Next page"
          @click="$emit('update:page', page + 1)"
        />
      </MpTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  css,
  MpAutocomplete,
  MpButton,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText,
  MpTooltip
} from "@mekari/pixel3";

/**
 * The report footer — the official Mekari pagination pattern
 * (`docs/patterns/Pagination.md`), extracted so all five report pages share
 * one copy. Purely presentational: the state lives in `useReportPaging`.
 *
 * Report page sizes start at 10, not the index page's 5 — a report is read in
 * bulk, and a 5-row page of a 100-row report is mostly footer.
 */
defineProps<{
  page: number;
  perPage: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  pageOptions: { label: string; value: number }[];
}>();

defineEmits<{
  "update:page": [value: number];
  "update:perPage": [value: number];
  jump: [option: { value?: number } | number];
}>();

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const paginationClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 3,
  py: 3
});
const pagerLeftClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const pagerRightClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
// 100px: the inner MpInput has an ~88px min-width, so a narrower wrapper would
// overflow and cover the "of N page" text.
const pageJumpClass = css({ width: "100px" });
const pageJumpInnerClass = css({ h: "7.5" });
</script>
