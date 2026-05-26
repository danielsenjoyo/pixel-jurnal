<template>
  <TheNavbar />
  <!-- Page shell + sidebar + title band all share `gray.25` (#F8F9FB).
       The white PageStage card sits on top, separated by `gray.100` border. -->
  <div :class="css({ bg: 'gray.25', minH: '100vh', display: 'flex' })">
    <TheSidebar :has-child="hasSidebarChild" />
    <SidebarChild v-if="hasSidebarChild">
      <SidebarChildItems />
    </SidebarChild>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { css } from "@mekari/pixel3";
import { usePixelLayout } from "~/composables/usePixelLayout";
import { useAppMenu } from "~/composables/useAppMenu";
import TheNavbar from "~/components/navbar/index.vue";
import TheSidebar from "~/components/sidebar/index.vue";
import SidebarChild from "~/components/sidebar/SidebarChild.vue";
import SidebarChildItems from "~/components/sidebar/SidebarChildItems.vue";

const { useSidebar } = usePixelLayout();
const { activeSubmenu } = useAppMenu();

/** When the active top-menu owns a submenu, render the SidebarChild panel
 *  and force the main rail to collapse. */
const hasSidebarChild = computed(() => Boolean(activeSubmenu.value));

watch(
  hasSidebarChild,
  (value) => {
    useSidebar.setCollapse(value);
  },
  { immediate: true }
);
</script>
