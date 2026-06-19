<template>
  <!-- Section title -->
  <MpFlex justify="space-between" alignItems="center" height="10">
    <MpText
      :class="css({ letterSpacing: 'widest', p: 2, textTransform: 'uppercase' })"
      size="label-small"
      weight="semiBold"
      color="blue.400"
    >
      {{ submenu ? tTitle(submenu) : "" }}
    </MpText>
  </MpFlex>

  <!-- Items -->
  <template v-if="submenu">
    <template v-for="item in submenu.items" :key="item.id">
      <SidebarChildItemAccordion
        v-if="item.children"
        :is-active="isRouteActive(item.route)"
        :default-is-open="isRouteActive(item.route)"
      >
        <template #header>{{ tLabel(item) }}</template>
        <template #content>
          <template v-for="child in item.children" :key="child.id">
            <!-- Subsection header (e.g. TEMPLATE EMAIL, PDF TEMPLATE, WHATSAPP) -->
            <MpText
              v-if="child.isSection"
              :class="sectionHeadingClass"
              size="label-small"
              weight="semiBold"
              color="gray.400"
            >
              {{ tLabel(child) }}
            </MpText>

            <SidebarChildItem
              v-else
              variant="accordionItem"
              :is-active="isChildActive(child)"
              :counter="child.count != null ? String(child.count) : undefined"
              @click="openItem(child)"
            >
              {{ tLabel(child) }}
            </SidebarChildItem>
          </template>
        </template>
      </SidebarChildItemAccordion>

      <SidebarChildItem
        v-else
        :is-active="isChildActive(item)"
        :counter="item.count != null ? String(item.count) : undefined"
        @click="openItem(item)"
      >
        {{ tLabel(item) }}
      </SidebarChildItem>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { css, MpFlex, MpText } from "@mekari/pixel3";
import { useAppMenu } from "~/composables/useAppMenu";
import SidebarChildItem from "~/components/sidebar/SidebarChildItem.vue";
import SidebarChildItemAccordion from "~/components/sidebar/SidebarChildItemAccordion.vue";
import type { AppMenuChild } from "~/data/menu";

const route = useRoute();
const router = useRouter();
const { activeSubmenu, getFirstChildRoute, isRouteActive, tLabel, tTitle } = useAppMenu();

const submenu = computed(() => activeSubmenu.value?.submenu ?? null);
const defaultChildId = computed(() => submenu.value?.items[0]?.id ?? null);

const sectionHeadingClass = css({
  px: 2,
  pt: 3,
  pb: 1,
  letterSpacing: "widest",
  textTransform: "uppercase"
});

function isChildActive(item: AppMenuChild): boolean {
  // When the user lands on the parent route (e.g. /fulfillment) without a
  // child segment, treat the first non-section child as active.
  const parentRoute = activeSubmenu.value?.route;
  if (parentRoute && route.path === parentRoute) {
    return item.id === defaultChildId.value;
  }
  return isRouteActive(item.route);
}

function openItem(item: AppMenuChild) {
  if (item.isSection || !item.route) return;
  if (item.newTab) {
    window.open(getFirstChildRoute(item), "_blank");
    return;
  }
  router.push(getFirstChildRoute(item));
}
</script>
