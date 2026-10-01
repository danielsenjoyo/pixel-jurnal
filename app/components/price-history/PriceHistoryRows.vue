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
          <!-- Qty and Units are separate columns, as on the invoice's own
               line-items table — the number right-aligns and stays scannable
               down the column, and the unit carries its conversion note. -->
          <MpTableCell as="th" :class="[numCellClass, wrapCellClass]">Qty</MpTableCell>
          <MpTableCell as="th" :class="wrapCellClass">Units</MpTableCell>
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
          <MpTableCell as="td" :class="[wrapCellClass, topCellClass]">
            <div :class="stackClass">
              <!-- The transaction number leads: it's the row's identifier, the
                   same way the Purchases index page leads its Number column, and
                   it is the same record link (docs/patterns/TablePage.md). Inert
                   placeholder, as everywhere else in this prototype — a real
                   build links this to the source transaction. -->
              <MpTextlink as="button" variant="primary" :class="textlinkAlignClass">
                {{ row.documentNumber }}
              </MpTextlink>
              <MpText size="label-small" color="gray.600" :class="nowrapClass">
                {{ row.purchasedAtLabel }}
              </MpText>
            </div>
          </MpTableCell>
          <MpTableCell as="td" :class="[wrapCellClass, topCellClass]">
            <div :class="stackClass">
              <MpText>{{ row.vendorName }}</MpText>
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
          <MpTableCell as="td" :class="[numCellClass, wrapCellClass, topCellClass]">
            <MpText>{{ formatQty(row.qty) }}</MpText>
          </MpTableCell>
          <MpTableCell as="td" :class="[wrapCellClass, topCellClass]">
            <div :class="stackClass">
              <MpText>{{ row.unit }}</MpText>
              <UnitConversionNote
                :unit="row.unit"
                :factor="row.unitFactorAtPurchase"
                :base-unit="row.baseUnit"
              />
            </div>
          </MpTableCell>
          <MpTableCell as="td" :class="[numCellClass, wrapCellClass, topCellClass]">
            <HistoricalPriceCell
              :price="row.price"
              :currency="row.currency"
              :unit="row.unit"
              :purchased-at-label="row.purchasedAtLabel"
              :exchange-rate-at-purchase="row.exchangeRateAtPurchase"
            />
          </MpTableCell>
          <MpTableCell
            v-if="showAction"
            as="td"
            :class="[numCellClass, wrapCellClass, topCellClass]"
          >
            <slot name="action" :row="row" />
          </MpTableCell>
        </MpTableRow>
      </MpTableBody>

      <MpTableBody v-else>
        <MpTableRow>
          <MpTableCell as="td" :colspan="colCount">
            <!-- The in-table case of docs/patterns/BlankSlate.md. `no-data`, not
                 the magnifier: nothing was searched for, the product simply
                 has no purchases yet. Deliberately NOT an MpIcon: `name="empty"`
                 type-checks but is not actually wired, and renders as a 626px
                 unstyled SVG (the same trap details-page-format.md records for
                 "pdf-document"). -->
            <BlankSlate
              variant="no-data"
              title="No purchases found"
              description="No purchases have been recorded for this product yet."
            />
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
  MpTextlink,
  css
} from "@mekari/pixel3";
import UnitConversionNote from "./UnitConversionNote.vue";
import HistoricalPriceCell from "./HistoricalPriceCell.vue";
import { formatQty } from "~/utils/currency";
import { textlinkAlignClass } from "~/utils/textlink-align";
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

const colCount = computed(() => (props.showAction ? 6 : 5));

// Must sum to exactly 100% — with tableLayout:fixed these widths are
// authoritative, and an over-100% set silently pushes the last column
// (the action cell) off the panel's right edge.
const colWidths = computed(() =>
  props.showAction ? ["19%", "21%", "7%", "14%", "17%", "22%"] : ["24%", "25%", "8%", "20%", "23%"]
);

const tableFixedClass = css({ tableLayout: "fixed", width: "full" });
const numCellClass = css({ textAlign: "right" });
// MpTableCell defaults to white-space:nowrap, so a long vendor name spills
// into the next column instead of wrapping — the columns then visibly
// collide. Wrapping only: never set `display` on a <td> (see
// docs/patterns/details-page-format.md § "Never set display on a table cell").
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word" });
// Rows are one or two lines tall depending on the cell (a unit with its
// conversion note, a vendor with "this vendor"). Top-aligned, every first line
// sits on one baseline; centred, single-line cells float between the others'.
const topCellClass = css({ verticalAlign: "top!" });
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
</script>
