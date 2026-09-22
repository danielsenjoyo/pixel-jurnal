<template>
  <MpPopover placement="bottom-end" use-portal is-adaptive-width>
    <MpPopoverTrigger>
      <MpButton variant="secondary" right-icon="caret-down" :is-disabled="isDisabled">
        Export
      </MpButton>
    </MpPopoverTrigger>
    <MpPopoverContent>
      <MpPopoverList>
        <MpPopoverListItem
          v-for="format in EXPORT_FORMATS"
          :key="format"
          role="menuitem"
          @click="onExport(format)"
        >
          {{ format }}
        </MpPopoverListItem>
      </MpPopoverList>
    </MpPopoverContent>
  </MpPopover>
</template>

<script setup lang="ts">
import {
  MpButton,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  toast
} from "@mekari/pixel3";

/**
 * The Export ▾ menu every report carries. Production renders the file
 * server-side; there is no backend here, so this says what it *would* produce
 * rather than silently doing nothing — and it never hands over a download that
 * isn't real.
 *
 * Disabled until the report has been run: there is nothing to export before.
 */
const props = defineProps<{ isDisabled?: boolean; rowCount: number }>();

const EXPORT_FORMATS = ["PDF", "Excel", "CSV"] as const;

function onExport(format: (typeof EXPORT_FORMATS)[number]) {
  toast.notify({
    id: "report-export",
    position: "top-center",
    variant: "success",
    title: `${format} export of ${props.rowCount} rows would start here.`
  });
}
</script>
