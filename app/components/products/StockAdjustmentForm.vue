<template>
  <DefaultPageContent
    :title="title"
    breadcrumb="Stock adjustment list"
    breadcrumb-to="/products?tab=stock_adjustments"
  >
    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">
        Stock adjustment not found
      </MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This transaction may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products?tab=stock_adjustments')">
        Back to Stock adjustment list
      </MpButton>
    </div>

    <template v-else>
      <MpBanner
        v-if="submitted && missingFields.length"
        id="adjustment-form-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="adjustment-form-missing-icon" />
        <MpBannerTitle id="adjustment-form-missing-title">
          Stock adjustment can't be saved yet
        </MpBannerTitle>
        <MpBannerDescription id="adjustment-form-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <!-- Zone A. The running figure is what this adjustment is worth, which
           moves with every actual quantity typed below. -->
      <div :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Adjustment type</MpFormLabel>
          <div :class="radioRowClass">
            <MpRadio
              v-for="option in ADJUSTMENT_TYPE_OPTIONS"
              :id="`adjustment-type-${option}`"
              :key="option"
              v-model="form.adjustmentType"
              :value="option"
            >
              {{ ADJUSTMENT_TYPE_LABEL[option] }}
            </MpRadio>
          </div>
          <MpFormHelpText>{{ typeHelp }}</MpFormHelpText>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && !form.warehouse">
          <MpFormLabel>Warehouse</MpFormLabel>
          <MpSelect v-model="form.warehouse" is-full-width @update:model-value="onWarehouseChange">
            <option value="">Select warehouse</option>
            <option v-for="option in WAREHOUSE_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>You must select warehouse</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && !dmyToIso(dateText)">
          <MpFormLabel>Date</MpFormLabel>
          <MpDatePicker
            v-model="dateText"
            value-type="string"
            :format="DATE_INPUT_FORMAT"
            placeholder="DD/MM/YYYY"
            use-portal
          />
          <MpFormErrorMessage>You must fill the date</MpFormErrorMessage>
        </MpFormControl>

        <div :class="runningTotalClass">
          <MpText size="body-small" color="gray.600">Adjustment value</MpText>
          <MpText weight="semiBold" color="dark">{{ formatCurrency(totalValue) }}</MpText>
        </div>
      </div>

      <div :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Adjustment category</MpFormLabel>
          <MpSelect v-model="form.category" is-full-width>
            <option value="">Select category</option>
            <option v-for="option in ADJUSTMENT_CATEGORY_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && !form.account">
          <MpFormLabel>Account</MpFormLabel>
          <MpSelect v-model="form.account" is-full-width>
            <option value="">Select account</option>
            <option v-for="option in ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>You must select account</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Tags</MpFormLabel>
          <MpInputTag
            id="adjustment-tags"
            :key="tagKey"
            placeholder="Search tag..."
            :data="tagData"
            :suggestions="PRODUCT_TAG_OPTIONS"
            :max-row="-1"
            :is-enable-create-new-tag="false"
            :is-show-suggestions="true"
            :is-show-icon-chevron-down="true"
            @change="onTagsChange"
          />
        </MpFormControl>
        <div />
      </div>

      <div :class="memoRowClass">
        <MpFormControl>
          <MpFormLabel>Memo</MpFormLabel>
          <MpTextarea v-model="form.memo" placeholder="Why this adjustment was made" />
        </MpFormControl>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- Zone D — the lines. Recorded quantity is read-only and comes from the
           catalogue: it is what the system believes, and letting the user type
           over it would destroy the very comparison the screen exists to make.
           The trailing row is the add affordance. -->
      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Products</MpText>
      <MpTableContainer :class="scrollShadowClass">
        <MpTable :class="lineTableClass">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <MpTableHead is-fixed :class="tableHeadClass">
            <MpTableRow>
              <MpTableCell as="th">Product name</MpTableCell>
              <MpTableCell as="th">Product code</MpTableCell>
              <MpTableCell as="th">Recorded quantity</MpTableCell>
              <MpTableCell as="th">Actual quantity</MpTableCell>
              <MpTableCell as="th">Difference</MpTableCell>
              <MpTableCell as="th" />
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="(line, index) in form.lines" :key="line.productId">
              <MpTableCell as="td" :class="wrapCellClass">{{ line.name }}</MpTableCell>
              <MpTableCell as="td" :class="wrapCellClass">{{ line.code }}</MpTableCell>
              <MpTableCell as="td" :class="wrapCellClass">
                {{ formatQuantity(line.recorded) }} {{ line.unit }}
              </MpTableCell>
              <MpTableCell as="td">
                <MpInput
                  v-model="actualText[index]"
                  type="text"
                  inputmode="numeric"
                  @update:model-value="onActualInput(index)"
                />
              </MpTableCell>
              <MpTableCell as="td" :class="wrapCellClass">
                {{ signed(adjustmentDifference(line)) }} {{ line.unit }}
              </MpTableCell>
              <MpTableCell as="td">
                <MpButton
                  variant="ghost"
                  size="sm"
                  left-icon="minus-circular"
                  aria-label="Remove product"
                  @click="removeLine(index)"
                />
              </MpTableCell>
            </MpTableRow>

            <MpTableRow>
              <MpTableCell as="td">
                <MpSelect model-value="" is-full-width @update:model-value="onAddLine">
                  <option value="">Select product</option>
                  <option
                    v-for="option in productOptions"
                    :key="option.id"
                    :value="String(option.id)"
                  >
                    {{ option.name }}
                  </option>
                </MpSelect>
              </MpTableCell>
              <MpTableCell as="td" />
              <MpTableCell as="td" />
              <MpTableCell as="td" />
              <MpTableCell as="td" />
              <MpTableCell as="td" />
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>

      <div :class="totalsRowClass">
        <div :class="totalsColClass">
          <div :class="totalsLineClass">
            <MpText weight="semiBold" color="dark">Total adjustment value</MpText>
            <MpText weight="semiBold" color="dark">{{ formatCurrency(totalValue) }}</MpText>
          </div>
        </div>
      </div>

      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton variant="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Save" }}
        </MpButton>
      </div>

      <MpModal
        id="adjustment-form-discard-modal"
        :is-open="isDiscardModalOpen"
        size="sm"
        @close="isDiscardModalOpen = false"
      >
        <MpModalOverlay />
        <MpModalContent>
          <MpModalHeader>
            <span :class="modalTitleClass">Cancel addition?</span>
            <MpModalCloseButton />
          </MpModalHeader>
          <MpModalBody>
            <MpText size="body" color="gray.700">Data you have filled will not be saved.</MpText>
          </MpModalBody>
          <MpModalFooter>
            <div :class="modalFooterClass">
              <MpButton variant="secondary" @click="isDiscardModalOpen = false">
                Continue addition
              </MpButton>
              <MpButton variant="danger" @click="leave">Discard</MpButton>
            </div>
          </MpModalFooter>
        </MpModalContent>
      </MpModal>
    </template>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  css,
  MpBanner,
  MpBannerDescription,
  MpBannerIcon,
  MpBannerTitle,
  MpButton,
  MpDatePicker,
  MpDivider,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
  MpFormLabel,
  MpInput,
  MpInputTag,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
  MpRadio,
  MpSelect,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText,
  MpTextarea
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  ADJUSTMENT_CATEGORY_OPTIONS,
  ADJUSTMENT_TYPE_LABEL,
  ADJUSTMENT_TYPE_OPTIONS,
  adjustmentDifference,
  adjustmentLineForProduct,
  adjustmentTotalValue,
  createStockAdjustment,
  emptyStockAdjustmentInput,
  formatCurrency,
  formatQuantity,
  getProductById,
  getProducts,
  getStockAdjustmentById,
  PRODUCT_TAG_OPTIONS,
  stockAdjustmentToInput,
  updateStockAdjustment,
  WAREHOUSE_OPTIONS,
  type StockAdjustmentInput
} from "~/data/products";
import { DATE_INPUT_FORMAT, dmyToIso, isoToDmy } from "~/utils/dates";

// ---------------------------------------------------------------------------
// Stock adjustment create/edit, rendered by
// app/pages/products/stock-adjustment/{new,edit/[id]}.vue.
//
// Cloned from jurnal-frontend-app src/pages/stock-adjustments/form/. Not
// ported: barcode scanning (a hardware flow), the transaction-number format
// designer (a settings modal), and the per-line batch/serial pickers — this
// prototype's adjustments are quantity-only.
// ---------------------------------------------------------------------------

const props = defineProps<{ recordId?: number }>();

const route = useRoute();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getStockAdjustmentById(props.recordId) : undefined
);

/** Where the adjustment's value lands. Kept beside the form rather than in the
 *  data module because it is a chart-of-accounts concern the catalogue has no
 *  opinion on. */
const ACCOUNT_OPTIONS = [
  "Inventory Adjustment",
  "Cost of Goods Sold",
  "Work in Process",
  "Marketing Expense"
];

const form = reactive<StockAdjustmentInput>(emptyStockAdjustmentInput());
const dateText = ref("");
/** String mirrors for the editable quantity column, so a half-typed value is
 *  not coerced to 0 under the caret. */
const actualText = reactive<string[]>([]);
const tagKey = ref(0);

const submitted = ref(false);
const isDiscardModalOpen = ref(false);

function seedFromRecord() {
  Object.assign(
    form,
    existing.value ? stockAdjustmentToInput(existing.value) : emptyStockAdjustmentInput()
  );
  // The two Actions-menu entries ("Adjust stock (stock opname)" and "New stock
  // in/out") are one screen with its type preset — same as the source, where
  // both open this form. Only honoured on create; an existing record's type
  // comes from the record.
  if (!existing.value) {
    const wanted = String(route.query.type ?? "");
    if (wanted === "stock_count" || wanted === "in_out") form.adjustmentType = wanted;
  }
  dateText.value = isoToDmy(form.date);
  actualText.splice(0, actualText.length, ...form.lines.map((line) => String(line.actual)));
  tagKey.value++;
}

watch(existing, seedFromRecord, { immediate: true });

const title = computed(() => {
  if (!isEdit.value) return "Record stock adjustment";
  return existing.value ? `Edit ${existing.value.number}` : "Edit stock adjustment";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

const typeHelp = computed(() =>
  form.adjustmentType === "stock_count"
    ? "Counting what is physically there and correcting the system to match."
    : "Recording a deliberate movement in or out, outside a sale or purchase."
);

const totalValue = computed(() => adjustmentTotalValue(form.lines));

/** Only tracked products can be adjusted, and only ones not already on the
 *  sheet — a product listed twice would have two competing actual counts. */
const productOptions = computed(() => {
  const taken = new Set(form.lines.map((line) => line.productId));
  return getProducts().filter(
    (product) => product.trackInventory && !product.isArchived && !taken.has(product.id)
  );
});

function onAddLine(value: unknown) {
  const product = getProductById(Number(value));
  if (!product) return;
  form.lines.push(adjustmentLineForProduct(product));
  actualText.push(String(product.quantity ?? 0));
}

function onActualInput(index: number) {
  const line = form.lines[index];
  if (!line) return;
  const digits = (actualText[index] ?? "").replace(/[^\d]/g, "");
  line.actual = digits ? Number(digits) : 0;
}

function removeLine(index: number) {
  form.lines.splice(index, 1);
  actualText.splice(index, 1);
}

/** Changing warehouse re-reads every line's recorded quantity, because
 *  "recorded" means "recorded in this warehouse" — leaving the old figures
 *  would compare a count taken here against stock held somewhere else. */
function onWarehouseChange() {
  form.lines.forEach((line, index) => {
    const product = getProductById(line.productId);
    if (!product) return;
    line.recorded = product.quantity ?? 0;
    // An untouched line follows its recorded figure; an edited one keeps the
    // number the user typed.
    if ((actualText[index] ?? "") === String(line.actual)) {
      line.actual = line.recorded;
      actualText[index] = String(line.recorded);
    }
  });
}

const tagData = computed(() =>
  form.tags.map((tag) => ({
    id: `tag-${tag}`,
    text: tag,
    value: tag,
    isInvalid: false,
    isReadOnly: false
  }))
);

function onTagsChange(tags: { value?: string; text?: string }[]) {
  form.tags = tags.map((tag) => tag.value ?? tag.text ?? "").filter(Boolean);
}

function signed(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatQuantity(Math.abs(value))}`;
}

const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.warehouse) missing.push("Warehouse");
  if (!dmyToIso(dateText.value)) missing.push("Date");
  if (!form.account) missing.push("Account");
  if (form.lines.length === 0) missing.push("At least one product");
  // An adjustment where nothing differs writes nothing and means nothing.
  else if (form.lines.every((line) => adjustmentDifference(line) === 0)) {
    missing.push("A difference on at least one product");
  }
  return missing;
});

function onSubmit() {
  submitted.value = true;
  if (missingFields.value.length) return;
  const payload: StockAdjustmentInput = {
    ...form,
    date: dmyToIso(dateText.value),
    tags: [...form.tags],
    lines: form.lines.map((line) => ({ ...line }))
  };
  if (isEdit.value && props.recordId != null) {
    updateStockAdjustment(props.recordId, payload);
    navigateTo(`/products/stock-adjustment/${props.recordId}`);
    return;
  }
  const created = createStockAdjustment(payload);
  navigateTo(`/products/stock-adjustment/${created.id}`);
}

const isDirty = computed(() => Boolean(form.lines.length || form.memo.trim() || form.warehouse));

function onCancel() {
  if (isDirty.value) {
    isDiscardModalOpen.value = true;
    return;
  }
  leave();
}

function leave() {
  isDiscardModalOpen.value = false;
  navigateTo(
    isEdit.value && props.recordId
      ? `/products/stock-adjustment/${props.recordId}`
      : "/products?tab=stock_adjustments"
  );
}

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const bannerClass = css({ mb: 6 });
const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 5,
  alignItems: "start",
  mb: 5
});
const runningTotalClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 1,
  textAlign: "right"
});
const radioRowClass = css({ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" });
const memoRowClass = css({ maxWidth: "640px" });
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mb: 4 });

const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
// Proportional, with a min-width floor — fixed px summing past the container
// pushes the trailing remove column out of view.
const colWidths = ["26%", "16%", "17%", "17%", "16%", "8%"];
const lineTableClass = css({ tableLayout: "fixed", width: "100%", minWidth: "880px" });
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word", textAlign: "left" });
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});

const totalsRowClass = css({ display: "flex", justifyContent: "flex-end", mt: 6 });
const totalsColClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: "40%",
  minWidth: "280px"
});
const totalsLineClass = css({ display: "flex", justifyContent: "space-between", gap: 3 });

const actionRowClass = css({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 2,
  mt: 10,
  pt: 6,
  borderTopWidth: "sm",
  borderColor: "gray.100"
});

const notFoundClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  py: 16,
  textAlign: "center"
});
const notFoundTitleClass = css({ fontSize: "lg" });
const notFoundIllustrationClass = css({ width: "180px", height: "auto", mb: 1 });
const notFoundDescClass = css({ maxWidth: "320px" });

const modalTitleClass = css({ fontSize: "lg" });
const modalFooterClass = css({ display: "flex", justifyContent: "flex-end", gap: 2 });
</script>
