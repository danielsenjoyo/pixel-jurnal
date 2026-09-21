<template>
  <MpText v-if="showNote" size="label-small" color="gray.600"
    >1 {{ unit }} = {{ factor }} {{ baseUnit }}</MpText
  >
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MpText } from "@mekari/pixel3";

const props = defineProps<{
  unit: string;
  factor: number;
  baseUnit: string;
}>();

// A "1 pcs = 1 pcs" note would be noise — only show when the purchase unit
// actually differs from the base unit.
const showNote = computed(() => props.unit !== props.baseUnit);
</script>
