<template>
  <aside
    ref="sidebarNode"
    data-pixel-component="TheSidebar"
    data-slot="root"
    :class="rootClass"
    :style="{
      width: isSidebarCollapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_EXPANDED_WIDTH}px`
    }"
  >
    <div
      data-slot="rootChild"
      :class="rootChildClass"
      :style="{ marginRight: `${SIDEBAR_COLLAPSED_WIDTH}px` }"
    >
      <div
        data-slot="menu"
        :class="menuClass"
        :style="{
          width:
            isSidebarCollapsed && !isSidebarHovered
              ? `${SIDEBAR_COLLAPSED_WIDTH}px`
              : `${SIDEBAR_EXPANDED_WIDTH}px`
        }"
        @mouseover="handleSidebarHover(true)"
        @mouseleave="handleSidebarHover(false)"
      >
        <ul
          class="sidebar-content"
          :class="mainMenuClass"
          :style="{
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            paddingBottom: `${SIDEBAR_BOTTOM_BAR_HEIGHT}px`
          }"
        >
          <template v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
            <li v-if="groupIndex > 0" :key="`divider-${groupIndex}`">
              <MpDivider />
            </li>

            <li v-for="menu in group" :key="menu.id">
              <SidebarItem
                as="RouterLink"
                :to="getFirstChildRoute(menu)"
                :label="menu.label"
                :icon="menu.icon"
                :is-active="isRouteActive(menu.route)"
                :is-show-arrow="Boolean(menu.isExternal)"
                :is-hide-label="isHideLabel()"
              />
            </li>
          </template>
        </ul>

        <div :class="bottomActionClass">
          <MpFlex alignItems="center" gap="2" overflow="hidden">
            <MpTooltip
              placement="right"
              use-portal
              :label="isSidebarCollapsed ? 'View more (shift + X)' : 'View less (shift + X)'"
            >
              <button
                class="group"
                :class="
                  css({
                    p: 2,
                    rounded: 'sm',
                    transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s',
                    cursor: 'pointer',
                    _hover: {
                      backgroundColor: 'gray.50',
                      color: 'blue.500'
                    }
                  })
                "
                @click="useSidebar.toggle()"
              >
                <MpIcon
                  :name="isSidebarCollapsed ? 'sidebar-show' : 'sidebar-hide'"
                  size="sm"
                  :class="css({ _groupHover: { color: 'blue.500' } })"
                />
              </button>
            </MpTooltip>

            <MpText
              size="body-small"
              :class="
                css({
                  whiteSpace: 'nowrap',
                  opacity: isSidebarCollapsed ? (isSidebarHovered ? '1' : '0') : '1'
                })
              "
            >
              Company ID : {{ accountInformation.companyId }}
            </MpText>
          </MpFlex>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpDivider, MpFlex, MpIcon, MpText, MpTooltip } from "@mekari/pixel3";
import {
  NAVBAR_HEIGHT,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_BOTTOM_BAR_HEIGHT
} from "~/data/constants";
import { usePixelLayout } from "~/composables/usePixelLayout";
import { useAppMenu } from "~/composables/useAppMenu";
import SidebarItem from "~/components/sidebar/SidebarItem.vue";

const props = defineProps({
  hasChild: { type: Boolean, default: false }
});

const {
  accountInformation,
  isSidebarCollapsed,
  isSidebarChildCollapsed,
  useSidebar,
  sidebarNode,
  isSidebarHovered,
  handleSidebarHover
} = usePixelLayout();

const { menuGroups, isRouteActive, getFirstChildRoute } = useAppMenu();

const isHideLabel = () => isSidebarCollapsed.value && !isSidebarHovered.value;

const rootClass = computed(() =>
  css({
    flex: "none",
    transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s",
    zIndex: "100",
    display: { base: "none", md: "block" },
    shadow:
      isSidebarChildCollapsed.value && props.hasChild
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        : "none"
  })
);

const rootChildClass = css({
  position: "fixed",
  display: "flex",
  transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s"
});

const menuClass = computed(() =>
  css({
    display: "block",
    paddingTop: "var(--pixel-navbar-height)",
    transitionProperty: "width, box-shadow",
    transitionDuration: "600ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    position: isSidebarCollapsed.value ? "relative" : "absolute",
    background: "gray.25",
    shadow: isSidebarCollapsed.value && isSidebarHovered.value ? "lg" : "none"
  })
);

const mainMenuClass = css({
  pt: 4,
  px: 2,
  width: "full",
  overflowY: "auto",
  overflowX: "hidden"
});

const bottomActionClass = css({
  position: "sticky",
  bottom: "0",
  left: "0",
  px: 2,
  py: 3,
  borderTopWidth: "1px",
  borderColor: "gray.100",
  background: "inherit",
  w: "full"
});
</script>

<style>
.sidebar-content::-webkit-scrollbar {
  width: 0px;
}
.sidebar-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}
.sidebar-content:hover::-webkit-scrollbar {
  width: 0px;
  position: absolute;
}
.sidebar-content:hover::-webkit-scrollbar-thumb {
  background: var(--colors-gray-400);
}
</style>
