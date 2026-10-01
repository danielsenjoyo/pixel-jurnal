<template>
  <div :class="wrapClass">
    <!-- The estimate shows on hover, the standard MpTooltip trigger. The
         dashed underline is what discloses that there is something to hover.
         This comment sits outside MpTooltip on purpose — the tooltip takes
         exactly one child, and a comment node counts as one. -->
    <MpTooltip v-if="showEstimate" :label="estimateLabel" placement="left">
      <MpText weight="semiBold" :class="estimatePriceClass">{{ mainAmount }}</MpText>
    </MpTooltip>
    <MpText v-else weight="semiBold">{{ mainAmount }}</MpText>
    <MpText size="label-small" color="gray.600">for 1 {{ unit }}</MpText>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MpText, MpTooltip, css } from "@mekari/pixel3";
import { formatMoney, formatRate, historicalIdrEstimate } from "~/utils/currency";

const props = defineProps<{
  price: number;
  currency: string;
  unit: string;
  purchasedAtLabel: string;
  exchangeRateAtPurchase?: number;
}>();

const mainAmount = computed(() => formatMoney(props.price, props.currency));

// OD-005's one disclosed exception to "no currency conversion": a foreign
// price may show an IDR estimate, always at THAT transaction's own rate.
const showEstimate = computed(() => props.currency !== "IDR" && !!props.exchangeRateAtPurchase);

const estimateLabel = computed(() => {
  if (!props.exchangeRateAtPurchase) return "";
  const idr = historicalIdrEstimate(props.price, props.exchangeRateAtPurchase);
  return `≈ ${formatMoney(idr, "IDR")} at ${formatRate(props.exchangeRateAtPurchase)}/${props.currency} on ${props.purchasedAtLabel}`;
});

// nowrap: the cell around this wraps long text, and a money figure must never
// break mid-number ("Rp2.760.000," / "00").
const wrapClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5",
  whiteSpace: "nowrap"
});
const estimatePriceClass = css({
  cursor: "help",
  textDecoration: "underline",
  textDecorationStyle: "dashed",
  textDecorationColor: "gray.400",
  textUnderlineOffset: "3px"
});
</script>
