<template>
  <!-- Create route: renders the shared form bare. Its edit twin
       (app/pages/products/edit/[id].vue) passes a record id and nothing else
       differs — see docs/patterns/form-page-format.md. -->
  <ProductForm />
</template>

<script setup lang="ts">
import ProductForm from "~/components/products/ProductForm.vue";
</script>
