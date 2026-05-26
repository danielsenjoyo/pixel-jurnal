<template>
  <aside
    ref="sidebarNode"
    data-pixel-component="TheSidebar"
    data-slot="root"
    :class="rootClass"
  >
    <div data-slot="rootChild" :class="rootChildClass">
      <div data-slot="menu" :class="menuClass">
        <ul class="sidebar-content" :class="mainMenuClass">
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
                    transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)',
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
                  opacity: isSidebarCollapsed ? '0' : '1'
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
  sidebarNode
} = usePixelLayout();

const { menuGroups, isRouteActive, getFirstChildRoute } = useAppMenu();

// Collapsed rail never re-expands — including on hover. Label visibility
// is purely a function of the collapse flag.
const isHideLabel = () => isSidebarCollapsed.value;

const rootClass = computed(() =>
  css({
    flex: "none",
    transition: "all var(--motion-duration-slow) var(--motion-ease-in-out)",
    zIndex: "var(--z-sidebar)",
    display: { base: "none", md: "block" },
    width: isSidebarCollapsed.value
      ? "var(--layout-sidebar-collapsed-width)"
      : "var(--layout-sidebar-width)",
    shadow: isSidebarChildCollapsed.value && props.hasChild ? "lg" : "none"
  })
);

const rootChildClass = css({
  position: "fixed",
  display: "flex",
  marginRight: "var(--layout-sidebar-collapsed-width)",
  transition: "all var(--motion-duration-slow) var(--motion-ease-in-out)"
});

const menuClass = computed(() =>
  css({
    display: "block",
    paddingTop: "var(--pixel-navbar-height)",
    width: isSidebarCollapsed.value
      ? "var(--layout-sidebar-collapsed-width)"
      : "var(--layout-sidebar-width)",
    transitionProperty: "width",
    transitionDuration: "var(--motion-duration-slow)",
    transitionTimingFunction: "var(--motion-ease-in-out)",
    position: "relative",
    background: "gray.25"
  })
);

const mainMenuClass = css({
  pt: 4,
  px: 2,
  width: "full",
  // Reserve room for the sticky bottom action row (uses the same vertical
  // padding tokens as the row itself). 100vh - navbar = available height.
  height: "calc(100vh - var(--layout-header-height))",
  paddingBottom: "var(--spacing-4xl)",
  overflowY: "auto",
  overflowX: "hidden"
});

const bottomActionClass = css({
  position: "sticky",
  bottom: "0",
  left: "0",
  px: 2,
  py: 3,
  borderTopWidth: "var(--border-width-default)",
  borderColor: "gray.100",
  background: "inherit",
  w: "full"
});
</script>

<style>
.sidebar-content::-webkit-scrollbar {
  width: 0;
}
.sidebar-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: var(--border-radius-sm);
}
.sidebar-content:hover::-webkit-scrollbar {
  width: 0;
  position: absolute;
}
.sidebar-content:hover::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
}
</style>
