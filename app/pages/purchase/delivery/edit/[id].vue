<template>
  <PurchaseDeliveryForm :record-id="recordId" />
</template>

<script setup lang="ts">
import PurchaseDeliveryForm from "~/components/purchase/PurchaseDeliveryForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit purchase delivery — Mekari Jurnal" });
</script>
