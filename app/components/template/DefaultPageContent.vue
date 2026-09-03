<template>
  <main data-pixel-component="PixelContent" :class="mainClass">
    <!-- Page title band (Figma node 1:16062) — transparent over the gray
         page shell. Title (with optional subtitle) on the left, #actions
         slot on the right. Falls back to `activePageTitle` from the menu
         so stub pages stay one-liners. -->
    <header :class="pageTitleClass">
      <div :class="titleColumnClass">
        <MpTextlink
          v-if="breadcrumb"
          as="a"
          variant="primary"
          :href="breadcrumbTo"
          :class="breadcrumbClass"
          @click.prevent="breadcrumbTo && navigateTo(breadcrumbTo)"
        >
          {{ breadcrumb }}
        </MpTextlink>
        <div :class="titleRowClass">
          <MpText as="h1" size="h1" weight="semiBold" color="dark">
            {{ resolvedTitle }}
          </MpText>
          <slot name="title-badge" />
        </div>
        <MpText v-if="resolvedSubtitle" size="body-small" color="gray.600">
          {{ resolvedSubtitle }}
        </MpText>
      </div>

      <div v-if="$slots.actions" :class="actionsClass">
        <slot name="actions" />
      </div>
    </header>

    <!-- Optional page-level tab bar, sits under the title on the gray shell
         (above the white PageStage). Opt-in via the #tabs slot. -->
    <div v-if="$slots.tabs" :class="tabsBandClass">
      <slot name="tabs" />
    </div>

    <!-- PageStage (Figma node 1:17750 → "PageStage" frame): white surface
         anchored top-left, 1px top + left border, rounded top-left only —
         no bottom/right edges, so the card visually bleeds to the viewport
         edges. Flex-fills the remaining height below the title band. -->
    <section :class="stageClass">
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MpText, MpTextlink, css } from "@mekari/pixel3";
import { useAppMenu } from "~/composables/useAppMenu";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  // Optional breadcrumb link above the title (e.g. "Purchases" → /purchase)
  // — for a details page one level under a list page. Omit both on a list
  // page itself.
  breadcrumb?: string;
  breadcrumbTo?: string;
}>();

const { activePageTitle } = useAppMenu();

const resolvedTitle = computed(() => props.title ?? activePageTitle.value ?? "");
const resolvedSubtitle = computed(() => props.subtitle ?? "");

// Main column — sits beside the sidebar and fills the remaining width.
// Pushed below the fixed navbar via paddingTop. flex-col + flex-1 on the
// stage lets it stretch to the viewport bottom.
const mainClass = css({
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  minWidth: 0,
  width: "full",
  paddingTop: "var(--pixel-navbar-height)",
  minHeight: "100svh"
});

const pageTitleClass = css({
  display: "flex",
  alignItems: "center",
  gap: 4,
  px: 6,
  py: 4,
  // minHeight, not height: a details page's optional breadcrumb line (see
  // `breadcrumb` prop) makes the title column taller than the standard
  // band — let it grow instead of clipping. Every page without a breadcrumb
  // still renders at exactly the standard height.
  minHeight: "var(--layout-page-title-height)",
  flexShrink: 0
});

const titleColumnClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 1,
  flex: "1 1 auto",
  minWidth: 0
});

const breadcrumbClass = css({ fontSize: "sm" });
const titleRowClass = css({ display: "flex", alignItems: "center", gap: 3 });

const actionsClass = css({
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexShrink: 0
});

// Page-level tab bar band — aligns with the title padding, sits on the gray
// shell. The tab list's full-width ::before bottom line is hidden, and its
// bottom padding + 24px bottom margin are removed, so the tabs sit flush against
// the stage. The library anchors the active indicator at bottom:-2px (to overlap
// the now-removed track), which tucks 1px under the stage — pin it to bottom:-1px
// so its full 2px sits flush on the stage's top edge.
const tabsBandClass = css({
  px: 6,
  flexShrink: 0,
  "& .mp-tab-list__root::before": { display: "none!" },
  "& .mp-tab-list__list": { paddingBottom: "0!", marginBottom: "0!" },
  "& .mp-tab-selected-border": { bottom: "-1px!" }
});

const stageClass = css({
  bg: "white",
  borderTopWidth: "sm",
  borderLeftWidth: "sm",
  borderColor: "gray.100",
  roundedTopLeft: "md",
  p: 6,
  flex: "1 1 auto",
  minHeight: "0"
});
</script>
