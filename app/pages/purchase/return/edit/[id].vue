<template>
  <PurchaseReturnForm :record-id="recordId" />
</template>

<script setup lang="ts">
import PurchaseReturnForm from "~/components/purchase/PurchaseReturnForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit purchase return — Mekari Jurnal" });
</script>
