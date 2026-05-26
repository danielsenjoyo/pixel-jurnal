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
    <span class="jurnal-notification-indicator" aria-hidden="true">9+</span>
  </div>
</template>

<script setup lang="ts">
import { css, MpButton, MpIcon, MpTooltip } from "@mekari/pixel3";

defineProps<{ iconClass?: string }>();

const wrapperClass = css({ position: "relative", display: "inline-flex" });
</script>

<style scoped>
.jurnal-notification-indicator {
  position: absolute;
  top: calc(var(--mp-spacing-1\.5) * -1);
  right: calc(var(--mp-spacing-3) * -1);
  min-width: var(--mp-spacing-6);
  height: var(--mp-spacing-4);
  padding: 0 var(--mp-spacing-1\.5);
  border-radius: var(--border-radius-full);
  background-color: var(--mp-colors-rose-400);
  color: var(--mp-colors-white);
  font-size: var(--mp-font-sizes-sm);
  font-weight: var(--mp-font-weights-semi-bold);
  line-height: var(--mp-line-heights-sm);
  text-align: center;
  pointer-events: none;
  box-shadow: var(--mp-shadows-xs);
}
</style>
