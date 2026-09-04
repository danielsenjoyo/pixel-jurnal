<template>
  <MpInputGroup :size="size">
    <MpInputLeftAddon has-background>
      <MpText weight="semiBold">{{ symbol }}</MpText>
    </MpInputLeftAddon>
    <MpInput
      :model-value="displayValue"
      :is-disabled="isDisabled"
      :is-read-only="isReadOnly"
      @update:model-value="onInput"
      @blur="onBlur"
    />
  </MpInputGroup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { MpInput, MpInputGroup, MpInputLeftAddon, MpText } from "@mekari/pixel3";
import { currencySymbol, formatEditableAmount, parseEditableAmount } from "~/utils/currency";
import type { CurrencyCode } from "~/types/price-history";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    currency: CurrencyCode;
    size?: "sm" | "md";
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }>(),
  { size: "md", isDisabled: false, isReadOnly: false }
);

const emit = defineEmits<{ (e: "update:modelValue", value: number): void }>();

const symbol = computed(() => currencySymbol(props.currency));

// Local editable buffer — grouped digits while at rest, a plain numeric
// string while focused; reformatting/parsing happens on blur.
const raw = ref(formatEditableAmount(props.modelValue, props.currency));
watch(
  [() => props.modelValue, () => props.currency],
  ([value, currency]) => {
    raw.value = formatEditableAmount(value, currency);
  }
);

const displayValue = computed(() => raw.value);

function onInput(value: string | number) {
  raw.value = String(value ?? "");
}

function onBlur() {
  const safe = parseEditableAmount(raw.value);
  raw.value = formatEditableAmount(safe, props.currency);
  emit("update:modelValue", safe);
}
</script>
