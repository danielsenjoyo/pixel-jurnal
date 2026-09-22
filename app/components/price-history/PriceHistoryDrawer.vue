<template>
  <MpDrawer
    :is-open="isOpen"
    :is-keep-alive="true"
    placement="right"
    size="lg"
    @close="$emit('close')"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <div :class="headerTextClass">
          <span :class="titleClass">What we paid before</span>
          <MpText size="body-small" color="gray.600">{{ product }}</MpText>
        </div>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <div :class="bodyClass">
          <MpText size="body-small" color="gray.600">{{ hoverExceptionNote }}</MpText>

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
              v-model="scope"
              name="price-history-scope"
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
            :current-vendor-name="vendorName"
          >
            <template v-if="mode === 'apply'" #action="{ row }">
              <!-- A single-line button plus a sub-line, not two lines stuffed
                   inside the button: applying a price is a real mutation so it
                   keeps a button's affordance, while the vendor-change preview
                   (which must stay visible — the side effect is previewed
                   before the click) sits beneath it in the same
                   value-plus-quieter-sub-line shape the other columns use. -->
              <!-- A row whose vendor already has a price rule for this product
                   can't be applied: "Use this price" sets the vendor to match
                   the row, which would leave the line carrying a historical
                   price under a rule that governs a different one — the exact
                   contradiction the rule exists to prevent. Same shape as the
                   cross-currency case below: plain text, not a disabled
                   button, because there is nothing the button could safely do. -->
              <MpText v-if="ruleGoverns(row)" size="label-small" color="gray.400">
                Price rule applies
              </MpText>
              <div v-else-if="row.currency === documentCurrency" :class="actionStackClass">
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

          <!-- Ends a short vendor-scoped list instead of letting one or two
               rows float in an otherwise empty panel — and ends it with the
               thing the reader would go looking for next, since the count of
               purchases elsewhere is already known here. Suppressed when the
               vendor has no rows at all: the banner above is already telling
               them to switch scope, and saying it twice is worse than once. -->
          <div v-if="showOtherVendorsNote" :class="tailRowClass">
            <MpText size="body-small" color="gray.600">{{ otherVendorsText }}</MpText>
            <MpTextlink as="button" variant="primary" @click="scope = 'all'">
              See all vendors
            </MpTextlink>
          </div>
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
  MpTextlink,
  css
} from "@mekari/pixel3";
import PriceHistoryRows from "./PriceHistoryRows.vue";
import PriceHistoryCurrentCard from "./PriceHistoryCurrentCard.vue";
import { usePriceHistory } from "~/composables/usePriceHistory";
import { findPriceRule } from "~/data/price-rules";
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
const total = computed(() => currentResult.value.total);
const olderNotShownCount = computed(() => total.value - rows.value.length);

const countText = computed(() => {
  const n = rows.value.length;
  let text = `${n} ${n === 1 ? "purchase" : "purchases"} found`;
  if (olderNotShownCount.value > 0) text += ` · ${olderNotShownCount.value} older, not shown`;
  return text;
});

// Two independent per-scope queries, never one sliced pool — see this
// directory's README, rule 3. The difference is what the tail line reports.
const otherVendorCount = computed(() => resultFor("all").total - resultFor("vendor").total);
const showOtherVendorsNote = computed(
  () => scope.value === "vendor" && rows.value.length > 0 && otherVendorCount.value > 0
);
const otherVendorsText = computed(() => {
  const n = otherVendorCount.value;
  return `${n} more ${n === 1 ? "purchase" : "purchases"} from other vendors`;
});

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

// Apply mode adds the one rule the action column can't state on its own: the
// greyed "Different currency" cells say what a row is, never what the rule is,
// and never name the currency this document is actually in. An earlier draft
// deferred to them ("… is off — see below"), which read like a setting that
// had been switched off and promised an explanation those two words don't give.
const hoverExceptionNote = computed(() => {
  const base = "Prices in another currency show the rupiah estimate when you hover over them.";
  return props.mode === "apply"
    ? `${base} You can't use one to fill this line — the line stays in ${props.documentCurrency}.`
    : base;
});

function ruleGoverns(row: PriceHistoryEntry) {
  return !!findPriceRule(props.product, row.vendorName);
}

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
const tailRowClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap",
  pt: 1
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
