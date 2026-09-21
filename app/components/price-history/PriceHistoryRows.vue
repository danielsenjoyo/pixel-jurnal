<template>
  <MpTableContainer>
    <MpTable :class="tableFixedClass">
      <colgroup>
        <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
      </colgroup>
      <MpTableHead is-fixed>
        <MpTableRow>
          <!-- Follows the cell below it: the transaction number now leads, so
               the header names that, not the date beneath it. "Transaction no."
               is the label the invoice detail page already uses for this value. -->
          <MpTableCell as="th" :class="wrapCellClass">Transaction no.</MpTableCell>
          <MpTableCell as="th" :class="wrapCellClass">Vendor</MpTableCell>
          <MpTableCell as="th" :class="wrapCellClass">Qty</MpTableCell>
          <MpTableCell as="th" :class="[numCellClass, wrapCellClass]">Vendor charged</MpTableCell>
          <MpTableCell v-if="showAction" as="th" />
        </MpTableRow>
      </MpTableHead>

      <MpTableBody v-if="isLoading">
        <MpTableRow v-for="n in 3" :key="`skeleton-${n}`">
          <MpTableCell v-for="col in colCount" :key="col" as="td">
            <MpSkeleton is-loading><span :class="skeletonBarClass" /></MpSkeleton>
          </MpTableCell>
        </MpTableRow>
      </MpTableBody>

      <MpTableBody v-else-if="rows.length">
        <MpTableRow v-for="row in rows" :key="row.id">
          <MpTableCell as="td" :class="wrapCellClass">
            <div :class="stackClass">
              <!-- The transaction number leads: it's the row's identifier, the
                   same way the Purchases index page leads its Number column.
                   Inert placeholder, as everywhere else in this prototype — a
                   real build links this to the source transaction.
                   MpText as="a" rather than MpTextlink: MpTextlink's recipe
                   pins its font-size at 14px and an `!important` utility in
                   pixel_utilities still loses to it (the same reverse
                   layer-cascade problem app/utils/textlink-align.ts records
                   for its padding), which would leave this number larger than
                   the vendor name beside it. MpText has a real `size` prop. -->
              <MpText
                as="a"
                href="#"
                is-text-link
                size="body-small"
                color="blue.400"
                :class="nowrapClass"
                @click.prevent
              >
                {{ row.documentNumber }}
              </MpText>
              <MpText size="label-small" color="gray.600" :class="nowrapClass">
                {{ row.purchasedAtLabel }}
              </MpText>
            </div>
          </MpTableCell>
          <MpTableCell as="td" :class="wrapCellClass">
            <div :class="stackClass">
              <MpText size="body-small">{{ row.vendorName }}</MpText>
              <!-- Not an MpBadge: badges in this app are lifecycle statuses
                   (`for="tableStatus"`) or counts (`for="additionalInformation"`),
                   and "this vendor" is neither — see docs/patterns/StatusBadge.md. -->
              <MpText
                v-if="row.vendorName === currentVendorName"
                size="label-small"
                color="gray.600"
                :class="nowrapClass"
              >
                this vendor
              </MpText>
            </div>
          </MpTableCell>
          <MpTableCell as="td" :class="wrapCellClass">
            <MpText size="body-small" weight="semiBold"
              >{{ formatQty(row.qty) }} {{ row.unit }}</MpText
            >
            <UnitConversionNote
              :unit="row.unit"
              :factor="row.unitFactorAtPurchase"
              :base-unit="row.baseUnit"
            />
          </MpTableCell>
          <MpTableCell as="td" :class="[numCellClass, wrapCellClass]">
            <HistoricalPriceCell
              :price="row.price"
              :currency="row.currency"
              :unit="row.unit"
              :purchased-at-label="row.purchasedAtLabel"
              :exchange-rate-at-purchase="row.exchangeRateAtPurchase"
            />
          </MpTableCell>
          <MpTableCell v-if="showAction" as="td" :class="[numCellClass, wrapCellClass]">
            <slot name="action" :row="row" />
          </MpTableCell>
        </MpTableRow>
      </MpTableBody>

      <MpTableBody v-else>
        <MpTableRow>
          <MpTableCell as="td" :colspan="colCount">
            <!-- Illustration + title + body, per docs/patterns/BlankSlate.md.
                 Deliberately NOT an MpIcon: `name="empty"` type-checks but is
                 not actually wired, and renders as a 626px unstyled SVG (the
                 same trap details-page-format.md records for "pdf-document").
                 Scaled down from the page-level 180px — this sits in a drawer. -->
            <div :class="emptyClass">
              <img
                src="/illustrations/search-not-found.png"
                alt=""
                :class="emptyIllustrationClass"
              />
              <MpText weight="semiBold" color="dark">No purchases found</MpText>
              <MpText size="body-small" color="gray.600">
                No purchases have been recorded for this product yet.
              </MpText>
            </div>
          </MpTableCell>
        </MpTableRow>
      </MpTableBody>
    </MpTable>
  </MpTableContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  MpSkeleton,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText,
  css
} from "@mekari/pixel3";
import UnitConversionNote from "./UnitConversionNote.vue";
import HistoricalPriceCell from "./HistoricalPriceCell.vue";
import { formatQty } from "~/utils/currency";
import type { PriceHistoryEntry } from "~/types/price-history";

const props = withDefaults(
  defineProps<{
    rows: PriceHistoryEntry[];
    isLoading?: boolean;
    showAction?: boolean;
    currentVendorName?: string;
  }>(),
  { isLoading: false, showAction: false, currentVendorName: undefined }
);

defineSlots<{
  action?: (props: { row: PriceHistoryEntry }) => unknown;
}>();

const colCount = computed(() => (props.showAction ? 5 : 4));

// Must sum to exactly 100% — with tableLayout:fixed these widths are
// authoritative, and an over-100% set silently pushes the last column
// (the action cell) off the panel's right edge.
const colWidths = computed(() =>
  props.showAction ? ["22%", "22%", "13%", "19%", "24%"] : ["26%", "28%", "16%", "30%"]
);

const tableFixedClass = css({ tableLayout: "fixed", width: "full" });
const numCellClass = css({ textAlign: "right" });
// MpTableCell defaults to white-space:nowrap, so a long vendor name spills
// into the next column instead of wrapping — the columns then visibly
// collide. Wrapping only: never set `display` on a <td> (see
// docs/patterns/details-page-format.md § "Never set display on a table cell").
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word" });
// A value plus its quieter sub-line, stacked — the same shape the Purchases
// index page uses for "number + description" in one cell.
const stackClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  alignItems: "flex-start"
});
// A date and a document number are single tokens — wrapping them mid-token
// ("BILL/2026/07/050" / "3") is worse than letting the column carry them.
const nowrapClass = css({ whiteSpace: "nowrap!" });
const skeletonBarClass = css({ display: "block", height: "4", rounded: "sm" });
const emptyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  py: 8,
  textAlign: "center"
});
const emptyIllustrationClass = css({ width: "120px", height: "auto", mb: 1 });
</script>
