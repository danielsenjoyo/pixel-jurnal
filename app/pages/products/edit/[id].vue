<template>
  <ProductForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProductForm from "~/components/products/ProductForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
