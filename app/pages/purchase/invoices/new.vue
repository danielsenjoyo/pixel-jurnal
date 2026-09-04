<template>
  <DefaultPageContent title="Create purchase invoice">
    <template #actions>
      <MpText size="caption" color="gray.600">Total</MpText>
      <MpText size="h3" weight="semiBold">{{ formatMoney(total, currency) }}</MpText>
    </template>

    <div :class="formCardClass">
      <div :class="fieldGridClass">
        <MpFormControl id="vendor" is-required>
          <MpFormLabel>Vendor</MpFormLabel>
          <MpAutocomplete
            v-model="vendorId"
            :data="vendorOptions"
            value-prop="value"
            label-prop="label"
            is-searchable
            is-clearable
            placeholder="Select vendor"
          />
        </MpFormControl>
        <MpFormControl id="email">
          <MpFormLabel>Email</MpFormLabel>
          <MpInput v-model="email" placeholder="e.g. john@example.com" />
        </MpFormControl>
        <div :class="checkboxFieldClass">
          <MpCheckbox id="shipping-info" v-model:is-checked="shippingInfo">Shipping info</MpCheckbox>
        </div>

        <MpFormControl id="billing-address" :class="spanRowClass">
          <MpFormLabel>Billing address</MpFormLabel>
          <MpTextarea v-model="billingAddress" placeholder="e.g. Jalan Indonesia Blok C No. 22" />
        </MpFormControl>
        <MpFormControl id="transaction-date">
          <MpFormLabel>Transaction date</MpFormLabel>
          <MpInput v-model="transactionDate" />
        </MpFormControl>
        <MpFormControl id="transaction-no">
          <MpFormLabel>
            Transaction no.
            <template #icon>
              <MpIcon name="settings" size="sm" v-tooltip="'Auto-numbering settings'" />
            </template>
          </MpFormLabel>
          <MpInput model-value="[Auto]" is-read-only />
        </MpFormControl>
        <MpFormControl id="tag">
          <MpFormLabel>Tag</MpFormLabel>
          <MpInput v-model="tag" placeholder="Choose tag" />
        </MpFormControl>

        <MpFormControl id="due-date">
          <MpFormLabel>Due date</MpFormLabel>
          <MpInput v-model="dueDate" />
        </MpFormControl>
        <MpFormControl id="vendor-reference" :class="spanTwoClass">
          <MpFormLabel>Vendor reference number</MpFormLabel>
          <MpInput v-model="vendorReferenceNumber" />
        </MpFormControl>

        <MpFormControl id="term">
          <MpFormLabel>Term</MpFormLabel>
          <MpSelect v-model="term">
            <option value="net-30">Net 30</option>
            <option value="net-60">Net 60</option>
            <option value="cod">Cash on delivery</option>
          </MpSelect>
        </MpFormControl>
        <MpFormControl id="warehouse" :class="spanTwoClass">
          <MpFormLabel>Warehouse</MpFormLabel>
          <MpSelect v-model="warehouse" placeholder="Select warehouse">
            <option value="">Select warehouse</option>
            <option value="main">Main warehouse</option>
            <option value="secondary">Secondary warehouse</option>
          </MpSelect>
        </MpFormControl>
      </div>

      <div :class="currencyRowClass">
        <MpFormControl id="currency">
          <MpFormLabel>Currency</MpFormLabel>
          <MpSelect v-model="currency">
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
          </MpSelect>
        </MpFormControl>
        <MpCheckbox id="price-includes-tax" v-model:is-checked="priceIncludesTax">Price includes tax</MpCheckbox>
      </div>
    </div>

    <MpTableContainer>
      <MpTable :class="lineTableClass">
        <colgroup>
          <col style="width: 20%" />
          <col style="width: 14%" />
          <col style="width: 7%" />
          <col style="width: 9%" />
          <col style="width: 22%" />
          <col style="width: 9%" />
          <col style="width: 9%" />
          <col style="width: 10%" />
        </colgroup>
        <MpTableHead is-fixed>
          <MpTableRow>
            <MpTableCell as="th">Product</MpTableCell>
            <MpTableCell as="th">Description</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Qty</MpTableCell>
            <MpTableCell as="th">Units</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Unit price</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Discount</MpTableCell>
            <MpTableCell as="th">Tax</MpTableCell>
            <MpTableCell as="th" :class="numCellClass">Amount</MpTableCell>
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="line in lines" :key="line.id">
            <MpTableCell as="td">
              <MpAutocomplete
                :model-value="line.productId"
                :data="productOptions"
                value-prop="value"
                label-prop="label"
                is-searchable
                is-clearable
                placeholder="Select product"
                @update:model-value="(value) => onProductChange(line, value)"
              />
            </MpTableCell>
            <MpTableCell as="td">
              <MpInput v-model="line.description" placeholder="Description" />
            </MpTableCell>
            <MpTableCell as="td">
              <MpInput v-model.number="line.qty" />
            </MpTableCell>
            <MpTableCell as="td">
              <MpSelect v-model="line.unit">
                <option value="pcs">pcs</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
              </MpSelect>
            </MpTableCell>
            <MpTableCell as="td" :class="numCellClass">
              <div :class="priceCellClass">
                <MoneyInput v-model="line.unitPrice" :currency="currency" size="sm" />
                <MpButton
                  v-if="hasHistory(line.productId)"
                  variant="secondary"
                  size="sm"
                  left-icon="time"
                  @click="openDrawer(line.id)"
                >
                  See past prices
                </MpButton>
                <MpText v-else-if="line.productId" size="caption" color="gray.600">
                  No purchase history found for this product.
                </MpText>
              </div>
            </MpTableCell>
            <MpTableCell as="td" :class="numCellClass">
              <MpInput v-model.number="line.discountPercent" />
            </MpTableCell>
            <MpTableCell as="td">
              <MpSelect v-model="line.taxLabel" placeholder="Select tax">
                <option value="">Select tax</option>
                <option value="ppn-11">PPN 11%</option>
              </MpSelect>
            </MpTableCell>
            <MpTableCell as="td" :class="numCellClass">
              <MoneyText :amount="lineAmount(line)" :currency="currency" weight="semiBold" />
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <button type="button" :class="addLineClass" @click="addLine">
      <MpIcon name="add" size="sm" />
      <MpText size="body-small">Select product</MpText>
    </button>

    <div :class="belowTableClass">
      <div :class="notesColumnClass">
        <MpFormControl id="message">
          <MpFormLabel>Message</MpFormLabel>
          <MpTextarea v-model="message" placeholder="Message" />
        </MpFormControl>
        <MpFormControl id="memo">
          <MpFormLabel>Memo</MpFormLabel>
          <MpTextarea v-model="memo" placeholder="Memo" />
        </MpFormControl>
      </div>

      <div :class="summaryColumnClass">
        <div :class="totalsLineClass">
          <MpText size="body-small" color="gray.600">Subtotal</MpText>
          <MoneyText :amount="rawSubtotal" :currency="currency" />
        </div>
        <div :class="totalsLineClass">
          <MpText size="body-small" color="gray.600">Discount per lines</MpText>
          <MoneyText :amount="discountPerLines" :currency="currency" />
        </div>
        <div :class="totalsLineClass">
          <MpText size="body-small" color="gray.600">Discount</MpText>
          <div :class="discountInputClass">
            <MpSelect v-model="discountType" size="sm">
              <option value="percent">%</option>
              <option value="amount">{{ currency }}</option>
            </MpSelect>
            <MpInput v-model.number="discountValue" size="sm" />
          </div>
        </div>
        <div :class="[totalsLineClass, totalsBigClass]">
          <MpText weight="semiBold">Total</MpText>
          <MoneyText :amount="total" :currency="currency" weight="semiBold" />
        </div>
        <MpCheckbox id="withholding" v-model:is-checked="withholding">Withholding</MpCheckbox>
        <MpCheckbox id="deposit" v-model:is-checked="deposit">Deposit</MpCheckbox>
      </div>
    </div>

    <div :class="footerActionsClass">
      <MpButton variant="ghost" @click="navigateTo('/purchase')">Cancel</MpButton>
      <MpButton variant="primary">Save as draft</MpButton>
    </div>

    <PriceHistoryDrawer
      :is-open="isDrawerOpen"
      mode="apply"
      :product-id="activeLine?.productId ?? ''"
      :product-name="activeLine?.productName ?? ''"
      :product-code="activeLine?.productCode ?? ''"
      :vendor-id="vendorId || undefined"
      :vendor-name="resolvedVendorName"
      :document-currency="currency"
      @close="activeLineId = null"
      @apply="onApplyPrice"
    />
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  MpAutocomplete,
  MpButton,
  MpCheckbox,
  MpFormControl,
  MpFormLabel,
  MpIcon,
  MpInput,
  MpSelect,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText,
  MpTextarea,
  css,
  toast
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import MoneyText from "~/components/money/MoneyText.vue";
import MoneyInput from "~/components/money/MoneyInput.vue";
import PriceHistoryDrawer from "~/components/price-history/PriceHistoryDrawer.vue";
import { PRODUCTS, VENDORS, NEW_INVOICE_INITIAL_LINES, createDraftLine, type PurchaseInvoiceLine } from "~/data/purchase-invoices";
import { PRICE_HISTORY } from "~/data/price-history";
import { formatMoney } from "~/utils/currency";
import type { CurrencyCode, PriceHistoryEntry } from "~/types/price-history";

useHead({ title: "Create purchase invoice — Mekari Jurnal" });

const vendorId = ref("");
const currency = ref<CurrencyCode>("IDR");
const email = ref("");
const shippingInfo = ref(false);
const billingAddress = ref("");
const transactionDate = ref("30/07/2026");
const dueDate = ref("29/09/2026");
const tag = ref("");
const vendorReferenceNumber = ref("");
const term = ref("net-30");
const warehouse = ref("");
const priceIncludesTax = ref(false);
const message = ref("");
const memo = ref("");
const withholding = ref(false);
const deposit = ref(false);
const discountType = ref<"percent" | "amount">("percent");
const discountValue = ref(0);

const lines = ref<PurchaseInvoiceLine[]>(NEW_INVOICE_INITIAL_LINES.map((line) => ({ ...line })));

const vendorOptions = VENDORS.map((v) => ({ value: v.id, label: v.name }));
const productOptions = PRODUCTS.map((p) => ({ value: p.id, label: `${p.code} | ${p.name}` }));

const resolvedVendorName = computed(() => VENDORS.find((v) => v.id === vendorId.value)?.name);

function onProductChange(line: PurchaseInvoiceLine, value: unknown) {
  line.productId = value ? String(value) : "";
  const product = PRODUCTS.find((p) => p.id === line.productId);
  line.productCode = product?.code ?? "";
  line.productName = product?.name ?? "";
  if (product) line.unit = product.unit;
}

function addLine() {
  lines.value.push(createDraftLine(`new-line-${lines.value.length + 1}-${Date.now()}`));
}

function hasHistory(productId: string): boolean {
  return !!productId && PRICE_HISTORY.some((entry) => entry.productId === productId);
}

function lineAmount(line: PurchaseInvoiceLine): number {
  return line.qty * line.unitPrice * (1 - line.discountPercent / 100);
}

const rawSubtotal = computed(() => lines.value.reduce((sum, line) => sum + line.qty * line.unitPrice, 0));
const discountPerLines = computed(() =>
  lines.value.reduce((sum, line) => sum + line.qty * line.unitPrice * (line.discountPercent / 100), 0)
);
const documentDiscountAmount = computed(() =>
  discountType.value === "percent"
    ? (rawSubtotal.value - discountPerLines.value) * (discountValue.value / 100)
    : discountValue.value
);
const total = computed(() => rawSubtotal.value - discountPerLines.value - documentDiscountAmount.value);

const activeLineId = ref<string | null>(null);
const isDrawerOpen = computed(() => activeLineId.value !== null);
const activeLine = computed(() => lines.value.find((line) => line.id === activeLineId.value) ?? null);

function openDrawer(lineId: string) {
  activeLineId.value = lineId;
}

function onApplyPrice(entry: PriceHistoryEntry) {
  const line = activeLine.value;
  if (!line) return;

  line.unitPrice = entry.price;

  // Rule: Use never touches currency — only vendor, and always overwrites an
  // already-selected vendor (not just when empty).
  let vendorNote = "";
  if (entry.vendorId !== vendorId.value) {
    const hadVendor = !!vendorId.value;
    vendorId.value = entry.vendorId;
    vendorNote = hadVendor ? ` — vendor changed to ${entry.vendorName}` : ` — vendor set to ${entry.vendorName}`;
  }

  activeLineId.value = null;
  toast.notify({
    id: `apply-price-${Date.now()}`,
    variant: "success",
    title: `Price applied${vendorNote}.`
  });
}

const formCardClass = css({ display: "flex", flexDirection: "column", gap: 4, mb: 6 });
const fieldGridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 4
});
const spanTwoClass = css({ gridColumn: "span 2" });
const spanRowClass = css({ gridRow: "span 2" });
const checkboxFieldClass = css({ display: "flex", alignItems: "flex-end", pb: 2 });
const currencyRowClass = css({ display: "flex", alignItems: "flex-end", gap: 6 });
const lineTableClass = css({ tableLayout: "fixed", width: "full" });
const numCellClass = css({ textAlign: "right" });
const priceCellClass = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 });
const addLineClass = css({
  display: "flex",
  alignItems: "center",
  gap: 2,
  border: "0",
  bg: "transparent",
  p: 3,
  cursor: "pointer",
  color: "blue.400"
});
const belowTableClass = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  mt: 6
});
const notesColumnClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const summaryColumnClass = css({ display: "flex", flexDirection: "column", gap: 3 });
const totalsLineClass = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3 });
const totalsBigClass = css({ borderTopWidth: "sm", borderColor: "gray.100", pt: 2 });
const discountInputClass = css({ display: "flex", gap: 2, width: "160px" });
const footerActionsClass = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: 2,
  mt: 8,
  pt: 4,
  borderTopWidth: "sm",
  borderColor: "gray.100"
});
</script>
