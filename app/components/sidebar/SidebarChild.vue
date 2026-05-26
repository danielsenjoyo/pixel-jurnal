<template>
  <aside
    data-pixel-component="PixelSidebarChild"
    data-slot="root"
    :class="
      css({
        position: 'relative',
        flex: 'none',
        background: 'gray.25',
        transitionProperty: 'width, background, margin',
        transitionDuration: '600ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: '99',
        borderLeftWidth: '1px',
        borderColor: 'gray.100',
        display: { base: 'none', md: 'block' },
        width: isSidebarChildCollapsed ? '16px' : '212px',
        marginRight: isSidebarChildCollapsed ? '16px' : '1px',
        cursor: isSidebarChildCollapsed ? 'pointer' : 'default'
      })
    "
    v-bind="{
      ...(isSidebarChildCollapsed && {
        onClick: () => useSidebarChild.toggle()
      })
    }"
  >
    <!-- Expand pill (visible only when collapsed) -->
    <div :class="css({ position: 'fixed', height: '100vh' })">
      <div
        :class="
          css({
            position: 'absolute',
            bottom: '8px',
            left: '-17px',
            transitionProperty: 'all',
            transitionDuration: '300ms',
            transitionDelay: isSidebarChildCollapsed ? '300ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
            opacity: isSidebarChildCollapsed ? '1' : '0',
            transform: isSidebarChildCollapsed ? 'translateX(32px)' : 'translateX(-16px)'
          })
        "
      >
        <MpTooltip placement="right" label="View more (shift + C)" use-portal>
          <div
            :class="
              css({
                display: 'flex',
                width: '24px',
                height: '36px',
                bg: 'white',
                borderWidth: '1px',
                borderColor: 'gray.100',
                borderRightRadius: '999px',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: '1',
                pl: '1',
                shadow: 'rgb(0 0 0 / 14%) 3px 0px 4px, rgb(0 0 0 / 12%) 0px 0px 2px',
                transition: 'all 300ms cubic-bezier(.4,0,.2,1)',
                _hover: { width: '36px', cursor: 'pointer' }
              })
            "
          >
            <MpIcon name="chevrons-right" size="sm" />
          </div>
        </MpTooltip>
      </div>
    </div>

    <!-- Fixed content panel -->
    <div
      :class="
        css({
          position: 'fixed',
          display: 'flex',
          transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s'
        })
      "
    >
      <div
        :class="
          css({
            position: 'relative',
            display: 'block',
            height: '100vh',
            paddingTop: 'var(--pixel-navbar-height)',
            transitionProperty: 'width, background',
            transitionDuration: '600ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            width: isSidebarChildCollapsed ? '16px' : '212px',
            borderRightWidth: '1px',
            borderRightColor: isSidebarChildCollapsed ? 'gray.100' : 'transparent',
            background: 'gray.25'
          })
        "
      >
        <!-- Items scroll container -->
        <ul
          :class="
            css({
              pt: 4,
              px: 2,
              width: 'full',
              overflowY: 'auto',
              overflowX: 'hidden',
              transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isSidebarChildCollapsed ? '0' : '100',
              pointerEvents: isSidebarChildCollapsed ? 'none' : 'auto'
            })
          "
          :style="{ height: 'calc(100vh - var(--pixel-navbar-height) - 60px)' }"
        >
          <slot />
        </ul>

        <!-- Collapse button (visible only when expanded) -->
        <div
          v-show="!isSidebarChildCollapsed"
          :class="
            css({
              display: 'flex',
              transition: 'all .3s cubic-bezier(.4,0,.2,1)',
              gap: '2',
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              py: '3',
              px: '2',
              width: 'full',
              zIndex: 'sticky'
            })
          "
        >
          <div :class="css({ display: 'flex' })" @click="useSidebarChild.toggle()">
            <MpTooltip placement="right" label="View less (shift + C)" use-portal>
              <div
                :class="
                  css({
                    display: 'flex',
                    borderRadius: 'sm',
                    transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s',
                    padding: '2',
                    outline: 'none',
                    _hover: {
                      backgroundColor: 'gray.50',
                      color: 'blue.700',
                      cursor: 'pointer'
                    }
                  })
                "
              >
                <MpIcon name="chevrons-previous" size="sm" />
              </div>
            </MpTooltip>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { css, MpIcon, MpTooltip } from "@mekari/pixel3";
import { usePixelLayout } from "~/composables/usePixelLayout";

const { isSidebarChildCollapsed, useSidebarChild } = usePixelLayout();
</script>
