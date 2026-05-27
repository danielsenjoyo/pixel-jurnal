<template>
  <MpPopover placement="bottom-start" use-portal>
    <!--
      MpPopoverTrigger requires exactly ONE child VNode (and HTML comments
      count). Wrap in a plain div so the trigger's onClick + ref bind to a
      real DOM element; if MpTooltip is the direct child its rootAttrs are
      merged into the tooltip wrapper and never reach the rendered button.
    -->
    <MpPopoverTrigger
      ><div :class="triggerWrapperClass">
        <MpTooltip placement="bottom" use-portal label="Quick access"
          ><MpButton
            variant="ghost"
            size="md"
            icon-only
            aria-label="Quick access"
            :class="iconClass"
            ><MpIcon name="add" size="md" /></MpButton
        ></MpTooltip></div
    ></MpPopoverTrigger>

    <MpPopoverContent>
      <div :class="panelClass">
        <MpText :class="headingClass" size="overline"> BUAT/TAMBAH </MpText>
        <NuxtLink
          v-for="item in QUICK_ACCESS_ITEMS"
          :key="item.id"
          :to="item.route"
          :class="itemClass"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </MpPopoverContent>
  </MpPopover>
</template>

<script setup lang="ts">
import {
  css,
  MpButton,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverTrigger,
  MpText,
  MpTooltip
} from "@mekari/pixel3";

defineProps<{ iconClass?: string }>();

const triggerWrapperClass = css({ display: "inline-flex" });

/** Quick access items per Figma master template (Indonesian). */
const QUICK_ACCESS_ITEMS = [
  { id: "penagihan-penjualan", label: "Penagihan penjualan", route: "/sales" },
  { id: "faktur-pembelian", label: "Faktur pembelian", route: "/purchase" },
  { id: "biaya", label: "Biaya", route: "/expenses" },
  { id: "kontak", label: "Kontak", route: "/contacts" },
  { id: "produk", label: "Produk", route: "/products" },
  { id: "gudang", label: "Gudang", route: "/fulfillment" }
];

const panelClass = css({
  display: "flex",
  flexDirection: "column",
  py: 4,
  minWidth: "240px",
  bg: "dark",
  rounded: "md",
  shadow: "lg"
});

const headingClass = css({
  px: 4,
  pb: 2,
  letterSpacing: "widest",
  color: "gray.400"
});

const itemClass = css({
  px: 4,
  py: 2,
  color: "white",
  fontSize: "md",
  lineHeight: "lg",
  _hover: { backgroundColor: "gray.600" }
});
</script>
