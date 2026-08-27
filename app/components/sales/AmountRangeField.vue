<!--
  Amount-range field: More than / In between / Less than operator radios
  + 1-2 sanitized numeric inputs. Used twice in SalesAdvancedFilterDrawer
  (Balance due, Total) — see docs/patterns/AdvancedFilter.md.
-->
<script setup lang="ts">
import { computed } from "vue";
import { MpFormControl, MpFormLabel, MpInput, MpRadio, MpText, css } from "@mekari/pixel3";
import type { AmountMode } from "~/data/sales";

const props = defineProps<{
  /** Unique per instance so the two radio groups (Balance due, Total) don't cross-select. */
  name: string;
  label: string;
}>();

const mode = defineModel<AmountMode>("mode", { required: true });
const a = defineModel<string>("a", { required: true });
const b = defineModel<string>("b", { required: true });

const OPERATORS: { value: AmountMode; label: string }[] = [
  { value: "more", label: "More than" },
  { value: "less", label: "Less than" },
  { value: "between", label: "In between" }
];

function onAInput(value: string) {
  a.value = sanitizeAmountInput(value);
}
function onBInput(value: string) {
  b.value = sanitizeAmountInput(value);
}

const fieldClass = css({ display: "flex", flexDirection: "column", gap: 3 });
const radiosClass = css({ display: "flex", gap: 4, flexWrap: "wrap" });
const radioLabelClass = css({ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" });
const inputsRowClass = computed(() => css({ display: "flex", alignItems: "center", gap: 2 }));
</script>

<template>
  <MpFormControl :class="fieldClass">
    <MpFormLabel>{{ props.label }}</MpFormLabel>
    <div :class="radiosClass">
      <label v-for="op in OPERATORS" :key="op.value" :class="radioLabelClass">
        <MpRadio v-model="mode" :name="props.name" :value="op.value" />
        <MpText size="body-small">{{ op.label }}</MpText>
      </label>
    </div>
    <div :class="inputsRowClass">
      <MpInput :model-value="a" placeholder="0" is-full-width @update:model-value="onAInput" />
      <template v-if="mode === 'between'">
        <MpText color="gray.400">-</MpText>
        <MpInput :model-value="b" placeholder="0" is-full-width @update:model-value="onBInput" />
      </template>
    </div>
  </MpFormControl>
</template>
