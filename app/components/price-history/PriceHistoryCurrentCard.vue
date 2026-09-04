<template>
  <div :class="cardClass">
    <div :class="topRowClass">
      <MpBadge for="additionalInformation" type="information">this document, current</MpBadge>
      <MpText weight="semiBold">{{ formatMoney(price, currency) }}</MpText>
    </div>
    <MpText size="body-small" color="gray.600">
      for 1 {{ unit }} · {{ formatQty(qty) }} {{ unit }} on this document
    </MpText>
    <MpText size="caption" color="gray.600">
      This is the price already entered on this line. Nothing on this screen can change it.
    </MpText>
  </div>
</template>

<script setup lang="ts">
import { MpBadge, MpText, css } from "@mekari/pixel3";
import { formatMoney, formatQty } from "~/utils/currency";
import type { CurrencyCode, UnitCode } from "~/types/price-history";

defineProps<{
  price: number;
  currency: CurrencyCode;
  unit: UnitCode;
  qty: number;
}>();

const cardClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 1,
  bg: "blue.50",
  borderWidth: "sm",
  borderColor: "blue.100",
  rounded: "md",
  p: 3
});
const topRowClass = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 });
</script>
