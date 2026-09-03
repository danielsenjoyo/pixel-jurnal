<template>
  <MpFlex as="section" flexDirection="column" gap="4" width="full" maxWidth="776px">
    <MpText size="h2" weight="semiBold" color="dark">
      {{ tField(copy.optimizeTitle, "label") }}
    </MpText>

    <div :class="carouselShellClass">
      <MpCarousel
        id="home-optimize-carousel"
        :active="activeIndex"
        :auto-play-timeout="10000"
        indicator-variant="dot"
        indicator-position="center"
        :is-show-button-nav="false"
        :class="carouselClass"
        @change="handleChange"
      >
        <MpCarouselItem v-for="(slide, index) in slides" :key="index" :class="slideClass">
          <div :class="gridClass">
            <button
              v-for="app in slide"
              :key="app.id"
              type="button"
              :class="cardClass"
              @click="open(app)"
            >
              <MpIcon :name="app.icon" size="md" />
              <MpText size="label" weight="semiBold" color="dark">{{ app.name }}</MpText>
              <MpText size="body-small" color="gray.600">{{ tField(app, "label") }}</MpText>
              <MpText size="body-small" color="blue.400" is-text-link>
                {{ tField(copy.optimizeAction, "label") }} {{ app.name }}
              </MpText>
            </button>
          </div>
        </MpCarouselItem>
      </MpCarousel>

      <button
        type="button"
        :class="[navButtonClass, navPrevClass]"
        :aria-label="`${tField(copy.optimizeTitle, 'label')} — previous`"
        @click="step(-1)"
      >
        <MpIcon name="chevrons-left" size="sm" />
      </button>
      <button
        type="button"
        :class="[navButtonClass, navNextClass]"
        :aria-label="`${tField(copy.optimizeTitle, 'label')} — next`"
        @click="step(1)"
      >
        <MpIcon name="chevrons-right" size="sm" />
      </button>
    </div>
  </MpFlex>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { css, MpCarousel, MpCarouselItem, MpFlex, MpIcon, MpText } from "@mekari/pixel3";
import { useLanguage } from "~/composables/useLanguage";
import { chunk, HOME_APPS, HOME_SECTION_COPY as copy, type HomeApp } from "~/data/home";

const { tField } = useLanguage();

/** Three product cards per slide — production's `slice_into_chunks(…, 3)`. */
const slides = chunk(HOME_APPS, 3);

const activeIndex = ref(0);

function handleChange(index: number) {
  activeIndex.value = index;
}

function step(delta: number) {
  const count = slides.length;
  activeIndex.value = (activeIndex.value + delta + count) % count;
}

/** Mekari Pay lives inside Jurnal; every other product is its own site. */
function open(app: HomeApp) {
  if (app.route) return navigateTo(app.route);
  if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener,noreferrer");
}

const carouselShellClass = css({ position: "relative", width: "full" });

const carouselClass = css({ width: "full", border: "none", bg: "transparent" });

const slideClass = css({ width: "full", height: "180px" });

const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 4,
  "@media (max-width: 768px)": { gridTemplateColumns: "1fr" }
});

const cardClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 1,
  textAlign: "left",
  height: "136px",
  p: 4,
  bg: "white",
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "md",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  _hover: { borderColor: "blue.400", boxShadow: "md" }
});

const navButtonClass = css({
  position: "absolute",
  top: "50px",
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
