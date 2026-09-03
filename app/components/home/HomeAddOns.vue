<template>
  <section :class="cardClass">
    <MpFlex justifyContent="space-between" alignItems="flex-end" gap="6" px="4" pt="4">
      <MpText size="h2" weight="semiBold" color="white" :class="titleClass">
        {{ tField(copy.addOnsTitle, "label") }}
      </MpText>
      <MpButton variant="secondary" @click="openMarketplace">
        {{ tField(copy.addOnsAction, "label") }}
      </MpButton>
    </MpFlex>

    <div :class="gridClass">
      <button
        v-for="addOn in addOns"
        :key="addOn.id"
        type="button"
        :class="tileClass"
        @click="openMarketplace"
      >
        <MpIcon :name="addOn.icon" size="md" color="blue.400" />
        <MpText size="label" weight="semiBold" color="dark">
          {{ tField(addOn, "label") }}
        </MpText>
        <MpText size="body-small" color="gray.600">
          {{ tField(addOn, "description") }}
        </MpText>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { css, MpButton, MpFlex, MpIcon, MpText } from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import { HOME_ADD_ONS as addOns, HOME_SECTION_COPY as copy, MARKETPLACE_URL } from "~/data/home";

const { tField } = useLanguage();

/**
 * Production opens a per-feature paywall modal keyed on the company's
 * package; with no billing state here, every card goes where the paywall's
 * own upgrade path ends — the Mekari Marketplace catalog.
 */
function openMarketplace() {
  window.open(MARKETPLACE_URL, "_blank", "noopener,noreferrer");
}

// Blue gradient card — production paints the same angle over a decorative
// PNG; the gradient alone carries it here.
const cardClass = css({
  width: "full",
  maxWidth: "776px",
  rounded: "md",
  overflow: "hidden",
  backgroundImage: "linear-gradient(340deg, #66CFFF 9.7%, #00A8FD 47.12%, #0087D9 84.53%)"
});

/** Keep the heading off the button so the two never collide mid-width. */
const titleClass = css({ maxWidth: "60%" });

const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 2,
  p: 4,
  "@media (max-width: 768px)": { gridTemplateColumns: "repeat(2, 1fr)" }
});

const tileClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 1,
  textAlign: "left",
  px: 3,
  py: 2,
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "sm",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  _hover: { borderColor: "blue.400", boxShadow: "md" }
});
</script>
