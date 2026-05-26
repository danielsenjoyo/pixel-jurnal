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
        transitionDuration: 'var(--motion-duration-slow)',
        transitionTimingFunction: 'var(--motion-ease-in-out)',
        zIndex: 'var(--z-sidebar)',
        borderLeftWidth: 'var(--border-width-default)',
        borderColor: 'gray.100',
        display: { base: 'none', md: 'block' },
        width: isSidebarChildCollapsed
          ? 'var(--spacing-md)'
          : 'var(--layout-submenu-width)',
        marginRight: isSidebarChildCollapsed
          ? 'var(--spacing-md)'
          : 'var(--border-width-default)',
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
            bottom: 'var(--spacing-xs)',
            left: 'calc(var(--spacing-md) * -1 - var(--border-width-default))',
            transitionProperty: 'all',
            transitionDuration: 'var(--motion-duration-slow)',
            transitionDelay: isSidebarChildCollapsed ? 'var(--motion-duration-slow)' : '0ms',
            transitionTimingFunction: 'var(--motion-ease-in-out)',
            opacity: isSidebarChildCollapsed ? '1' : '0',
            transform: isSidebarChildCollapsed
              ? 'translateX(var(--spacing-xl))'
              : 'translateX(calc(var(--spacing-md) * -1))'
          })
        "
      >
        <MpTooltip placement="right" label="View more (shift + C)" use-portal>
          <div
            :class="
              css({
                display: 'flex',
                width: 'var(--spacing-lg)',
                height: 'var(--spacing-2xl)',
                bg: 'white',
                borderWidth: 'var(--border-width-default)',
                borderColor: 'gray.100',
                borderRightRadius: 'var(--border-radius-full)',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: '1',
                pl: '1',
                shadow: 'md',
                transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)',
                _hover: { width: 'var(--spacing-2xl)', cursor: 'pointer' }
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
          transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)'
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
            transitionDuration: 'var(--motion-duration-slow)',
            transitionTimingFunction: 'var(--motion-ease-in-out)',
            width: isSidebarChildCollapsed
              ? 'var(--spacing-md)'
              : 'var(--layout-submenu-width)',
            borderRightWidth: 'var(--border-width-default)',
            borderRightColor: isSidebarChildCollapsed ? 'gray.100' : 'transparent',
            background: 'gray.25'
          })
        "
      >
        <!-- Items scroll container. Height = viewport - navbar - bottom action -->
        <ul
          :class="
            css({
              pt: 4,
              px: 2,
              width: 'full',
              height: 'calc(100vh - var(--pixel-navbar-height) - var(--spacing-4xl))',
              overflowY: 'auto',
              overflowX: 'hidden',
              transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)',
              opacity: isSidebarChildCollapsed ? '0' : '100',
              pointerEvents: isSidebarChildCollapsed ? 'none' : 'auto'
            })
          "
        >
          <slot />
        </ul>

        <!-- Collapse button (visible only when expanded) -->
        <div
          v-show="!isSidebarChildCollapsed"
          :class="
            css({
              display: 'flex',
              transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)',
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
                    transition: 'all var(--motion-duration-slow) var(--motion-ease-in-out)',
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
