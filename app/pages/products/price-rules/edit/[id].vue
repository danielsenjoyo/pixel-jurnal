<template>
  <PriceRuleForm :record-id="recordId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import PriceRuleForm from "~/components/products/PriceRuleForm.vue";

const route = useRoute();
const recordId = computed(() => Number(route.params.id));
</script>
