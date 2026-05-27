<template>
  <div :class="wrapperClass">
    <MpTooltip placement="bottom" use-portal label="Notifications">
      <MpButton variant="ghost" size="md" icon-only aria-label="Notifications" :class="iconClass">
        <MpIcon name="notification" size="md" />
      </MpButton>
    </MpTooltip>
    <!--
      Red pill notification indicator floating top-right of the bell. No
      tail/notch — the badge is a clean rounded pill.
    -->
    <span :class="indicatorClass" aria-hidden="true">9+</span>
  </div>
</template>

<script setup lang="ts">
import { css, MpButton, MpIcon, MpTooltip } from "@mekari/pixel3";

defineProps<{ iconClass?: string }>();

const wrapperClass = css({ position: "relative", display: "inline-flex" });

// Pill badge — all values resolve to Pixel tokens via Panda shortcuts.
// Negative offsets use Panda's negative-token syntax (`-1.5` → -6px).
// `--border-radius-full` is the project-local stadium-pill radius (Pixel's
// `radii.full` is 50% / ellipse). minWidth + height map to the sizes scale.
const indicatorClass = css({
  position: "absolute",
  top: "-1.5",
  right: "-3",
  minWidth: "6",
  height: "4",
  px: "1.5",
  borderRadius: "var(--border-radius-full)",
  bg: "rose.400",
  color: "white",
  fontSize: "sm",
  fontWeight: "semiBold",
  lineHeight: "sm",
  textAlign: "center",
  pointerEvents: "none",
  boxShadow: "xs"
});
</script>
