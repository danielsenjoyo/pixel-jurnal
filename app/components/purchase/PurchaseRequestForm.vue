<template>
  <DefaultPageContent :title="pageTitle" breadcrumb="Purchases" breadcrumb-to="/purchase">
    <template v-if="!isEdit" #actions>
      <div :class="typeSelectClass">
        <MpSelect :model-value="'request'" is-full-width @update:model-value="onTypeSwitch">
          <option v-for="opt in TYPE_SWITCH_OPTIONS" :key="opt.type" :value="opt.type">
            {{ opt.label }}
          </option>
        </MpSelect>
      </div>
    </template>

    <!-- Zones 1-2 — a single flowing 3-column grid, NOT four stacked columns.
         The reference create screen opens with Procurement staff + Email (both
         required) and has no "Requestor" field at all — that only appears on
         the detail page. A Request has no money anywhere: no total in the
         header, no pricing columns, no totals stack. -->
    <div :class="metaGridClass">
      <MpFormControl is-required :is-invalid="submitted && !form.procurementStaff">
        <MpFormLabel>Procurement staff</MpFormLabel>
        <MpSelect v-model="form.procurementStaff" is-full-width>
          <option value="">Select staff</option>
          <option v-for="name in STAFF" :key="name" :value="name">{{ name }}</option>
        </MpSelect>
        <MpFormErrorMessage>Procurement staff is required.</MpFormErrorMessage>
      </MpFormControl>

      <MpFormControl is-required :is-invalid="submitted && !form.requestorEmail">
        <MpFormLabel>Email</MpFormLabel>
        <MpInput v-model="form.requestorEmail" placeholder="e.g. john@example.com" is-full-width />
        <MpFormErrorMessage>Email is required.</MpFormErrorMessage>
      </MpFormControl>

      <div />
      <div />

      <!-- Name + email are one grid cell so they stack in column 1; otherwise
           auto-placement drops the email into column 3 beside the address. -->
      <div :class="stackedPairClass">
        <MpFormControl>
          <MpFormLabel>Vendor name</MpFormLabel>
          <MpAutocomplete
            v-model="form.vendorName"
            label-prop="name"
            value-prop="name"
            :data="VENDOR_OPTIONS"
            placeholder="Select vendor"
            is-searchable
            is-full-width
          />
        </MpFormControl>
        <MpFormControl>
          <MpFormLabel>Vendor email</MpFormLabel>
          <MpInput v-model="emailText" placeholder="e.g. john@example.com" is-full-width />
        </MpFormControl>
      </div>

      <MpFormControl>
        <MpFormLabel>Vendor address</MpFormLabel>
        <MpTextarea v-model="form.vendorAddress" :class="addressFieldClass" is-full-width />
      </MpFormControl>

      <div />
      <div />

      <MpFormControl is-required :is-invalid="submitted && !form.transactionDateIso">
        <MpFormLabel>Transaction date</MpFormLabel>
        <MpDatePicker
          v-model="form.transactionDateIso"
          value-type="string"
          :format="DATE_INPUT_FORMAT"
          placeholder="DD/MM/YYYY"
          use-portal
        />
      </MpFormControl>

      <MpFormControl>
        <MpFormLabel>Due date</MpFormLabel>
        <MpDatePicker
          v-model="form.dueDateIso"
          value-type="string"
          :format="DATE_INPUT_FORMAT"
          placeholder="DD/MM/YYYY"
          use-portal
        />
      </MpFormControl>

      <MpFormControl is-required :is-invalid="submitted && !form.urgency">
        <MpFormLabel>Urgency level</MpFormLabel>
        <MpSelect
          :model-value="form.urgency?.priority ?? ''"
          is-full-width
          @update:model-value="onUrgencyChange"
        >
          <option value="">Select urgency</option>
          <option v-for="u in URGENCY_OPTIONS" :key="u.priority" :value="u.priority">
            {{ u.label }}
          </option>
        </MpSelect>
        <MpFormErrorMessage>Urgency level is required.</MpFormErrorMessage>
      </MpFormControl>

      <div />

      <MpFormControl :is-disabled="isEdit">
        <MpFormLabel>
          <span :class="labelWithIconClass">
            Transaction no.
            <MpTooltip label="Set the transaction number format">
              <MpIcon name="settings" size="sm" color="gray.600" />
            </MpTooltip>
          </span>
        </MpFormLabel>
        <MpInput v-model="form.transactionNo" :placeholder="isEdit ? '' : '[Auto]'" is-full-width />
      </MpFormControl>

      <MpFormControl>
        <MpFormLabel>Related budget year</MpFormLabel>
        <MpInput v-model="form.relatedBudgetYear" is-full-width />
      </MpFormControl>

      <MpFormControl>
        <MpFormLabel>Tags</MpFormLabel>
        <MpSelect :model-value="''" is-full-width @update:model-value="addTag">
          <option value="">Choose tag</option>
          <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
        </MpSelect>
        <MpFlex v-if="form.tags.length" gap="2" wrap="wrap" :class="tagListClass">
          <MpTag
            v-for="tag in form.tags"
            :key="tag"
            variant="gray"
            size="sm"
            is-closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </MpTag>
        </MpFlex>
      </MpFormControl>
    </div>

    <!-- Zone 3 — items. Four columns only: what's wanted and how much of it.
         No unit price, discount, tax or amount. -->
    <MpTableContainer :class="scrollShadowClass">
      <MpTable :class="itemsTableClass">
        <colgroup>
          <col :style="{ width: '30%' }" />
          <col :style="{ width: '40%' }" />
          <col :style="{ width: '12%' }" />
          <col :style="{ width: '18%' }" />
          <col :style="{ width: '40px' }" />
        </colgroup>
        <MpTableHead :class="itemsHeadClass">
          <MpTableRow>
            <MpTableCell as="th">Product</MpTableCell>
            <MpTableCell as="th">Description</MpTableCell>
            <MpTableCell as="th">Qty</MpTableCell>
            <MpTableCell as="th">Units</MpTableCell>
            <MpTableCell as="th" />
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="(line, index) in form.lines" :key="line.key">
            <MpTableCell as="td" :class="lineCellClass">
              <MpSelect v-model="line.product" is-full-width @change="applyProduct(index)">
                <option value="">Select product</option>
                <option v-for="p in PRODUCT_OPTIONS" :key="p.name" :value="p.name">
                  {{ p.name }}
                </option>
              </MpSelect>
            </MpTableCell>
            <MpTableCell as="td" :class="lineCellClass">
              <MpTextarea
                v-model="line.description"
                placeholder="Enter description"
                rows="1"
                is-full-width
              />
            </MpTableCell>
            <MpTableCell as="td" :class="lineCellClass">
              <MpInput v-model.number="line.quantity" type="number" is-full-width />
            </MpTableCell>
            <MpTableCell as="td" :class="lineCellClass">
              <MpSelect v-model="line.unit" :is-disabled="!line.product" is-full-width>
                <option value="">Select unit</option>
                <option v-for="u in unitOptionsFor(line.product)" :key="u" :value="u">
                  {{ u }}
                </option>
              </MpSelect>
            </MpTableCell>
            <MpTableCell as="td" :class="lineCellClass">
              <MpButton
                variant="ghost"
                size="sm"
                left-icon="minus-circular"
                aria-label="Remove line"
                @click="removeLine(index)"
              />
            </MpTableCell>
          </MpTableRow>

          <MpTableRow>
            <MpTableCell as="td" :class="lineCellClass">
              <MpSelect :model-value="''" is-full-width @update:model-value="addLineFromProduct">
                <option value="">Select product</option>
                <option v-for="p in PRODUCT_OPTIONS" :key="p.name" :value="p.name">
                  {{ p.name }}
                </option>
              </MpSelect>
            </MpTableCell>
            <MpTableCell v-for="n in 4" :key="n" as="td" :class="lineCellClass" />
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <MpFormControl v-if="submitted && !hasValidLine" :is-invalid="true" :class="lineErrorClass">
      <MpFormErrorMessage>Add at least one line with a product and quantity.</MpFormErrorMessage>
    </MpFormControl>

    <!-- Zone 4 — notes/attachments, and a total-items card in place of the
         money types' totals stack. -->
    <div :class="bottomRowClass">
      <div :class="notesColClass">
        <MpFormControl>
          <MpFormLabel>Message</MpFormLabel>
          <MpTextarea v-model="form.message" placeholder="Message" is-full-width />
        </MpFormControl>
        <MpFormControl>
          <MpFormLabel>Memo</MpFormLabel>
          <MpTextarea v-model="form.memo" placeholder="Memo" is-full-width />
        </MpFormControl>
        <MpFormControl>
          <MpFormLabel>Attachments</MpFormLabel>
          <MpUpload
            placeholder="or drag & drop file here"
            accept=".xlsx,.xls,.doc,.docx,.pdf,.jpg,.jpeg,.png,.zip"
            is-multiple
            is-full-width
            @change="onAttachmentChange"
          />
          <MpFormHelpText
            >Files can be Excel, Word, PDF, JPG, PNG, or ZIP (maximum 5 files and 10 MB per
            file).</MpFormHelpText
          >
        </MpFormControl>
      </div>

      <div :class="totalsColClass">
        <div :class="totalItemsCardClass">
          <MpText weight="semiBold" color="dark">Total items</MpText>
          <MpText weight="semiBold" color="dark">{{ totalItems }} Items</MpText>
        </div>
      </div>
    </div>

    <div v-if="submitted && !isValid" :class="validationSummaryClass">
      <MpBanner variant="danger" is-inline>
        <MpBannerIcon />
        <MpBannerDescription>
          {{
            missingFields.length === 1
              ? "One thing is still missing:"
              : `${missingFields.length} things are still missing:`
          }}
          {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>
    </div>

    <div :class="actionBarClass">
      <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
      <MpButton v-if="isEdit" variant="primary" @click="onSubmit()">Save changes</MpButton>
      <MpButton v-else variant="primary" @click="onSubmit()">Create request</MpButton>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  css,
  MpAutocomplete,
  MpBanner,
  MpBannerDescription,
  MpBannerIcon,
  MpButton,
  MpDatePicker,
  MpFlex,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
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
  MpTag,
  MpText,
  MpTextarea,
  MpTooltip,
  MpUpload
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  PRODUCT_OPTIONS,
  STAFF,
  TAG_OPTIONS,
  TRANSACTION_TYPE_LABEL,
  TYPE_CAPABILITIES,
  URGENCY_OPTIONS,
  VENDOR_OPTIONS,
  createTransaction,
  emptyTransactionInput,
  getTransactionOfType,
  updateTransaction,
  type PurchaseTransaction,
  type PurchaseTransactionInput,
  type TransactionType
} from "~/data/purchase-transactions";
import { DATE_INPUT_FORMAT, toDmy, dmyToIso, isoToDmy } from "~/utils/dates";

// ---------------------------------------------------------------------------
// Create/edit for a Purchase Request. Its own component rather than a variant
// of PurchaseTransactionForm because the field set genuinely differs — no
// money anywhere, plus requestor/urgency/budget-year fields no other type has.
// That's the same split the reference app makes (requests/new_and_edit.vue is
// a separate file from the shared purchases/new_and_edit.vue).
//
// Zones mirror the Request DETAIL page so the read and edit views correspond
// field for field — see docs/patterns/form-page-format.md.
// ---------------------------------------------------------------------------

const props = defineProps<{ recordId?: number }>();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getTransactionOfType(props.recordId, "request") : undefined
);

const TYPE_SWITCH_OPTIONS: { type: TransactionType; label: string }[] = [
  { type: "invoice", label: TRANSACTION_TYPE_LABEL.invoice },
  { type: "join_invoice", label: TRANSACTION_TYPE_LABEL.join_invoice },
  { type: "order", label: TRANSACTION_TYPE_LABEL.order },
  { type: "quote", label: TRANSACTION_TYPE_LABEL.quote },
  { type: "request", label: TRANSACTION_TYPE_LABEL.request },
  { type: "delivery", label: TRANSACTION_TYPE_LABEL.delivery }
];
function onTypeSwitch(next: unknown) {
  const type = String(next ?? "") as TransactionType;
  if (!type || type === "request") return;
  navigateTo(`/purchase/${TYPE_CAPABILITIES[type].route}/new`);
}

interface LineForm {
  key: number;
  product: string;
  description: string;
  quantity: number;
  unit: string;
}
let lineKeySeq = 0;
function blankLine(): LineForm {
  lineKeySeq += 1;
  return { key: lineKeySeq, product: "", description: "", quantity: 1, unit: "" };
}

const form = reactive({
  // NB: no `requestorName`. The reference create screen has no Requestor field
  // — it collects the procurement staff and their email. Requestor only shows
  // on the detail page (for records that came from elsewhere), so a request
  // created here leaves it blank rather than inventing a value.
  requestorEmail: "",
  urgency:
    URGENCY_OPTIONS.find((u) => u.priority === "medium") ??
    (null as PurchaseTransaction["urgency"]),
  procurementStaff: "",
  vendorName: "",
  vendorAddress: "",
  transactionDateIso: toDmy(new Date()),
  dueDateIso: "",
  transactionNo: "",
  relatedBudgetYear: "",
  tags: [] as string[],
  message: "",
  memo: "",
  lines: [] as LineForm[]
});
const emailText = ref("");
const attachments = ref<string[]>([]);
const submitted = ref(false);

const GENERIC_UNITS = ["pcs", "pack", "set", "roll", "box", "Gram", "ml"];

function loadFromExisting() {
  const r = existing.value;
  if (!r) return;
  form.requestorEmail = r.requestorEmail;
  form.urgency = r.urgency;
  form.procurementStaff = r.procurementStaff;
  form.vendorName = r.vendorName;
  form.vendorAddress = r.vendorAddress;
  form.transactionDateIso = isoToDmy(r.transactionDateSort);
  form.dueDateIso = isoToDmy(r.dueDateSort);
  form.transactionNo = r.number;
  form.relatedBudgetYear = r.relatedBudgetYear;
  form.tags = [...r.tags];
  form.message = r.message;
  form.memo = r.memo;
  form.lines = r.lines.map((l) => ({
    key: ++lineKeySeq,
    product: l.product,
    description: l.description,
    quantity: l.quantity,
    unit: l.unit
  }));
  emailText.value = r.email.join(", ");
  attachments.value = [...r.attachments];
}
watch(existing, loadFromExisting, { immediate: true });

const pageTitle = computed(() =>
  isEdit.value
    ? `Edit ${existing.value?.number ?? TRANSACTION_TYPE_LABEL.request}`
    : `Create ${TRANSACTION_TYPE_LABEL.request}`
);

watch(
  () => form.vendorName,
  (name) => {
    const vendor = VENDOR_OPTIONS.find((v) => v.name === name);
    if (vendor) form.vendorAddress = vendor.address;
  }
);

function onUrgencyChange(next: unknown) {
  const priority = String(next ?? "");
  form.urgency = URGENCY_OPTIONS.find((u) => u.priority === priority) ?? null;
}

const availableTags = computed(() => TAG_OPTIONS.filter((t) => !form.tags.includes(t)));
function addTag(tag: unknown) {
  const value = String(tag ?? "");
  if (value && !form.tags.includes(value)) form.tags.push(value);
}
function removeTag(tag: string) {
  form.tags = form.tags.filter((t) => t !== tag);
}

function unitOptionsFor(productName: string): string[] {
  const canonical = PRODUCT_OPTIONS.find((p) => p.name === productName)?.unit;
  return [...new Set([canonical, ...GENERIC_UNITS].filter(Boolean) as string[])];
}
function addLineFromProduct(product: unknown) {
  const name = String(product ?? "");
  if (!name) return;
  const line = blankLine();
  line.product = name;
  form.lines.push(line);
  applyProduct(form.lines.length - 1);
}
function removeLine(index: number) {
  form.lines.splice(index, 1);
}
function applyProduct(index: number) {
  const line = form.lines[index];
  if (!line) return;
  const product = PRODUCT_OPTIONS.find((p) => p.name === line.product);
  if (!product) return;
  line.unit = product.unit;
  if (!line.description) line.description = product.name;
}
function onAttachmentChange(event: Event) {
  const files = (event.target as HTMLInputElement)?.files;
  attachments.value = files ? [...files].map((f) => f.name) : [];
}

const totalItems = computed(() =>
  form.lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0)
);
const hasValidLine = computed(() => form.lines.some((l) => l.product && l.quantity > 0));
const isValid = computed(
  () =>
    Boolean(
      form.procurementStaff && form.requestorEmail && form.transactionDateIso && form.urgency
    ) && hasValidLine.value
);
const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.procurementStaff) missing.push("Procurement staff");
  if (!form.requestorEmail) missing.push("Email");
  if (!form.transactionDateIso) missing.push("Transaction date");
  if (!form.urgency) missing.push("Urgency level");
  if (!hasValidLine.value) missing.push("at least one line with a product and quantity");
  return missing;
});

function buildInput(): PurchaseTransactionInput {
  return {
    ...emptyTransactionInput(),
    vendorName: form.vendorName,
    vendorAddress: form.vendorAddress,
    email: emailText.value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
    transactionDateIso: dmyToIso(form.transactionDateIso),
    dueDateIso: dmyToIso(form.dueDateIso),
    transactionNo: form.transactionNo,
    tags: form.tags,
    attachments: attachments.value,
    message: form.message,
    memo: form.memo,
    procurementStaff: form.procurementStaff,
    requestorEmail: form.requestorEmail,
    urgency: form.urgency,
    relatedBudgetYear: form.relatedBudgetYear,
    // Quantities only — createTransaction drops price/tax for a non-money type.
    lines: form.lines
      .filter((l) => l.product && l.quantity > 0)
      .map((l) => ({
        product: l.product,
        description: l.description,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: 0,
        discountPercent: 0,
        tax: ""
      }))
  };
}

function onSubmit() {
  submitted.value = true;
  if (!isValid.value) return;
  const input = buildInput();
  if (isEdit.value && props.recordId != null) {
    const updated = updateTransaction(props.recordId, input);
    navigateTo(`/purchase/request/${updated?.id ?? props.recordId}`);
    return;
  }
  const created = createTransaction("request", input);
  navigateTo(`/purchase/request/${created.id}`);
}

function onCancel() {
  if (isEdit.value && props.recordId != null) navigateTo(`/purchase/request/${props.recordId}`);
  else navigateTo("/purchase");
}

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const typeSelectClass = css({ width: "200px" });
// One flowing grid of FOUR columns, with the fourth deliberately left empty —
// fields fill left-to-right rather than being grouped into per-column stacks.
// Four (not three) because the reference keeps these fields exactly as wide as
// the ones above them; `repeat(3, 1fr)` makes each ~33% wider and runs the
// block to the right edge, which reads as a different layout. Empty `<div />`
// cells are how a row stops early.
const metaGridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 6,
  alignItems: "start"
});
const stackedPairClass = css({ display: "flex", flexDirection: "column", gap: 5 });
const addressFieldClass = css({ "& textarea": { minHeight: "120px" } });
const labelWithIconClass = css({ display: "inline-flex", alignItems: "center", gap: 1 });
const tagListClass = css({ mt: 2 });

const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});
const itemsTableClass = css({ tableLayout: "fixed", width: "full", minWidth: "760px", mt: 8 });
const itemsHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const lineCellClass = css({ verticalAlign: "top" });
const lineErrorClass = css({ mt: 2 });

const bottomRowClass = css({
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap",
  mt: 8
});
const notesColClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 5,
  width: "25%",
  minWidth: "260px"
});
const totalsColClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  width: "50%",
  minWidth: "320px"
});
const totalItemsCardClass = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 3,
  borderWidth: "sm",
  borderColor: "gray.100",
  rounded: "md",
  px: 5,
  py: 4
});

const validationSummaryClass = css({ display: "flex", justifyContent: "flex-end", mt: 8 });
const actionBarClass = css({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 2,
  mt: 8
});
</script>
