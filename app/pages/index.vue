<template>
  <DefaultPageContent title="Master template">
    <template #actions>
      <MpButton variant="secondary" right-icon="chevrons-down" aria-haspopup="menu">
        More
      </MpButton>
      <MpButton variant="secondary">Label</MpButton>
      <MpButton variant="primary">Label</MpButton>
    </template>

    <div :class="emptyClass">
      <MpText :class="hintClass" color="gray.600">
        This is the <strong>master template</strong> — duplicate
        <code :class="codeClass">app/pages/index.vue</code> as the starting point for new Jurnal
        screens. The navbar, sidebar, and stage already follow the Pixel 3 specification (Design
        Tokens v2.1).
      </MpText>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { css, MpButton, MpText } from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";

useHead({ title: "Master template — Mekari Jurnal" });

const emptyClass = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "full",
  py: 8
});

const hintClass = css({ maxWidth: "560px", textAlign: "center" });

const codeClass = css({
  px: 1,
  py: "0.5",
  fontFamily: "mono",
  fontSize: "sm",
  bg: "gray.25",
  rounded: "sm",
  color: "dark"
});
</script>
