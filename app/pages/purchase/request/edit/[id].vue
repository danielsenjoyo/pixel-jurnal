<template>
  <PurchaseRequestForm :record-id="recordId" />
</template>

<script setup lang="ts">
import PurchaseRequestForm from "~/components/purchase/PurchaseRequestForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit purchase request — Mekari Jurnal" });
</script>
