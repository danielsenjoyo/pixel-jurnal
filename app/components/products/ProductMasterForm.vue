<template>
  <DefaultPageContent
    :title="title"
    breadcrumb="Product with variant list"
    breadcrumb-to="/products?tab=masters"
  >
    <template v-if="!isEdit" #actions>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">Product with variant</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent>
            <MpPopoverList>
              <MpPopoverListItem role="menuitem" @click="navigateTo('/products/new')">
                Single product
              </MpPopoverListItem>
              <MpPopoverListItem is-active role="menuitem">Product with variant</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </template>
      </MpPopover>
    </template>

    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">
        Product with variant not found
      </MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This product may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products?tab=masters')">
        Back to Product with variant list
      </MpButton>
    </div>

    <template v-else>
      <MpBanner
        v-if="submitted && missingFields.length"
        id="master-form-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="master-form-missing-icon" />
        <MpBannerTitle id="master-form-missing-title">Product can't be saved yet</MpBannerTitle>
        <MpBannerDescription id="master-form-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <!-- Zone A — identity row, with the live variant count as its running
           figure. That number is what the whole variant section produces, and
           it moves with every option added below. -->
      <div :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && !form.name.trim()">
          <MpFormLabel>Main product name</MpFormLabel>
          <MpInput v-model="form.name" placeholder="Enter main product name" />
          <MpFormErrorMessage>Enter a main product name</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Product category</MpFormLabel>
          <MpSelect v-model="form.category" is-full-width>
            <option value="">Select category</option>
            <option v-for="option in PRODUCT_CATEGORIES" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && !form.unit">
          <MpFormLabel>Unit</MpFormLabel>
          <MpSelect v-model="form.unit" is-full-width>
            <option value="">Select unit</option>
            <option v-for="option in UNIT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>Select a unit</MpFormErrorMessage>
        </MpFormControl>

        <div :class="runningTotalClass">
          <MpText size="body-small" color="gray.600">Variants</MpText>
          <MpText weight="semiBold" color="dark">{{ variantCount }}</MpText>
        </div>
      </div>

      <!-- The master's SKU is the stem every variant's own SKU is built from
           ("MST-0001" → "MST-0001-01"), so leaving it blank leaves the whole
           variant list without codes. -->
      <div :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Product code / SKU</MpFormLabel>
          <MpInput v-model="form.code" placeholder="Example: MST-0001" />
          <MpFormHelpText>Each variant's SKU is this code plus its number.</MpFormHelpText>
        </MpFormControl>
        <div />
        <div />
        <div />
      </div>

      <div :class="descriptionRowClass">
        <MpFormControl>
          <MpFormLabel>Description</MpFormLabel>
          <MpTextarea v-model="form.description" placeholder="Describe this product" />
        </MpFormControl>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- Zone B — the variant attributes. Each attribute is a dimension of
           the table below: Size (4 options) × Colour (3) makes 12 variants. -->
      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Product variant</MpText>
      <div v-for="(attribute, index) in form.attributes" :key="index" :class="attributeRowClass">
        <MpFormControl
          :is-invalid="submitted && index === 0 && !attribute.name"
          :class="attributeNameClass"
        >
          <MpFormLabel>Attribute</MpFormLabel>
          <MpSelect
            :model-value="attribute.name"
            is-full-width
            @update:model-value="onAttributeNameChange(index, $event)"
          >
            <option value="">Select attribute</option>
            <option v-for="option in attributeChoicesFor(index)" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>Select an attribute</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl
          :is-invalid="submitted && index === 0 && attribute.options.length === 0"
          :class="attributeOptionsClass"
        >
          <MpFormLabel>Options</MpFormLabel>
          <MpInputTag
            :id="`master-attribute-${index}`"
            :key="`${index}-${attributeKeys[index]}`"
            placeholder="Type an option and press Enter"
            :data="tagDataFor(attribute)"
            :max-row="-1"
            :is-enable-create-new-tag="true"
            @change="onOptionsChange(index, $event)"
          />
          <MpFormErrorMessage>Select at least 1 option</MpFormErrorMessage>
        </MpFormControl>

        <div :class="attributeActionClass">
          <MpButton
            v-if="form.attributes.length > 1"
            variant="ghost"
            size="sm"
            left-icon="minus-circular"
            aria-label="Remove attribute"
            @click="removeAttribute(index)"
          />
        </div>
      </div>

      <!-- Capped at two, as the source caps it. The tooltip carries the reason
           rather than the button silently doing nothing. -->
      <MpTooltip v-if="!canAddAttribute" :label="addAttributeBlockedReason">
        <span :class="addAttributeWrapClass">
          <MpButton variant="secondary" size="sm" is-disabled>Add attribute</MpButton>
        </span>
      </MpTooltip>
      <MpButton v-else variant="secondary" size="sm" @click="addAttribute">Add attribute</MpButton>

      <MpDivider variant="dashed" :class="dividerClass" />

      <div :class="switchRowClass">
        <MpCheckbox id="master-is-buy" :is-checked="form.isBuy" @change="form.isBuy = !form.isBuy">
          I buy this item
        </MpCheckbox>
        <MpCheckbox
          id="master-is-sell"
          :is-checked="form.isSell"
          @change="form.isSell = !form.isSell"
        >
          I sell this item
        </MpCheckbox>
        <MpCheckbox
          id="master-track"
          :is-checked="form.trackInventory"
          @change="form.trackInventory = !form.trackInventory"
        >
          Track stock for this item
        </MpCheckbox>
      </div>

      <!-- Zone C — price & stock. One set of figures applies to every variant.
           The source offers the same thing as an explicit "Set prices &
           minimum stock limit at once" shortcut over a per-variant table; the
           per-variant override isn't modelled here, so these fields simply
           ARE the shortcut, and the caption says so. -->
      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Price &amp; stock</MpText>
      <!-- Before any attribute is set there is no count to name, and "all 0
           variants" reads as an error rather than an empty start. -->
      <MpText size="body-small" color="gray.600" :class="sectionCaptionClass">
        {{
          variantCount
            ? `These apply to all ${variantCount} variant${variantCount === 1 ? "" : "s"}.`
            : "These apply to every variant this product creates."
        }}
      </MpText>

      <div v-if="form.isBuy" :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Unit buy price</MpFormLabel>
          <div @focusout="onMoneyBlur('buyPrice')">
            <MpInputGroup>
              <MpInputLeftAddon>Rp</MpInputLeftAddon>
              <MpInput
                v-model="money.buyPrice"
                type="text"
                inputmode="decimal"
                @update:model-value="onMoneyInput('buyPrice')"
              />
            </MpInputGroup>
          </div>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && form.isBuy && !form.buyAccount">
          <MpFormLabel>Purchases account</MpFormLabel>
          <MpSelect v-model="form.buyAccount" is-full-width>
            <option value="">Select account</option>
            <option v-for="option in BUY_ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>Select a purchases account</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Default buy tax</MpFormLabel>
          <MpSelect v-model="form.buyTax" is-full-width>
            <option v-for="option in TAX_OPTIONS" :key="option || 'none'" :value="option">
              {{ option || "No tax" }}
            </option>
          </MpSelect>
        </MpFormControl>
        <div />
      </div>

      <div v-if="form.isSell" :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Unit sell price</MpFormLabel>
          <div @focusout="onMoneyBlur('sellPrice')">
            <MpInputGroup>
              <MpInputLeftAddon>Rp</MpInputLeftAddon>
              <MpInput
                v-model="money.sellPrice"
                type="text"
                inputmode="decimal"
                @update:model-value="onMoneyInput('sellPrice')"
              />
            </MpInputGroup>
          </div>
        </MpFormControl>

        <MpFormControl is-required :is-invalid="submitted && form.isSell && !form.sellAccount">
          <MpFormLabel>Sales account</MpFormLabel>
          <MpSelect v-model="form.sellAccount" is-full-width>
            <option value="">Select account</option>
            <option v-for="option in SELL_ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>Select a sales account</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Default sell tax</MpFormLabel>
          <MpSelect v-model="form.sellTax" is-full-width>
            <option v-for="option in TAX_OPTIONS" :key="option || 'none'" :value="option">
              {{ option || "No tax" }}
            </option>
          </MpSelect>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Discount account</MpFormLabel>
          <MpSelect v-model="form.sellDiscountAccount" is-full-width>
            <option value="">No discount account</option>
            <option v-for="option in SELL_ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
        </MpFormControl>
      </div>

      <div v-if="form.trackInventory" :class="gridClass">
        <MpFormControl
          is-required
          :is-invalid="submitted && form.trackInventory && !form.inventoryAccount"
        >
          <MpFormLabel>Default inventory account</MpFormLabel>
          <MpSelect v-model="form.inventoryAccount" is-full-width>
            <option value="">Select account</option>
            <option v-for="option in INVENTORY_ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
          <MpFormErrorMessage>Select an inventory account</MpFormErrorMessage>
          <MpFormHelpText>Opening quantity can be recorded through stock adjustment</MpFormHelpText>
        </MpFormControl>
        <div />
        <div />
        <div />
      </div>

      <!-- A preview of what will be created. Read-only: the variants are
           derived from the attributes above, so the only way to change this
           table is to change them (which is why the source resets it whenever
           an attribute changes). -->
      <template v-if="previewVariants.length">
        <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">
          Product variant list
        </MpText>
        <MpTableContainer :class="scrollShadowClass">
          <MpTable :class="previewTableClass">
            <MpTableHead is-fixed :class="tableHeadClass">
              <MpTableRow>
                <MpTableCell as="th">Variant name</MpTableCell>
                <MpTableCell as="th" :class="numCellClass">Unit buy price</MpTableCell>
                <MpTableCell as="th" :class="numCellClass">Unit sell price</MpTableCell>
              </MpTableRow>
            </MpTableHead>
            <MpTableBody>
              <MpTableRow v-for="variant in previewVariants" :key="variant">
                <MpTableCell as="td" :class="wrapCellClass">{{ variant }}</MpTableCell>
                <MpTableCell as="td" :class="[wrapCellClass, numCellClass]">
                  {{ form.isBuy ? formatAmount(form.buyPrice) : "—" }}
                </MpTableCell>
                <MpTableCell as="td" :class="[wrapCellClass, numCellClass]">
                  {{ form.isSell ? formatAmount(form.sellPrice) : "—" }}
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
        </MpTableContainer>
        <MpText
          v-if="previewTruncated"
          size="body-small"
          color="gray.600"
          :class="sectionCaptionClass"
        >
          Showing the first {{ PREVIEW_LIMIT }} of {{ variantCount }} variants.
        </MpText>
      </template>

      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton variant="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Save" }}
        </MpButton>
      </div>

      <MpModal
        id="master-form-discard-modal"
        :is-open="isDiscardModalOpen"
        size="sm"
        @close="isDiscardModalOpen = false"
      >
        <MpModalOverlay />
        <MpModalContent>
          <MpModalHeader>
            <span :class="modalTitleClass">Leave this page?</span>
            <MpModalCloseButton />
          </MpModalHeader>
          <MpModalBody>
            <MpText size="body" color="gray.700">{{ leaveModalBody }}</MpText>
          </MpModalBody>
          <MpModalFooter>
            <div :class="modalFooterClass">
              <MpButton variant="ghost" @click="isDiscardModalOpen = false">Keep editing</MpButton>
              <MpButton variant="primary" @click="leave">Leave</MpButton>
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
  MpCheckbox,
  MpDivider,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
  MpFormLabel,
  MpInput,
  MpInputGroup,
  MpInputLeftAddon,
  MpInputTag,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpSelect,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText,
  MpTextarea,
  MpTooltip
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  BUY_ACCOUNT_OPTIONS,
  createProductMaster,
  emptyProductMasterInput,
  formatAmount,
  getProductMasterById,
  INVENTORY_ACCOUNT_OPTIONS,
  MAX_VARIANT_ATTRIBUTES,
  parseAmount,
  PRODUCT_CATEGORIES,
  productMasterToInput,
  SELL_ACCOUNT_OPTIONS,
  TAX_OPTIONS,
  UNIT_OPTIONS,
  updateProductMaster,
  usableAttributes,
  VARIANT_ATTRIBUTE_OPTIONS,
  variantCountFor,
  type ProductMasterInput
} from "~/data/products";

// ---------------------------------------------------------------------------
// The product-with-variant create/edit form, rendered by both
// app/pages/products/master/new.vue and .../master/edit/[id].vue.
//
// Cloned from jurnal-frontend-app src/pages/products/master-form/. The one
// deliberate simplification: the source's variant table is editable per row
// (each variant can carry its own SKU, barcode, prices and minimum stock),
// with a "Set prices & minimum stock limit at once" shortcut above it. Here
// the shortcut IS the model — one price set applies to every variant — and the
// table below is a read-only preview of what will be created. Per-variant
// overrides would need a variant record of its own to write into, which is a
// data-model change rather than a screen.
// ---------------------------------------------------------------------------

const props = defineProps<{ recordId?: number }>();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getProductMasterById(props.recordId) : undefined
);

const form = reactive<ProductMasterInput>(emptyProductMasterInput());

type MoneyKey = "buyPrice" | "sellPrice";
const money = reactive<Record<MoneyKey, string>>({ buyPrice: "", sellPrice: "" });

/** MpInputTag owns its chip list internally, so each editor is re-mounted via
 *  its key whenever the options are replaced from outside (seeding, removing
 *  an attribute). Without it the model clears while the chips stay on screen. */
const attributeKeys = ref<number[]>([0, 0]);

const submitted = ref(false);
const isDiscardModalOpen = ref(false);

function seedFromRecord() {
  Object.assign(
    form,
    existing.value ? productMasterToInput(existing.value) : emptyProductMasterInput()
  );
  money.buyPrice = form.buyPrice ? formatAmount(form.buyPrice) : "";
  money.sellPrice = form.sellPrice ? formatAmount(form.sellPrice) : "";
  if (form.attributes.length === 0) form.attributes.push({ name: "", options: [] });
  attributeKeys.value = form.attributes.map((_, index) => index + 1);
}

watch(existing, seedFromRecord, { immediate: true });

const title = computed(() => {
  if (!isEdit.value) return "Add new product with variant";
  return existing.value ? `Edit ${existing.value.name}` : "Edit product with variant";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

// ---- Attributes ---------------------------------------------------------

const variantCount = computed(() => variantCountFor(form.attributes));

const canAddAttribute = computed(() => {
  if (form.attributes.length >= MAX_VARIANT_ATTRIBUTES) return false;
  // The source's rule: fill the one you have before asking for another.
  return form.attributes.every((attribute) => attribute.name && attribute.options.length > 0);
});

const addAttributeBlockedReason = computed(() =>
  form.attributes.length >= MAX_VARIANT_ATTRIBUTES
    ? `You have reached the addition limits of ${MAX_VARIANT_ATTRIBUTES} attributes.`
    : "Select an attribute and at least 1 option before adding another."
);

/** An attribute can't be used twice on the same master — the source toasts
 *  "Attribute already selected"; not offering it is quieter. */
function attributeChoicesFor(index: number): string[] {
  const taken = form.attributes
    .filter((_, i) => i !== index)
    .map((attribute) => attribute.name)
    .filter(Boolean);
  return VARIANT_ATTRIBUTE_OPTIONS.filter((option) => !taken.includes(option));
}

function tagDataFor(attribute: { options: string[] }) {
  return attribute.options.map((option) => ({
    id: `option-${option}`,
    text: option,
    value: option,
    isInvalid: false,
    isReadOnly: false
  }));
}

function onAttributeNameChange(index: number, value: unknown) {
  const attribute = form.attributes[index];
  if (attribute) attribute.name = typeof value === "string" ? value : "";
}

function onOptionsChange(index: number, tags: { value?: string; text?: string }[]) {
  const attribute = form.attributes[index];
  if (!attribute) return;
  attribute.options = tags.map((tag) => tag.value ?? tag.text ?? "").filter(Boolean);
}

function addAttribute() {
  form.attributes.push({ name: "", options: [] });
  attributeKeys.value.push(attributeKeys.value.length + 1);
}

function removeAttribute(index: number) {
  form.attributes.splice(index, 1);
  attributeKeys.value.splice(index, 1);
}

// ---- Variant preview ----------------------------------------------------

/** Cap the preview: a two-attribute master can reach dozens of rows, and a
 *  form is not the place to render all of them. */
const PREVIEW_LIMIT = 12;

const previewVariants = computed(() => {
  const usable = usableAttributes(form.attributes);
  if (usable.length === 0 || !form.name.trim()) return [];
  const combinations = usable.reduce<string[][]>(
    (rows, attribute) => rows.flatMap((row) => attribute.options.map((option) => [...row, option])),
    [[]]
  );
  return combinations
    .slice(0, PREVIEW_LIMIT)
    .map((options) => `${form.name.trim()} - ${options.join(" / ")}`);
});

const previewTruncated = computed(() => variantCount.value > PREVIEW_LIMIT);

// ---- Money mirrors ------------------------------------------------------

function onMoneyInput(key: MoneyKey) {
  form[key] = parseAmount(money[key]);
}

function onMoneyBlur(key: MoneyKey) {
  money[key] = form[key] ? formatAmount(form[key]) : "";
}

// ---- Validation ---------------------------------------------------------

const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.name.trim()) missing.push("Main product name");
  if (!form.unit) missing.push("Unit");
  if (usableAttributes(form.attributes).length === 0) missing.push("Attribute and options");
  if (form.isBuy && !form.buyAccount) missing.push("Purchases account");
  if (form.isSell && !form.sellAccount) missing.push("Sales account");
  if (form.trackInventory && !form.inventoryAccount) missing.push("Default inventory account");
  return missing;
});

function onSubmit() {
  submitted.value = true;
  if (missingFields.value.length) return;

  if (isEdit.value && props.recordId != null) {
    updateProductMaster(props.recordId, snapshot());
    navigateTo(`/products/master/${props.recordId}`);
    return;
  }
  const created = createProductMaster(snapshot());
  navigateTo(`/products/master/${created.id}`);
}

/** A plain, detached copy — `form` is a reactive proxy, and the writers keep
 *  what they are given. */
function snapshot(): ProductMasterInput {
  return {
    ...form,
    attributes: form.attributes.map((attribute) => ({
      name: attribute.name,
      options: [...attribute.options]
    })),
    tags: [...form.tags]
  };
}

const isDirty = computed(() =>
  Boolean(
    form.name.trim() ||
    form.description.trim() ||
    form.category ||
    form.unit ||
    usableAttributes(form.attributes).length
  )
);

/** Leave-page body copy: "Information you entered" when creating (no prior
 *  state), "Your changes" when editing — mekari-product-writing →
 *  component-patterns.md § Modal. */
const leaveModalBody = computed(() =>
  isEdit.value ? "Your changes will not be saved." : "Information you entered will not be saved."
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
    isEdit.value && props.recordId ? `/products/master/${props.recordId}` : "/products?tab=masters"
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
const descriptionRowClass = css({ maxWidth: "640px" });
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mt: 8, mb: 4 });
const sectionCaptionClass = css({ display: "block", mb: 4 });
const switchRowClass = css({ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" });

// The attribute rows keep the page's column rhythm: name and options take two
// of the four columns, the remove button the last.
const attributeRowClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 5,
  alignItems: "start",
  mb: 4
});
const attributeNameClass = css({ gridColumn: "span 1" });
const attributeOptionsClass = css({ gridColumn: "span 2" });
const attributeActionClass = css({ display: "flex", alignItems: "center", pt: 6 });
const addAttributeWrapClass = css({ display: "inline-flex" });

const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const previewTableClass = css({ tableLayout: "auto", width: "full", minWidth: "560px" });
const numCellClass = css({ textAlign: "right" });
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word", textAlign: "left" });
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
