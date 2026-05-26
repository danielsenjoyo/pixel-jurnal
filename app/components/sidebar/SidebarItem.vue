<template>
  <component
    :is="props.as"
    :to="props.to"
    :href="props.href"
    :target="props.target"
    class="group"
    :class="parentClass"
    v-bind="$attrs"
  >
    <div :class="wrapperClass">
      <div :class="rootClass">
        <MpIcon
          :name="props.icon || 'empty'"
          :variant="isActive ? 'fill' : 'outline'"
          size="sm"
          :class="iconClass"
          :color="isActive ? 'blue.500' : 'gray.600'"
        />
        <MpText
          :class="labelClass"
          :weight="isActive ? 'semiBold' : 'regular'"
          :color="isActive ? 'blue.500' : 'dark'"
          :data-hide-label="props.isHideLabel || undefined"
        >
          {{ props.label }}
        </MpText>
      </div>

      <MpIcon
        v-if="props.isShowArrow"
        :class="arrowClass"
        :data-hide-arrow="props.isHideLabel || undefined"
        name="chevrons-right"
        size="sm"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component, PropType } from "vue";
import { useRoute } from "vue-router";
import type { IconName } from "@mekari/pixel3";
import { MpIcon, MpText, css } from "@mekari/pixel3";

const props = defineProps({
  as: {
    type: [String, Object] as PropType<Component | string>,
    default: "div"
  },
  to: String,
  href: String,
  target: String,
  isActive: Boolean,
  icon: String as PropType<IconName>,
  label: String,
  /** Trailing chevron — used by items that link outward (Applications). */
  isShowArrow: Boolean,
  /** Fade labels when the rail is collapsed and not hovered. */
  isHideLabel: Boolean
});

const currentRoute = useRoute();

const isActive = computed(
  () => props.isActive || (props.to ? currentRoute.path === props.to : false)
);

const parentClass = computed(() =>
  css({
    display: "flex",
    p: 2,
    rounded: "md",
    cursor: "pointer",
    transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s",
    // Active row gets the Blue/$blue-100 fill (Jurnal selected-nav recipe).
    backgroundColor: isActive.value ? "blue.50" : "transparent"
  })
);

const wrapperClass = css({
  display: "flex",
  width: "full",
  alignItems: "center",
  justifyContent: "space-between"
});

const rootClass = css({ display: "flex", alignItems: "center", gap: 2 });

const iconClass = css({ _groupHover: { color: "blue.500" } });

const labelClass = css({
  whiteSpace: "nowrap",
  opacity: 100,
  transition: "opacity 300ms",
  "&[data-hide-label=true]": { opacity: 0 },
  _groupHover: { color: "blue.500" }
});

const arrowClass = css({
  opacity: 100,
  transition: "opacity 300ms",
  "&[data-hide-arrow=true]": { opacity: 0 }
});
</script>
