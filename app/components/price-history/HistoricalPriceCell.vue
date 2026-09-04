<template>
  <div :class="wrapClass">
    <MpTooltip v-if="showEstimate" :label="estimateLabel" is-manual :is-open="isTipOpen" placement="left">
      <button type="button" :class="priceButtonClass" @click="isTipOpen = !isTipOpen">
        <MpText weight="semiBold">{{ mainAmount }}</MpText>
      </button>
    </MpTooltip>
    <MpText v-else weight="semiBold">{{ mainAmount }}</MpText>
    <MpText size="caption" color="gray.600">for 1 {{ unit }}</MpText>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MpText, MpTooltip, css } from "@mekari/pixel3";
import { formatMoney, formatRate, historicalIdrEstimate } from "~/utils/currency";

const props = defineProps<{
  price: number;
  currency: string;
  unit: string;
  purchasedAtLabel: string;
  exchangeRateAtPurchase?: number;
}>();

const isTipOpen = ref(false);

const mainAmount = computed(() => formatMoney(props.price, props.currency));

// OD-005's one disclosed exception to "no currency conversion": a foreign
// price may show an IDR estimate, always at THAT transaction's own rate.
const showEstimate = computed(() => props.currency !== "IDR" && !!props.exchangeRateAtPurchase);

const estimateLabel = computed(() => {
  if (!props.exchangeRateAtPurchase) return "";
  const idr = historicalIdrEstimate(props.price, props.exchangeRateAtPurchase);
  return `≈ ${formatMoney(idr, "IDR")} at ${formatRate(props.exchangeRateAtPurchase)}/${props.currency} on ${props.purchasedAtLabel}`;
});

const wrapClass = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5" });
const priceButtonClass = css({
  border: "0",
  bg: "transparent",
  p: 0,
  cursor: "help",
  textDecoration: "underline",
  textDecorationStyle: "dashed",
  textDecorationColor: "gray.400",
  textUnderlineOffset: "3px"
});
</script>
