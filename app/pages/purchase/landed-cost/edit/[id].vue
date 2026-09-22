<template>
  <LandedCostForm :record-id="recordId" />
</template>

<script setup lang="ts">
import LandedCostForm from "~/components/purchase/LandedCostForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));

useHead({ title: "Edit landed cost — Mekari Jurnal" });
</script>
