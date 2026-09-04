<template>
  <DefaultPageContent :title="pageTitle" subtitle="Not posted yet. This screen is for checking a price before approving, not for editing it.">
    <template #actions>
      <MpButton variant="ghost">Delete</MpButton>
      <MpButton variant="primary">Approve and post</MpButton>
    </template>

    <div :class="identityClass">
      <MpBadge for="tableStatus" :type="STATUS_TYPE.draft">{{ STATUS_LABEL.draft }}</MpBadge>
      <div :class="metaGridClass">
        <div>
          <MpText size="caption" color="gray.600">Vendor</MpText>
          <MpText weight="semiBold">{{ invoice.header.vendorName }}</MpText>
        </div>
        <div>
          <MpText size="caption" color="gray.600">Transaction date</MpText>
          <MpText weight="semiBold">{{ invoice.header.transactionDate }}</MpText>
        </div>
        <div>
          <MpText size="caption" color="gray.600">Due date</MpText>
          <MpText weight="semiBold">{{ invoice.header.dueDate }}</MpText>
        </div>
        <div>
          <MpText size="caption" color="gray.600">Currency</MpText>
          <MpText weight="semiBold">{{ invoice.header.currency }}</MpText>
        </div>
        <div>
          <MpText size="caption" color="gray.600">Created by</MpText>
          <MpText weight="semiBold">{{ invoice.header.createdByName }} · {{ invoice.header.createdAtLabel }}</MpText>
        </div>
      </div>
    </div>

    <MpTableContainer>
      <MpTable :class="lineTableClass">
        <colgroup>
          <col style="width: 26%" />
          <col style="width: 12%" />
          <col style="width: 26%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 16%" />
        </colgroup>
        <MpTableHead is-fixed>
          <MpTableRow>
            <MpTableCell as="th">Product</MpTableCell>
            <MpTableCell as="th">Qty / unit</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Unit price</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Discount</MpTableCell>
            <MpTableCell as="th">Tax</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Amount</MpTableCell>
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="line in invoice.lines" :key="line.id">
            <MpTableCell as="td">
              <MpText weight="semiBold">{{ line.productName }}</MpText>
              <MpText size="caption" color="gray.400">{{ line.productCode }}</MpText>
            </MpTableCell>
            <MpTableCell as="td">{{ formatQty(line.qty) }} {{ line.unit }}</MpTableCell>
            <MpTableCell as="td" :class="numCellClass">
              <div :class="priceCellClass">
                <MoneyText :amount="line.unitPrice" :currency="invoice.header.currency" weight="semiBold" />
                <MpButton
                  v-if="hasHistory(line.productId)"
                  variant="secondary"
                  size="sm"
                  left-icon="time"
                  @click="openDrawer(line.id)"
                >
                  See past prices
                </MpButton>
                <MpText v-else size="caption" color="gray.600">No purchase history found for this product.</MpText>
              </div>
            </MpTableCell>
            <MpTableCell as="td" :class="numCellClass">{{ line.discountPercent }}%</MpTableCell>
            <MpTableCell as="td">
              <MpText color="gray.400">—</MpText>
            </MpTableCell>
            <MpTableCell as="td" :class="numCellClass">
              <MoneyText :amount="lineAmount(line)" :currency="invoice.header.currency" weight="semiBold" />
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <div :class="totalsRowClass">
      <div :class="totalsBoxClass">
        <div :class="totalsLineClass">
          <MpText size="body-small" color="gray.600">Subtotal</MpText>
          <MoneyText :amount="subtotal" :currency="invoice.header.currency" />
        </div>
        <div :class="totalsLineClass">
          <MpText size="body-small" color="gray.600">Discount</MpText>
          <MoneyText :amount="0" :currency="invoice.header.currency" />
        </div>
        <div :class="[totalsLineClass, totalsBigClass]">
          <MpText weight="semiBold">Total</MpText>
          <MoneyText :amount="subtotal" :currency="invoice.header.currency" weight="semiBold" />
        </div>
      </div>
    </div>

    <PriceHistoryDrawer
      :is-open="isDrawerOpen"
      mode="reference"
      :product-id="activeLine?.productId ?? ''"
      :product-name="activeLine?.productName ?? ''"
      :product-code="activeLine?.productCode ?? ''"
      :vendor-id="invoice.header.vendorId"
      :vendor-name="invoice.header.vendorName"
      :document-currency="invoice.header.currency"
      :current-line="
        activeLine
          ? {
              price: activeLine.unitPrice,
              currency: invoice.header.currency,
              unit: activeLine.unit,
              qty: activeLine.qty
            }
          : undefined
      "
      @close="activeLineId = null"
    />
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MpBadge, MpButton, MpTable, MpTableBody, MpTableCell, MpTableContainer, MpTableHead, MpTableRow, MpText, css } from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import MoneyText from "~/components/money/MoneyText.vue";
import PriceHistoryDrawer from "~/components/price-history/PriceHistoryDrawer.vue";
import { DRAFT_INVOICE, type PurchaseInvoiceLine } from "~/data/purchase-invoices";
import { PRICE_HISTORY } from "~/data/price-history";
import { formatQty } from "~/utils/currency";

const route = useRoute();
useHead({ title: "Purchase invoice — Mekari Jurnal" });

// The id param only makes the URL/title read realistically — this prototype
// always renders the same mock document regardless of value.
void route.params.id;

const invoice = DRAFT_INVOICE;

const STATUS_TYPE = { draft: "announcement" as const };
const STATUS_LABEL = { draft: "Draft" };

const pageTitle = computed(() => `Purchase invoice ${invoice.header.documentNumber}`);

const activeLineId = ref<string | null>(null);
const isDrawerOpen = computed(() => activeLineId.value !== null);
const activeLine = computed(() => invoice.lines.find((line) => line.id === activeLineId.value) ?? null);

function openDrawer(lineId: string) {
  activeLineId.value = lineId;
}

function hasHistory(productId: string): boolean {
  return PRICE_HISTORY.some((entry) => entry.productId === productId);
}

function lineAmount(line: PurchaseInvoiceLine): number {
  return line.qty * line.unitPrice * (1 - line.discountPercent / 100);
}

const subtotal = computed(() => invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0));

const identityClass = css({ display: "flex", flexDirection: "column", gap: 4, mb: 6 });
const metaGridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 4
});
const lineTableClass = css({ tableLayout: "fixed", width: "full" });
const numCellClass = css({ textAlign: "right" });
const priceCellClass = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 });
const totalsRowClass = css({ display: "flex", justifyContent: "flex-end", mt: 6 });
const totalsBoxClass = css({ display: "flex", flexDirection: "column", gap: 2, width: "320px" });
const totalsLineClass = css({ display: "flex", justifyContent: "space-between", gap: 3 });
const totalsBigClass = css({ borderTopWidth: "sm", borderColor: "gray.100", pt: 2 });
</script>
