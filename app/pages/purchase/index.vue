<template>
  <DefaultPageContent>
    <div :class="launcherClass">
      <MpText size="body-small" color="gray.600">
        Purchase Price History prototype — jump straight to a screen:
      </MpText>
      <div :class="linksClass">
        <MpButton variant="secondary" left-icon="doc" @click="navigateTo('/purchase/invoices/PI-2026-0771')">
          Draft review (read-only)
        </MpButton>
        <MpButton variant="primary" left-icon="add" @click="navigateTo('/purchase/invoices/new')">
          Create purchase invoice
        </MpButton>
      </div>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { MpButton, MpText, css } from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";

const launcherClass = css({ display: "flex", flexDirection: "column", gap: 3, py: 8, alignItems: "center" });
const linksClass = css({ display: "flex", gap: 3 });
</script>
