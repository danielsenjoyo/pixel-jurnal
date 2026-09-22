<template>
  <article :class="cardClass">
    <div>
      <MpFlex alignItems="center" gap="2" mb="1">
        <MpText size="h3" weight="semiBold" color="dark">
          {{ tField(report, "label") }}
        </MpText>
        <MpBadge v-if="report.isNew" for="additionalInformation" type="critical" size="sm">
          {{ tField(copy.newBadge, "label") }}
        </MpBadge>
        <!-- Stands in for production's Airene wordmark image (see data/reports.ts). -->
        <MpBadge v-if="report.airene" for="additionalInformation" type="information" size="sm">
          Airene
        </MpBadge>
      </MpFlex>
      <MpText size="body-small" color="gray.600">
        {{ tField(report, "description") }}
      </MpText>
    </div>

    <MpFlex gap="2" mt="4" alignItems="center">
      <MpButton variant="secondary" @click="navigateTo(`/reports/${report.slug}`)">
        {{ tField(copy.viewReport, "label") }}
      </MpButton>

      <!-- Production keeps the pre-redesign report reachable until its sunset
           date; the tooltip is the only place that date is stated. -->
      <MpTooltip
        v-if="report.hasLegacy"
        :id="`report-legacy-${report.slug}`"
        :label="tField(copy.legacyTooltip, 'label')"
      >
        <MpButton
          variant="ghost"
          right-icon="info"
          @click="navigateTo(`/reports/${report.slug}?legacy=true`)"
        >
          {{ tField(copy.viewOldReport, "label") }}
        </MpButton>
      </MpTooltip>
    </MpFlex>
  </article>
</template>

<script setup lang="ts">
import { MpBadge, MpButton, MpFlex, MpText, MpTooltip, css } from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import { REPORT_SECTION_COPY as copy, type ReportEntry } from "~/data/reports";

defineProps<{ report: ReportEntry }>();

const { tField } = useLanguage();

// Buttons pin to the bottom so every card in a row lines its CTA up, however
// many lines the description takes.
const cardClass = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "full",
  minWidth: 0
});
</script>
