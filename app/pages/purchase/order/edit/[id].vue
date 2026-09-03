<template>
  <PurchaseTransactionForm type="order" :record-id="recordId" />
</template>

<script setup lang="ts">
import PurchaseTransactionForm from "~/components/purchase/PurchaseTransactionForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit purchase order — Mekari Jurnal" });
</script>
