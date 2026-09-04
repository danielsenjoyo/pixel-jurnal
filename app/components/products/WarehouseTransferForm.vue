<template>
  <DefaultPageContent
    :title="title"
    breadcrumb="Warehouse transfer list"
    breadcrumb-to="/products?tab=warehouse_transfers"
  >
    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">
        Warehouse transfer not found
      </MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This transaction may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products?tab=warehouse_transfers')">
        Back to Warehouse transfer list
      </MpButton>
    </div>

    <template v-else>
      <MpBanner
        v-if="submitted && missingFields.length"
        id="transfer-form-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="transfer-form-missing-icon" />
        <MpBannerTitle id="transfer-form-missing-title">
          Warehouse transfer can't be saved yet
        </MpBannerTitle>
        <MpBannerDescription id="transfer-form-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <div :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && !form.fromWarehouse">
          <MpFormLabel>From warehouse</MpFormLabel>
          <MpSelect v-model="form.fromWarehouse" is-full-width @update:model-value="onSourceChange">
            <option value="">Select warehouse</option>
            <option v-for="option in WAREHOUSE_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>You must select the source warehouse</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && (!form.toWarehouse || sameWarehouse)">
          <MpFormLabel>To warehouse</MpFormLabel>
          <MpSelect v-model="form.toWarehouse" is-full-width>
            <option value="">Select warehouse</option>
            <option v-for="option in destinationOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>
            {{
              sameWarehouse
                ? "Source and destination must be different"
                : "You must select the destination warehouse"
            }}
          </MpFormErrorMessage>
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
          <MpText size="body-small" color="gray.600">Total transfer</MpText>
          <MpText weight="semiBold" color="dark">
            {{ formatQuantity(totalQuantity) }} unit{{ totalQuantity === 1 ? "" : "s" }}
          </MpText>
        </div>
      </div>

      <div :class="memoRowClass">
        <MpFormControl>
          <MpFormLabel>Memo</MpFormLabel>
          <MpTextarea v-model="form.memo" placeholder="Why this stock is being moved" />
        </MpFormControl>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- The lines. Qty at source is read-only and comes from the catalogue;
           it is also the cap, shown beside the field rather than only enforced
           on submit (docs/patterns/form-page-format.md). -->
      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Products</MpText>
      <MpTableContainer :class="scrollShadowClass">
        <MpTable :class="lineTableClass">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <MpTableHead is-fixed :class="tableHeadClass">
            <MpTableRow>
              <MpTableCell as="th">Product name</MpTableCell>
              <MpTableCell as="th">Qty at source</MpTableCell>
              <MpTableCell as="th">Total transfer</MpTableCell>
              <MpTableCell as="th" />
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="(line, index) in form.lines" :key="line.productId">
              <MpTableCell as="td" :class="wrapCellClass">{{ line.name }}</MpTableCell>
              <MpTableCell as="td" :class="wrapCellClass">
                {{ formatQuantity(line.quantityAtSource) }} {{ line.unit }}
              </MpTableCell>
              <MpTableCell as="td">
                <MpFormControl :is-invalid="submitted && isOverLimit(line)">
                  <MpInput
                    v-model="quantityText[index]"
                    type="text"
                    inputmode="numeric"
                    @update:model-value="onQuantityInput(index)"
                  />
                  <MpFormHelpText>of {{ formatQuantity(line.quantityAtSource) }}</MpFormHelpText>
                </MpFormControl>
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
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>

      <!-- An over-limit line names the product and the number, because the cap
           differs per row — a generic "invalid" can't say which one is over. -->
      <MpText
        v-if="submitted && overLimitLines.length"
        size="body-small"
        color="red.400"
        :class="overLimitClass"
      >
        {{ overLimitLines.join(" · ") }}
      </MpText>

      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton variant="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Transfer" }}
        </MpButton>
      </div>

      <MpModal
        id="transfer-form-discard-modal"
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
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
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
  createWarehouseTransfer,
  emptyWarehouseTransferInput,
  formatQuantity,
  getProductById,
  getProducts,
  getWarehouseTransferById,
  transferLineForProduct,
  updateWarehouseTransfer,
  warehouseTransferToInput,
  WAREHOUSE_OPTIONS,
  type TransferLine,
  type WarehouseTransferInput
} from "~/data/products";
import { DATE_INPUT_FORMAT, dmyToIso, isoToDmy } from "~/utils/dates";

// ---------------------------------------------------------------------------
// Warehouse transfer create/edit, rendered by
// app/pages/products/warehouse-transfer/{new,edit/[id]}.vue.
//
// Cloned from jurnal-frontend-app src/pages/warehouse-transfers/form/. Not
// ported: attachments (no file storage is modelled), and the per-line batch /
// serial pickers.
//
// `/new?from=<id>` seeds the form from an existing transfer — the detail
// page's "Clone warehouse transfer" action. Cloning opens the form rather than
// writing a copy straight away, because the date and quantities still need
// reviewing before the new transfer is committed.
// ---------------------------------------------------------------------------

const props = defineProps<{ recordId?: number }>();

const route = useRoute();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getWarehouseTransferById(props.recordId) : undefined
);
const cloneSource = computed(() => {
  const id = Number(route.query.from);
  return !isEdit.value && id ? getWarehouseTransferById(id) : undefined;
});

const form = reactive<WarehouseTransferInput>(emptyWarehouseTransferInput());
const dateText = ref("");
const quantityText = reactive<string[]>([]);

const submitted = ref(false);
const isDiscardModalOpen = ref(false);

function seedFromRecord() {
  const source = existing.value ?? cloneSource.value;
  Object.assign(form, source ? warehouseTransferToInput(source) : emptyWarehouseTransferInput());
  // A clone is a NEW transfer: it inherits the route and the lines but starts
  // today, not on the original's date.
  if (!existing.value && cloneSource.value) form.date = emptyWarehouseTransferInput().date;
  dateText.value = isoToDmy(form.date);
  quantityText.splice(0, quantityText.length, ...form.lines.map((line) => String(line.quantity)));
}

watch([existing, cloneSource], seedFromRecord, { immediate: true });

const title = computed(() => {
  if (isEdit.value) {
    return existing.value ? `Edit ${existing.value.number}` : "Edit warehouse transfer";
  }
  return cloneSource.value
    ? `Transfer warehouse (from ${cloneSource.value.number})`
    : "Transfer warehouse";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

const sameWarehouse = computed(
  () => Boolean(form.fromWarehouse) && form.fromWarehouse === form.toWarehouse
);

/** A transfer to the warehouse it came from is a no-op, so the source
 *  warehouse is simply not offered as a destination. */
const destinationOptions = computed(() =>
  WAREHOUSE_OPTIONS.filter((option) => option !== form.fromWarehouse)
);

const totalQuantity = computed(() => form.lines.reduce((sum, line) => sum + line.quantity, 0));

/** Only products the source warehouse actually holds can be moved out of it,
 *  and only ones not already on the sheet. */
const productOptions = computed(() => {
  const taken = new Set(form.lines.map((line) => line.productId));
  return getProducts().filter(
    (product) =>
      product.trackInventory &&
      !product.isArchived &&
      !taken.has(product.id) &&
      (!form.fromWarehouse || product.warehouse === form.fromWarehouse)
  );
});

function onAddLine(value: unknown) {
  const product = getProductById(Number(value));
  if (!product) return;
  form.lines.push(transferLineForProduct(product));
  quantityText.push("");
}

function onQuantityInput(index: number) {
  const line = form.lines[index];
  if (!line) return;
  const digits = (quantityText[index] ?? "").replace(/[^\d]/g, "");
  line.quantity = digits ? Number(digits) : 0;
}

function removeLine(index: number) {
  form.lines.splice(index, 1);
  quantityText.splice(index, 1);
}

/** Changing the source re-reads each line's available quantity, and drops the
 *  ones the new warehouse doesn't hold — carrying them would let the form
 *  transfer stock out of a site that never had it. */
function onSourceChange() {
  if (form.toWarehouse === form.fromWarehouse) form.toWarehouse = "";
  for (let index = form.lines.length - 1; index >= 0; index--) {
    const line = form.lines[index]!;
    const product = getProductById(line.productId);
    if (!product || (form.fromWarehouse && product.warehouse !== form.fromWarehouse)) {
      form.lines.splice(index, 1);
      quantityText.splice(index, 1);
      continue;
    }
    line.quantityAtSource = product.quantity ?? 0;
  }
}

function isOverLimit(line: TransferLine): boolean {
  return line.quantity > line.quantityAtSource;
}

const overLimitLines = computed(() =>
  form.lines
    .filter(isOverLimit)
    .map(
      (line) => `${line.name}: only ${formatQuantity(line.quantityAtSource)} ${line.unit} available`
    )
);

const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.fromWarehouse) missing.push("From warehouse");
  if (!form.toWarehouse) missing.push("To warehouse");
  if (sameWarehouse.value) missing.push("A destination different from the source");
  if (!dmyToIso(dateText.value)) missing.push("Date");
  if (form.lines.length === 0) missing.push("At least one product");
  else if (form.lines.every((line) => line.quantity <= 0)) missing.push("A quantity to transfer");
  if (overLimitLines.value.length) missing.push("Quantities within what the source holds");
  return missing;
});

function onSubmit() {
  submitted.value = true;
  if (missingFields.value.length) return;
  const payload: WarehouseTransferInput = {
    ...form,
    date: dmyToIso(dateText.value),
    // Rows left at zero were added and then thought better of; storing them
    // would put a product on the transfer that nothing moved for.
    lines: form.lines.filter((line) => line.quantity > 0).map((line) => ({ ...line }))
  };
  if (isEdit.value && props.recordId != null) {
    updateWarehouseTransfer(props.recordId, payload);
    navigateTo(`/products/warehouse-transfer/${props.recordId}`);
    return;
  }
  const created = createWarehouseTransfer(payload);
  navigateTo(`/products/warehouse-transfer/${created.id}`);
}

const isDirty = computed(() =>
  Boolean(form.fromWarehouse || form.toWarehouse || form.lines.length || form.memo.trim())
);

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
      ? `/products/warehouse-transfer/${props.recordId}`
      : "/products?tab=warehouse_transfers"
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
const memoRowClass = css({ maxWidth: "640px" });
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mb: 4 });

const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const colWidths = ["38%", "22%", "30%", "10%"];
const lineTableClass = css({ tableLayout: "fixed", width: "100%", minWidth: "720px" });
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word", textAlign: "left" });
const overLimitClass = css({ display: "block", mt: 3 });
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});

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
