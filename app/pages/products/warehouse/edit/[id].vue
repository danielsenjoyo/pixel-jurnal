<template>
  <WarehouseForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import WarehouseForm from "~/components/products/WarehouseForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
