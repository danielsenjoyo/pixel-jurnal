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
  top: -6px;
  right: -10px;
  min-width: 28px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  background-color: var(--mp-colors-red-400, #dc2626);
  color: var(--mp-colors-white, #ffffff);
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}
</style>
