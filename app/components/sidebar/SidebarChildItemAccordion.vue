<template>
  <div
    :class="
      css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 'md',
        p: '2',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0s',
        background: props.isActive ? 'blue.50' : 'transparent',
        color: props.isActive ? 'blue.500' : 'dark',
        fontWeight: props.isActive ? 'semiBold' : 'regular',
        _hover: { color: 'blue.500', cursor: 'pointer' }
      })
    "
    @click="onToggle"
  >
    <MpText
      :class="
        css({
          whiteSpace: 'nowrap',
          color: 'inherit',
          lineHeight: '3xl',
          fontWeight: props.isActive ? 'semiBold' : 'regular'
        })
      "
    >
      <slot name="header" />
    </MpText>

    <MpIcon
      :name="isOpen ? 'caret-down' : 'caret-right'"
      size="sm"
    />
  </div>

  <MpCollapse :is-open="isOpen">
    <slot name="content" />
  </MpCollapse>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MpCollapse, MpIcon, MpText, css } from "@mekari/pixel3";

const props = defineProps({
  as: String,
  to: String,
  isActive: Boolean,
  defaultIsOpen: Boolean
});

const isOpen = ref(props.defaultIsOpen || false);

function onToggle() {
  isOpen.value = !isOpen.value;
}
</script>
