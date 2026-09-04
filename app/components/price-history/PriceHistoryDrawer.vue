<template>
  <MpDrawer :is-open="isOpen" :is-keep-alive="true" placement="right" size="md" @close="$emit('close')">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <div :class="headerTextClass">
          <span :class="titleClass">What we paid before</span>
          <MpText size="body-small" color="gray.600">{{ productName }} ({{ productCode }})</MpText>
        </div>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <div :class="bodyClass">
          <MpText size="caption" color="gray.600">{{ hoverExceptionNote }}</MpText>

          <PriceHistoryCurrentCard
            v-if="mode === 'reference' && currentLine"
            :price="currentLine.price"
            :currency="currentLine.currency"
            :unit="currentLine.unit"
            :qty="currentLine.qty"
          />

          <div :class="scopeRowClass">
            <MpSegmentedControl
              v-if="canScopeToVendor"
              id="price-history-scope"
              name="price-history-scope"
              v-model="scope"
              :data="scopeOptions"
            />
            <MpText v-else size="body-small" weight="semiBold">All vendors</MpText>
            <MpText size="body-small" color="gray.600">{{ countText }}</MpText>
          </div>

          <MpBanner v-if="showBanner" variant="info" is-inline>
            <MpBannerIcon />
            <MpBannerDescription>{{ bannerText }}</MpBannerDescription>
          </MpBanner>

          <PriceHistoryRows
            :rows="rows"
            :is-loading="isLoading"
            :show-action="mode === 'apply'"
            :current-vendor-id="vendorId"
          >
            <template v-if="mode === 'apply'" #action="{ row }">
              <MpButton
                v-if="row.currency === documentCurrency"
                variant="secondary"
                size="sm"
                @click="$emit('apply', row)"
              >
                <span :class="useButtonInnerClass">
                  <span>Use this price</span>
                  <span v-if="row.vendorId !== vendorId" :class="usePlusClass">
                    {{ vendorPreviewText(row) }}
                  </span>
                </span>
              </MpButton>
              <MpText v-else size="caption" color="gray.400">Different currency</MpText>
            </template>
          </PriceHistoryRows>
        </div>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpText size="caption" color="gray.600">
          Tax not included. Prices reflect a discount on that line only — not a discount given on the
          whole document.
        </MpText>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  MpBanner,
  MpBannerDescription,
  MpBannerIcon,
  MpButton,
  MpDrawer,
  MpDrawerBody,
  MpDrawerCloseButton,
  MpDrawerContent,
  MpDrawerFooter,
  MpDrawerHeader,
  MpDrawerOverlay,
  MpSegmentedControl,
  MpText,
  css
} from "@mekari/pixel3";
import PriceHistoryRows from "./PriceHistoryRows.vue";
import PriceHistoryCurrentCard from "./PriceHistoryCurrentCard.vue";
import { usePriceHistory } from "~/composables/usePriceHistory";
import type { CurrencyCode, PriceHistoryEntry, PriceHistoryMode, PriceHistoryScope, UnitCode } from "~/types/price-history";

const props = defineProps<{
  isOpen: boolean;
  mode: PriceHistoryMode;
  productId: string;
  productName: string;
  productCode: string;
  vendorId?: string;
  vendorName?: string;
  documentCurrency: CurrencyCode;
  currentLine?: { price: number; currency: CurrencyCode; unit: UnitCode; qty: number };
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "apply", entry: PriceHistoryEntry): void;
}>();

const productIdRef = computed(() => props.productId);
const vendorIdRef = computed(() => props.vendorId);
const { vendorHasHistory, resultFor, resolveDefaultScope } = usePriceHistory(productIdRef, vendorIdRef);

const scope = ref<PriceHistoryScope>("all");
const isLoading = ref(false);

function simulateLoad() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 400);
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      scope.value = resolveDefaultScope();
      simulateLoad();
    }
  }
);

// A vendor that later gets cleared shouldn't leave scope stranded on "vendor".
watch(
  () => props.vendorId,
  (vendorId) => {
    if (!vendorId) scope.value = "all";
  }
);

const canScopeToVendor = computed(() => !!props.vendorId);

const scopeOptions = [
  { id: "seg-vendor", label: "This vendor", value: "vendor" },
  { id: "seg-all", label: "All vendors", value: "all" }
];

const currentResult = computed(() => resultFor(scope.value));
const rows = computed(() => currentResult.value.rows);
const total = computed(() => currentResult.value.total);
const olderNotShownCount = computed(() => total.value - rows.value.length);

const countText = computed(() => {
  const n = rows.value.length;
  let text = `${n} ${n === 1 ? "purchase" : "purchases"} found`;
  if (olderNotShownCount.value > 0) text += ` · ${olderNotShownCount.value} older, not shown`;
  return text;
});

const showBanner = computed(
  () => !props.vendorId || (scope.value === "vendor" && !vendorHasHistory.value)
);

const bannerText = computed(() => {
  if (!props.vendorId) {
    return props.mode === "apply"
      ? "No vendor selected yet. Showing every vendor that has supplied this item. Applying a price will set the vendor to match it."
      : "No vendor selected yet. Showing every vendor that has supplied this item.";
  }
  return `${props.vendorName ?? "This vendor"} has no recorded purchases for this product. Switch to All vendors to see prices from other vendors.`;
});

const hoverExceptionNote = computed(() =>
  props.mode === "apply"
    ? "Prices in another currency show the rupiah estimate when you hover over them. Using them to fill this line is off — see below."
    : "Prices in another currency show the rupiah estimate when you hover over them."
);

function vendorPreviewText(row: PriceHistoryEntry) {
  return props.vendorId ? `and change vendor to ${row.vendorName}` : `and set vendor to ${row.vendorName}`;
}

const headerTextClass = css({ display: "flex", flexDirection: "column", gap: "0.5" });
const titleClass = css({ fontSize: "lg", fontWeight: "semiBold" });
const bodyClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const scopeRowClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap"
});
const useButtonInnerClass = css({ display: "flex", flexDirection: "column", alignItems: "flex-start" });
const usePlusClass = css({ fontSize: "xs", color: "gray.600", fontWeight: "regular" });
</script>
