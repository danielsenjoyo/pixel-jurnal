<!--
  Searchable multi-select with chip display, wrapping MpInputTag. Used twice
  in SalesAdvancedFilterDrawer (Additional tag, Warehouse) — see
  docs/patterns/AdvancedFilter.md. Typing narrows the suggestion list without
  altering existing selections; chips are removed via their own close (x).
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { MpFormControl, MpFormLabel, MpInputTag, MpRadio, MpText, css } from "@mekari/pixel3";
import type { DataInterface } from "@mekari/pixel3-input-tag";

const props = withDefaults(
  defineProps<{
    label: string;
    options: string[];
    placeholder?: string;
    /** Only Additional tag shows the All tags / Either toggle — Warehouse is OR-only. */
    withModeToggle?: boolean;
  }>(),
  { placeholder: "Search…", withModeToggle: false }
);

const selected = defineModel<string[]>({ required: true });
const mode = defineModel<"all" | "any">("mode", { default: "all" });

const data = computed<DataInterface[]>(() =>
  selected.value.map((value) => ({
    id: value,
    text: value,
    value,
    isInvalid: false,
    isReadOnly: false
  }))
);

// Let MpInputTag filter its own suggestions as the user types (small, static
// option lists here — no need for isManualFilter's server-driven-search mode,
// which also leaves the typed text behind after a selection).
const suggestions = computed(() => props.options.filter((o) => !selected.value.includes(o)));

// MpInputTag keeps its own internal typed-text state and doesn't clear it
// after a suggestion click (only after creating a free tag) — remounting via
// a bumped :key resets that internal state cleanly after every selection.
const remountKey = ref(0);

function onSelect(item: unknown) {
  const value =
    typeof item === "string"
      ? item
      : ((item as { value?: string; text?: string })?.value ?? (item as { text?: string })?.text);
  if (value && !selected.value.includes(value)) selected.value = [...selected.value, value];
  remountKey.value++;
}
function onClickTag(item: unknown) {
  const value =
    typeof item === "string"
      ? item
      : ((item as { value?: string; text?: string })?.value ?? (item as { text?: string })?.text);
  if (value) selected.value = selected.value.filter((v) => v !== value);
}
function onClear() {
  selected.value = [];
}

const fieldClass = css({ display: "flex", flexDirection: "column", gap: 2 });
const radiosClass = css({ display: "flex", gap: 4, flexWrap: "wrap", mt: 1 });
const radioLabelClass = css({ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" });
</script>

<template>
  <MpFormControl :class="fieldClass">
    <MpFormLabel>{{ props.label }}</MpFormLabel>
    <MpInputTag
      :key="remountKey"
      :data="data"
      :suggestions="suggestions"
      is-show-suggestions
      :placeholder="props.placeholder"
      @select="onSelect"
      @click-tag="onClickTag"
      @clear="onClear"
    />
    <div v-if="props.withModeToggle" :class="radiosClass">
      <label :class="radioLabelClass">
        <MpRadio v-model="mode" name="tagMode" value="all" />
        <MpText size="body-small">All tags</MpText>
      </label>
      <label :class="radioLabelClass">
        <MpRadio v-model="mode" name="tagMode" value="any" />
        <MpText size="body-small">Either</MpText>
      </label>
    </div>
  </MpFormControl>
</template>
