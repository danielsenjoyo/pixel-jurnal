<template>
  <MpPopover placement="bottom-end" use-portal>
    <template #default="popover">
      <MpPopoverTrigger>
        <button
          class="group"
          :class="chipClass"
          type="button"
          aria-label="User profile"
          aria-haspopup="menu"
        >
          <MpAvatar
            :class="avatarClass"
            :src="accountInformation.userPhoto"
            :alt="accountInformation.fullName"
            size="md"
          />
          <span :class="labelClass">
            <MpText weight="semiBold" color="dark">
              {{ accountInformation.fullName }}
            </MpText>
            <MpText size="body-small" color="gray.600">
              {{ accountInformation.companyName }}
            </MpText>
          </span>
        </button>
      </MpPopoverTrigger>

      <MpPopoverContent>
        <slot :on-close-popover="popover.onClosePopover" />
      </MpPopoverContent>
    </template>
  </MpPopover>
</template>

<script setup lang="ts">
import {
  css,
  MpAvatar,
  MpPopover,
  MpPopoverContent,
  MpPopoverTrigger,
  MpText
} from "@mekari/pixel3";
import { usePixelLayout } from "~/composables/usePixelLayout";

const { accountInformation } = usePixelLayout();

const chipClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  pl: 1,
  pr: 2,
  py: 1,
  rounded: "md",
  border: "0",
  bg: "transparent",
  cursor: "pointer",
  _hover: { backgroundColor: "gray.50" }
});

/** Navbar avatar: 32×32 override via `--spacing-xl` (MpAvatar `md` is 24, `lg` is 36). */
const avatarClass = css({
  width: "var(--mp-spacing-8) !important",
  height: "var(--mp-spacing-8) !important"
});

const labelClass = css({
  display: "inline-flex",
  flexDirection: "column",
  textAlign: "left",
  whiteSpace: "nowrap"
});
</script>
