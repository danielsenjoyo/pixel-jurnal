<template>
  <ProductMasterForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProductMasterForm from "~/components/products/ProductMasterForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
