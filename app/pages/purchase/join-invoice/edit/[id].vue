<template>
  <PurchaseJoinInvoiceForm :record-id="recordId" />
</template>

<script setup lang="ts">
import PurchaseJoinInvoiceForm from "~/components/purchase/PurchaseJoinInvoiceForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit join invoice — Mekari Jurnal" });
</script>
