<template>
  <!-- The details-page meta field (docs/patterns/details-page-format.md): a
       grey label over its value, in the same 3-column grid the invoice page
       uses. Labels match that page's line-items headers, so the line reads as
       the same row the reader just clicked from. -->
  <div :class="gridClass">
    <div :class="fieldClass">
      <MpText color="gray.600">Unit price on this document</MpText>
      <MpText weight="semiBold" color="dark">{{ formatMoney(price, currency) }}</MpText>
    </div>
    <div :class="fieldClass">
      <MpText color="gray.600">Qty</MpText>
      <MpText>{{ formatQty(qty) }}</MpText>
    </div>
    <div :class="fieldClass">
      <MpText color="gray.600">Units</MpText>
      <MpText>{{ unit }}</MpText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MpText, css } from "@mekari/pixel3";
import { formatMoney, formatQty } from "~/utils/currency";

defineProps<{
  price: number;
  currency: string;
  unit: string;
  qty: number;
}>();

const gridClass = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 });
const fieldClass = css({ display: "flex", flexDirection: "column", gap: 1, minWidth: "0" });
</script>
