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
  top: calc(var(--spacing-2xs) * -1);
  right: calc(var(--spacing-sm) * -1);
  min-width: var(--spacing-lg);
  height: var(--spacing-md);
  padding: 0 var(--spacing-2xs);
  border-radius: var(--border-radius-full);
  background-color: var(--color-status-danger);
  color: var(--color-text-inverse);
  font-size: var(--font-size-label-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label-sm);
  text-align: center;
  pointer-events: none;
  box-shadow: var(--shadow-sm);
}
</style>
