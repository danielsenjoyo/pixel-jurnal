<template>
  <MpText :as="as" :size="size" :weight="weight" :color="color">{{ formatted }}</MpText>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MpText } from "@mekari/pixel3";
import { formatMoney } from "~/utils/currency";
import type { CurrencyCode } from "~/types/price-history";

const props = withDefaults(
  defineProps<{
    amount: number;
    currency: CurrencyCode;
    as?: string;
    size?: string;
    weight?: string;
    color?: string;
  }>(),
  {
    as: "span",
    size: undefined,
    weight: undefined,
    color: undefined
  }
);

const formatted = computed(() => formatMoney(props.amount, props.currency));
</script>
