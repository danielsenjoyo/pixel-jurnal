<template>
  <div :class="itemClass">
    <MpText :class="css({ color: 'inherit', fontWeight: 'inherit', minWidth: '0' })">
      <slot />
    </MpText>
    <MpText v-if="counter" as="span" color="gray.600" :class="css({ marginLeft: '2' })">
      {{ counter }}
    </MpText>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import { MpText, css } from "@mekari/pixel3";

const props = defineProps({
  as: String,
  to: String,
  isActive: Boolean,
  variant: {
    type: String as PropType<"item" | "accordionItem">,
    default: "item"
  },
  counter: String
});

const itemClass = computed(() => {
  const v = props.variant || "item";
  const active = props.isActive;

  const base = {
    cursor: "pointer",
    flex: "1",
    borderRadius: "md",
    minHeight: "var(--layout-sidebar-item-height)",
    px: "2",
    py: "1.5",
    transitionProperty: "all",
    transitionDuration: "fast",
    transitionTimingFunction: "var(--motion-ease-in-out)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  } as const;

  if (v === "item" && !active) {
    return css({
      ...base,
      background: "transparent",
      color: "dark",
      fontWeight: "regular",
      _hover: { color: "blue.500" }
    });
  }
  if (v === "item" && active) {
    return css({
      ...base,
      background: "blue.50",
      color: "blue.500",
      fontWeight: "semiBold"
    });
  }
  if (v === "accordionItem" && !active) {
    return css({
      ...base,
      background: "transparent",
      color: "gray.600",
      fontWeight: "regular",
      _hover: { color: "blue.500" }
    });
  }
  // accordionItem + active
  return css({
    ...base,
    background: "transparent",
    color: "dark",
    fontWeight: "semiBold"
  });
});
</script>
