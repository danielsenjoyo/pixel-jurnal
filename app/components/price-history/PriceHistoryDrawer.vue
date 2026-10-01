<template>
  <MpDrawer
    :is-open="isOpen"
    :is-keep-alive="true"
    placement="right"
    :size="drawerSize"
    @close="$emit('close')"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <!-- The product is the title: it is what the reader clicked from, and
             the one thing that differs between two openings of this drawer. -->
        <span :class="titleClass">{{ product }}</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <div :class="bodyClass">
          <PriceHistoryCurrentLine
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
              v-model="scope"
              name="price-history-scope"
              :data="scopeOptions"
            />
            <MpText v-else size="body-small" weight="semiBold">All vendors</MpText>
          </div>

          <MpBanner v-if="showBanner" variant="info" is-inline>
            <MpBannerIcon />
            <MpBannerDescription>{{ bannerText }}</MpBannerDescription>
          </MpBanner>

          <PriceHistoryRows
            :rows="rows"
            :is-loading="isLoading"
            :show-action="mode === 'apply'"
            :current-vendor-name="vendorName"
          >
            <template v-if="mode === 'apply'" #action="{ row }">
              <!-- A single-line button plus a sub-line, not two lines stuffed
                   inside the button: applying a price is a real mutation so it
                   keeps a button's affordance, while the vendor-change preview
                   (which must stay visible — the side effect is previewed
                   before the click) sits beneath it in the same
                   value-plus-quieter-sub-line shape the other columns use. -->
              <div v-if="row.currency === documentCurrency" :class="actionStackClass">
                <MpButton variant="secondary" size="sm" @click="$emit('apply', row)">
                  Use this price
                </MpButton>
                <MpText
                  v-if="applyPreviewText(row)"
                  size="label-small"
                  color="gray.600"
                  :class="applyPreviewClass"
                >
                  {{ applyPreviewText(row) }}
                </MpText>
              </div>
              <MpText v-else size="label-small" color="gray.400">Different currency</MpText>
            </template>
          </PriceHistoryRows>
        </div>
      </MpDrawerBody>
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
  MpDrawerHeader,
  MpDrawerOverlay,
  MpSegmentedControl,
  MpText,
  css
} from "@mekari/pixel3";
import PriceHistoryRows from "./PriceHistoryRows.vue";
import PriceHistoryCurrentLine from "./PriceHistoryCurrentLine.vue";
import { usePriceHistory } from "~/composables/usePriceHistory";
import type { PriceHistoryEntry, PriceHistoryMode, PriceHistoryScope } from "~/types/price-history";

const props = defineProps<{
  isOpen: boolean;
  mode: PriceHistoryMode;
  /** Matches `PurchaseTransactionLine.product` — a name, not an id (see `app/types/price-history.ts`). */
  product: string;
  /** The document's current vendor name, if known — also matches `PurchaseTransaction.vendorName`. */
  vendorName?: string;
  documentCurrency: string;
  currentLine?: { price: number; currency: string; unit: string; qty: number };
}>();

defineEmits<{
  (e: "close"): void;
  (e: "apply", entry: PriceHistoryEntry): void;
}>();

const productRef = computed(() => props.product);
const vendorNameRef = computed(() => props.vendorName);
const { vendorHasHistory, resultFor, resolveDefaultScope } = usePriceHistory(
  productRef,
  vendorNameRef
);

// Apply mode carries a sixth column (the "Use this price" action); at "lg" the
// price column is squeezed until a figure breaks mid-number.
const drawerSize = computed(() => (props.mode === "apply" ? "xl" : "lg"));

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
  () => props.vendorName,
  (vendorName) => {
    if (!vendorName) scope.value = "all";
  }
);

const canScopeToVendor = computed(() => !!props.vendorName);

const scopeOptions = [
  { id: "seg-vendor", label: "This vendor", value: "vendor" },
  { id: "seg-all", label: "All vendors", value: "all" }
];

const currentResult = computed(() => resultFor(scope.value));
const rows = computed(() => currentResult.value.rows);

const showBanner = computed(
  () => !props.vendorName || (scope.value === "vendor" && !vendorHasHistory.value)
);

const bannerText = computed(() => {
  if (!props.vendorName) {
    return props.mode === "apply"
      ? "No vendor selected yet. Showing every vendor that has supplied this item. Applying a price will set the vendor to match it."
      : "No vendor selected yet. Showing every vendor that has supplied this item.";
  }
  return `${props.vendorName} has no recorded purchases for this product. Switch to All vendors to see prices from other vendors.`;
});

// Every side effect of "Use this price" is previewed before the click, not
// just the vendor one: the unit moves with the price (a per-box price on a
// per-pcs line would be off by the packaging factor), and a unit change is
// the side effect most likely to surprise someone mid-entry.
function applyPreviewText(row: PriceHistoryEntry) {
  const parts: string[] = [];
  if (row.vendorName !== props.vendorName) {
    parts.push(
      props.vendorName ? `change vendor to ${row.vendorName}` : `set vendor to ${row.vendorName}`
    );
  }
  if (props.currentLine && row.unit !== props.currentLine.unit) {
    parts.push(`change the unit to ${row.unit}`);
  }
  return parts.length ? `and ${parts.join(", ")}` : "";
}

const titleClass = css({ fontSize: "lg", fontWeight: "semiBold" });
const bodyClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const scopeRowClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap"
});
const actionStackClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 1
});
// The preview carries a full vendor name, so it must wrap rather than clip —
// a truncated "and set vendor to CV Su…" defeats the point of previewing the
// side effect at all.
const applyPreviewClass = css({
  whiteSpace: "normal!",
  wordBreak: "break-word",
  textAlign: "right"
});
</script>
