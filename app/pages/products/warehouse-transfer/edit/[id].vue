<template>
  <WarehouseTransferForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import WarehouseTransferForm from "~/components/products/WarehouseTransferForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
