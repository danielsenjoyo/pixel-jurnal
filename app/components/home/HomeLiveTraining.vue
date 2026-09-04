<template>
  <MpFlex as="section" flexDirection="column" alignItems="center" gap="6" width="full">
    <MpFlex flexDirection="column" alignItems="center" gap="1">
      <MpText size="h2" weight="semiBold" color="dark">
        {{ tField(copy.trainingTitle, "label") }}
      </MpText>
      <MpText size="body" color="gray.600">
        {{ tField(copy.trainingSubtitle, "label") }}
      </MpText>
    </MpFlex>

    <div :class="gridClass">
      <div v-for="training in trainings" :key="training.id" :class="cardClass">
        <MpFlex flexDirection="column" alignItems="flex-start" gap="2">
          <MpIcon :name="training.icon" size="md" color="blue.400" />
          <MpText size="label" weight="semiBold" color="dark">
            {{ tField(training, "label") }}
          </MpText>

          <MpFlex v-for="row in scheduleRows(training)" :key="row.icon" alignItems="center" gap="1">
            <MpIcon :name="row.icon" size="sm" />
            <MpText size="body-small" color="gray.600">{{ row.label }}:</MpText>
            <MpText size="body-small" weight="semiBold" color="dark">{{ row.value }}</MpText>
          </MpFlex>
        </MpFlex>

        <MpFlex justifyContent="flex-end">
          <MpTextlink variant="primary" left-icon="newtab" @click="openTraining(training.url)">
            {{ tField(copy.trainingAction, "label") }}
          </MpTextlink>
        </MpFlex>
      </div>
    </div>
  </MpFlex>
</template>

<script setup lang="ts">
import type { IconName } from "@mekari/pixel3";
import { css, MpFlex, MpIcon, MpText, MpTextlink } from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import {
  HOME_SECTION_COPY as copy,
  HOME_TRAININGS as trainings,
  type HomeTraining
} from "~/data/home";

const { tField } = useLanguage();

/** Day / time / place, in production's order, each with its own icon. */
function scheduleRows(training: HomeTraining): { icon: IconName; label: string; value: string }[] {
  return [
    { icon: "calendar", label: tField(copy.trainingDay, "label"), value: tField(training, "day") },
    { icon: "time", label: tField(copy.trainingTime, "label"), value: training.time },
    {
      icon: "location",
      label: tField(copy.trainingPlace, "label"),
      value: tField(training, "place")
    }
  ];
}

function openTraining(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 4,
  width: "full",
  maxWidth: "776px",
  "@media (max-width: 768px)": { gridTemplateColumns: "1fr" }
});

// Column layout with the sign-up link pinned to the bottom, so two cards of
// unequal text length still line their links up.
const cardClass = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 4,
  px: 4,
  py: 3,
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "sm",
  transition: "box-shadow 0.2s ease",
  _hover: { borderColor: "blue.400", boxShadow: "md" }
});
</script>
