<template>
  <StockAdjustmentForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import StockAdjustmentForm from "~/components/products/StockAdjustmentForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
