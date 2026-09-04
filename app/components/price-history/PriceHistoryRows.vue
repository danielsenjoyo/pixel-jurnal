<template>
  <MpTableContainer>
    <MpTable :class="tableFixedClass">
      <colgroup>
        <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
      </colgroup>
      <MpTableHead is-fixed>
        <MpTableRow>
          <MpTableCell as="th" :class="wrapCellClass">Date</MpTableCell>
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
        <MpTableRow v-for="(row, index) in rows" :key="row.id">
          <MpTableCell as="td" :class="wrapCellClass">
            <div :class="dateCellClass">
              <MpText size="body-small" weight="semiBold" :class="nowrapClass">
                {{ row.purchasedAtLabel }}
              </MpText>
              <MpBadge v-if="index === 0" for="additionalInformation" type="information">newest</MpBadge>
            </div>
            <MpText as="a" href="#" is-text-link size="label-small" :class="nowrapClass" @click.prevent>
              {{ row.documentNumber }}
            </MpText>
          </MpTableCell>
          <MpTableCell as="td" :class="wrapCellClass">
            <div :class="dateCellClass">
              <MpText size="body-small">{{ row.vendorName }}</MpText>
              <MpBadge v-if="row.vendorName === currentVendorName" for="additionalInformation" type="announcement">
                this vendor
              </MpBadge>
            </div>
          </MpTableCell>
          <MpTableCell as="td" :class="wrapCellClass">
            <MpText size="body-small" weight="semiBold">{{ formatQty(row.qty) }} {{ row.unit }}</MpText>
            <UnitConversionNote :unit="row.unit" :factor="row.unitFactorAtPurchase" :base-unit="row.baseUnit" />
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
            <div :class="emptyClass">
              <MpIcon name="empty" size="lg" color="gray.400" />
              <MpText weight="semiBold" color="dark">No purchases found</MpText>
              <MpText size="body-small" color="gray.600">No purchases have been recorded for this product yet.</MpText>
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
  MpBadge,
  MpIcon,
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
  props.showAction
    ? ["20%", "20%", "13%", "19%", "28%"]
    : ["24%", "28%", "18%", "30%"]
);

const tableFixedClass = css({ tableLayout: "fixed", width: "full" });
const numCellClass = css({ textAlign: "right" });
// MpTableCell defaults to white-space:nowrap, so a long vendor name spills
// into the next column instead of wrapping — the columns then visibly
// collide. Wrapping only: never set `display` on a <td> (see
// docs/patterns/details-page-format.md § "Never set display on a table cell").
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word" });
// flexWrap so the "newest" badge drops to its own line rather than being
// squeezed on top of a wrapping date.
const dateCellClass = css({ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" });
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
</script>
