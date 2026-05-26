<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePixelTheme } from "@mekari/pixel3";

const { setNextTheme, setDarkMode } = usePixelTheme();

// Mekari Jurnal targets Pixel 3 token mode 2.1 — keep `setNextTheme(false)`.
// Flip to `true` to opt into the 2.4 token surface (Qontak's default).
setNextTheme(false);
setDarkMode(false);
</script>
