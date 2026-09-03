<template>
  <MpFlex as="section" flexDirection="column" gap="2" width="full" maxWidth="776px">
    <MpFlex justifyContent="space-between" alignItems="center">
      <MpText size="h2" weight="semiBold" color="dark">
        {{ tField(copy.highlightsTitle, "label") }}
      </MpText>
      <MpTooltip id="tooltip-close-highlight" :label="tField(copy.closeHighlight, 'label')">
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="close"
          :aria-label="tField(copy.closeHighlight, 'label')"
          @click="dismiss"
        />
      </MpTooltip>
    </MpFlex>

    <div :class="carouselShellClass">
      <MpCarousel
        id="home-highlight-carousel"
        :active="activeIndex"
        :auto-play-timeout="10000"
        indicator-variant="dot"
        indicator-position="center"
        :is-show-button-nav="false"
        :class="carouselClass"
        @change="handleChange"
      >
        <MpCarouselItem v-for="highlight in highlights" :key="highlight.id" :class="slideClass">
          <MpFlex justifyContent="space-between" alignItems="center" gap="6" height="full">
            <MpFlex flexDirection="column" alignItems="flex-start" gap="3">
              <MpText size="body" weight="semiBold" color="dark">
                {{ tField(highlight, "label") }}
              </MpText>
              <MpTextlink
                variant="primary"
                right-icon="arrows-right"
                @click="navigateTo(highlight.route)"
              >
                {{ tField(highlight, "action") }}
              </MpTextlink>
            </MpFlex>
            <MpIcon :name="highlight.icon" size="48px" color="blue.400" />
          </MpFlex>
        </MpCarouselItem>
      </MpCarousel>

      <button
        type="button"
        :class="[navButtonClass, navPrevClass]"
        :aria-label="`${tField(copy.highlightsTitle, 'label')} — previous`"
        @click="step(-1)"
      >
        <MpIcon name="chevrons-left" size="sm" />
      </button>
      <button
        type="button"
        :class="[navButtonClass, navNextClass]"
        :aria-label="`${tField(copy.highlightsTitle, 'label')} — next`"
        @click="step(1)"
      >
        <MpIcon name="chevrons-right" size="sm" />
      </button>
    </div>
  </MpFlex>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  css,
  toast,
  MpButton,
  MpCarousel,
  MpCarouselItem,
  MpFlex,
  MpIcon,
  MpText,
  MpTextlink,
  MpTooltip
} from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import { HOME_HIGHLIGHTS as highlights, HOME_SECTION_COPY as copy } from "~/data/home";

const emit = defineEmits<{ dismiss: [] }>();

const { tField } = useLanguage();

const activeIndex = ref(0);

function handleChange(index: number) {
  activeIndex.value = index;
}

/** Wrap in both directions — the carousel itself loops, so the arrows must too. */
function step(delta: number) {
  const count = highlights.length;
  activeIndex.value = (activeIndex.value + delta + count) % count;
}

/**
 * Production persists the dismissal to localStorage and re-shows the section
 * on next sign-in; the toast says as much. The prototype keeps it in memory
 * only, so a reload brings it back — which matches what the toast promises.
 */
function dismiss() {
  emit("dismiss");
  // `bottom-center`, not production's top position: this shell's navbar is
  // fixed and paints over the viewport's top edge, so a top-anchored toast
  // renders underneath it. Any toast added to this app has the same problem.
  toast.notify({
    id: "toast-highlight-closed",
    position: "bottom-center",
    variant: "success",
    title: tField(copy.highlightsClosed, "label")
  });
}

// The arrows sit outside the slide, vertically centred on it — hence a
// positioned shell around the carousel.
const carouselShellClass = css({ position: "relative", width: "full" });

const carouselClass = css({
  width: "full",
  border: "none",
  bg: "transparent"
});

const slideClass = css({
  width: "full",
  height: "160px",
  px: 6,
  py: 4,
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "sm"
});

const navButtonClass = css({
  position: "absolute",
  top: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "36px",
  width: "36px",
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "full",
  boxShadow: "md",
  cursor: "pointer",
  _hover: { borderColor: "blue.400" }
});

// Fully outside the slide — an arrow overlapping the card edge reads as
// part of the card.
const navPrevClass = css({ left: "-44px" });
const navNextClass = css({ right: "-44px" });
</script>
