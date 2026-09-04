<template>
  <DefaultPageContent :title="title" breadcrumb="Product list" breadcrumb-to="/products">
    <!-- The title band holds the record-TYPE switch, not the commit buttons —
         those live at the bottom right (docs/patterns/form-page-format.md).
         Switching navigates rather than mutating: a product with variants is a
         different record with a different field set, so carrying half-filled
         state across would produce something never reviewed as that type.
         Hidden in edit mode — an existing product's kind is fixed. -->
    <template v-if="!isEdit" #actions>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">Single product</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent>
            <MpPopoverList>
              <MpPopoverListItem is-active role="menuitem">Single product</MpPopoverListItem>
              <MpPopoverListItem role="menuitem" @click="navigateTo('/products/master/new')">
                Product with variant
              </MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </template>
      </MpPopover>
    </template>

    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">Product not found</MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This product may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products')">Back to Product list</MpButton>
    </div>

    <template v-else>
      <!-- A commit attempt that failed needs to say what is outstanding in one
           place: some failures (an empty bundle, say) have no single field to
           mark red. The per-field messages below appear at the same moment. -->
      <MpBanner
        v-if="submitted && missingFields.length"
        id="product-form-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="product-form-missing-icon" />
        <MpBannerTitle id="product-form-missing-title">Product can't be saved yet</MpBannerTitle>
        <MpBannerDescription id="product-form-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <!-- Zone A — identity row. Same repeat(4, 1fr) rhythm as every section
           below it; a row that stops early pads with empty cells rather than
           re-dividing the width. -->
      <div :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && !form.name.trim()">
          <MpFormLabel>Product name</MpFormLabel>
          <MpInput v-model="form.name" placeholder="Enter product name" />
          <MpFormErrorMessage>Enter a product name</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Product category</MpFormLabel>
          <MpSelect v-model="form.category" is-full-width>
            <option value="">Select product category</option>
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

        <!-- A bundle's cost is the sum of its components, and it moves with
             every row of the table below — so it belongs up here, where the
             user can watch it without scrolling. A single product has no such
             derived figure, so the cell simply stays empty rather than being
             filled with an invented one. -->
        <div :class="runningTotalClass">
          <template v-if="form.isBundle">
            <MpText size="body-small" color="gray.600">Total component price</MpText>
            <MpText weight="semiBold" color="dark">{{ formatCurrency(bundleTotal) }}</MpText>
          </template>
        </div>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- Zone B — meta grid, same 4 columns. -->
      <div :class="gridClass">
        <MpFormControl>
          <MpFormLabel>Product code / SKU</MpFormLabel>
          <MpInput v-model="form.code" placeholder="Example: PRD-0001" />
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Barcode</MpFormLabel>
          <MpInput v-model="form.barcode" placeholder="Example: 8991234500018" />
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Product type</MpFormLabel>
          <MpSelect v-model="productTypeValue" is-full-width>
            <option value="single">Single</option>
            <option value="bundle">Bundle</option>
          </MpSelect>
          <MpFormHelpText>{{ productTypeHelp }}</MpFormHelpText>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Item type</MpFormLabel>
          <MpSelect v-model="form.type" is-full-width>
            <option v-for="option in PRODUCT_TYPE_OPTIONS" :key="option" :value="option">
              {{ PRODUCT_TYPE_LABEL[option] }}
            </option>
          </MpSelect>
        </MpFormControl>
      </div>

      <div :class="descriptionRowClass">
        <MpFormControl>
          <MpFormLabel>Description</MpFormLabel>
          <MpTextarea v-model="form.description" placeholder="Describe this product" />
        </MpFormControl>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- Zone C — the three switches that decide which sections exist below.
           Each one genuinely adds or removes a whole block of the form, which
           is why they sit together above all of them. -->
      <div :class="switchRowClass">
        <MpCheckbox id="product-is-buy" :is-checked="form.isBuy" @change="form.isBuy = !form.isBuy">
          I buy this item
        </MpCheckbox>
        <MpCheckbox
          id="product-is-sell"
          :is-checked="form.isSell"
          @change="form.isSell = !form.isSell"
        >
          I sell this item
        </MpCheckbox>
        <MpCheckbox
          id="product-track"
          :is-checked="form.trackInventory"
          :is-disabled="!canTrack"
          @change="onToggleTrack"
        >
          Track stock for this item
        </MpCheckbox>
      </div>
      <MpText v-if="!canTrack" size="body-small" color="gray.600" :class="switchHelpClass">
        A service has no stock to track.
      </MpText>

      <!-- Buying -->
      <template v-if="form.isBuy">
        <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Buying info</MpText>
        <div :class="gridClass">
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
      </template>

      <!-- Selling -->
      <template v-if="form.isSell">
        <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Selling info</MpText>
        <div :class="gridClass">
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
          <div />
        </div>
      </template>

      <!-- Inventory -->
      <template v-if="form.trackInventory">
        <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Stock info</MpText>
        <div :class="gridClass">
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
            <MpFormHelpText>
              Opening quantity can be recorded through stock adjustment
            </MpFormHelpText>
          </MpFormControl>

          <MpFormControl>
            <MpFormLabel>Minimum stock limit</MpFormLabel>
            <MpInput
              v-model="bufferText"
              type="text"
              inputmode="numeric"
              :placeholder="`0 ${form.unit}`"
            />
          </MpFormControl>

          <MpFormControl>
            <MpFormLabel>Warehouse</MpFormLabel>
            <MpSelect v-model="form.warehouse" is-full-width>
              <option value="">Select warehouse</option>
              <option v-for="option in WAREHOUSE_OPTIONS" :key="option" :value="option">
                {{ option }}
              </option>
            </MpSelect>
          </MpFormControl>
          <div />
        </div>

        <MpFormControl :class="trackingFieldClass">
          <MpFormLabel>Inventory tracking</MpFormLabel>
          <div :class="radioRowClass">
            <MpRadio
              v-for="option in INVENTORY_TRACKING_OPTIONS"
              :id="`tracking-${option}`"
              :key="option"
              v-model="form.inventoryTracking"
              :value="option"
              :is-disabled="form.isBundle && option !== 'qty'"
            >
              {{ INVENTORY_TRACKING_LABEL[option] }}
            </MpRadio>
          </div>
          <MpFormHelpText v-if="form.isBundle">
            You can only track the inventory by qty for product bundles.
          </MpFormHelpText>
        </MpFormControl>
      </template>

      <!-- Bundle components — an editable line-items table. The trailing row
           IS the add affordance: picking a product there appends a real line
           and a fresh placeholder appears. No separate "Add line" button. -->
      <template v-if="form.isBundle">
        <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">
          Bundle components
        </MpText>
        <MpTableContainer :class="scrollShadowClass">
          <MpTable :class="lineTableClass">
            <colgroup>
              <col v-for="(w, i) in lineColWidths" :key="i" :style="{ width: w }" />
            </colgroup>
            <MpTableHead is-fixed :class="tableHeadClass">
              <MpTableRow>
                <MpTableCell as="th">Product name</MpTableCell>
                <MpTableCell as="th">Qty</MpTableCell>
                <MpTableCell as="th">Price</MpTableCell>
                <MpTableCell as="th">Total</MpTableCell>
                <MpTableCell as="th" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody>
              <MpTableRow
                v-for="(line, index) in form.bundleItems"
                :key="`${line.productId}-${index}`"
              >
                <MpTableCell as="td">
                  <MpSelect
                    :model-value="String(line.productId)"
                    is-full-width
                    @update:model-value="onLineProductChange(index, $event)"
                  >
                    <option
                      v-for="option in componentOptions"
                      :key="option.id"
                      :value="String(option.id)"
                    >
                      {{ option.name }}
                    </option>
                  </MpSelect>
                </MpTableCell>
                <MpTableCell as="td">
                  <MpInput
                    :model-value="String(line.quantity)"
                    type="text"
                    inputmode="numeric"
                    :aria-label="`Quantity for ${line.name}`"
                    @update:model-value="onLineQuantityChange(index, $event)"
                  />
                </MpTableCell>
                <MpTableCell as="td">{{ formatAmount(line.price) }}</MpTableCell>
                <MpTableCell as="td">{{ formatAmount(line.price * line.quantity) }}</MpTableCell>
                <MpTableCell as="td">
                  <MpButton
                    variant="ghost"
                    size="sm"
                    left-icon="minus-circular"
                    aria-label="Remove component"
                    @click="removeLine(index)"
                  />
                </MpTableCell>
              </MpTableRow>

              <!-- Trailing placeholder row = the add affordance. -->
              <MpTableRow>
                <MpTableCell as="td">
                  <MpSelect model-value="" is-full-width @update:model-value="onAddLine">
                    <option value="">Select product</option>
                    <option
                      v-for="option in componentOptions"
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
              </MpTableRow>
            </MpTableBody>
          </MpTable>
        </MpTableContainer>
        <div :class="lineTotalRowClass">
          <MpText color="gray.600">Total price</MpText>
          <MpText weight="semiBold" color="dark">{{ formatCurrency(bundleTotal) }}</MpText>
        </div>
      </template>

      <!-- Zone F — commit row, bottom right. Buttons are never disabled on
           validity: a disabled Save can't fire the handler that reveals what
           is missing (docs/patterns/form-page-format.md § Validation). -->
      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton v-if="!isEdit" variant="secondary" @click="onSubmit(true)">
          Save &amp; add new
        </MpButton>
        <MpButton variant="primary" @click="onSubmit(false)">
          {{ isEdit ? "Save changes" : "Save" }}
        </MpButton>
      </div>

      <MpModal
        id="product-form-discard-modal"
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
  BUY_ACCOUNT_OPTIONS,
  createProduct,
  emptyProductInput,
  formatAmount,
  formatCurrency,
  getProductById,
  getProducts,
  INVENTORY_ACCOUNT_OPTIONS,
  INVENTORY_TRACKING_LABEL,
  INVENTORY_TRACKING_OPTIONS,
  parseAmount,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
  productToInput,
  SELL_ACCOUNT_OPTIONS,
  TAX_OPTIONS,
  UNIT_OPTIONS,
  updateProduct,
  WAREHOUSE_OPTIONS,
  type ProductInput
} from "~/data/products";

// ---------------------------------------------------------------------------
// The single-product create/edit form, rendered by both
// app/pages/products/new.vue and app/pages/products/edit/[id].vue — one
// component, two routes, everything that differs keyed off `isEdit`
// (docs/patterns/form-page-format.md).
//
// Cloned from jurnal-frontend-app src/pages/products/form/. Not ported: the
// image uploader, custom fields, unit-conversion rows, the package/role
// paywalls around barcode and tracking types, and the "account already has
// transactions" locks — all of which are entitlement or settings concerns
// rather than shape.
// ---------------------------------------------------------------------------

const props = defineProps<{
  /** Present on the edit route only. Its absence is what `isEdit` reads. */
  recordId?: number;
}>();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getProductById(props.recordId) : undefined
);

const form = reactive<ProductInput>(emptyProductInput());

/** Grouped-string mirrors for the two money fields. Money is parsed on every
 *  keystroke and reformatted only on focusout — reformatting live at two
 *  decimals makes incremental typing impossible ("1" becomes "1,00", the next
 *  keystroke gives "1,002"). */
type MoneyKey = "buyPrice" | "sellPrice";
const money = reactive<Record<MoneyKey, string>>({ buyPrice: "", sellPrice: "" });

/** The minimum-stock field edits a string too, so a half-typed value isn't
 *  coerced to 0 under the caret. */
const bufferText = ref("");

const submitted = ref(false);
const isDiscardModalOpen = ref(false);

function seedFromRecord() {
  Object.assign(form, existing.value ? productToInput(existing.value) : emptyProductInput());
  money.buyPrice = form.buyPrice ? formatAmount(form.buyPrice) : "";
  money.sellPrice = form.sellPrice ? formatAmount(form.sellPrice) : "";
  bufferText.value = form.buffer === null ? "" : String(form.buffer);
}

watch(existing, seedFromRecord, { immediate: true });

const title = computed(() => {
  if (!isEdit.value) return "Add new product";
  return existing.value ? `Edit ${existing.value.name}` : "Edit product";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

/** The Single/Bundle select edits `isBundle`; a writable computed keeps the
 *  boolean as the single source rather than a second string field beside it. */
const productTypeValue = computed({
  get: () => (form.isBundle ? "bundle" : "single"),
  set: (value: string) => {
    form.isBundle = value === "bundle";
    // A bundle can only be tracked by quantity — the source says so outright.
    if (form.isBundle) form.inventoryTracking = "qty";
    if (!form.isBundle) form.bundleItems = [];
  }
});

const productTypeHelp = computed(() =>
  form.isBundle
    ? "Goods or services traded as a package."
    : "Goods or services traded as a unit without addition."
);

/** A service has no stock, so tracking isn't offered for one — and turning the
 *  item type to Service switches it off rather than leaving a stale checkbox. */
const canTrack = computed(() => form.type !== "service");
watch(
  () => form.type,
  () => {
    if (!canTrack.value) form.trackInventory = false;
  }
);

function onToggleTrack() {
  if (!canTrack.value) return;
  form.trackInventory = !form.trackInventory;
}

// ---- Bundle components --------------------------------------------------

/** What can go into a bundle: any tracked, non-bundle product other than the
 *  one being edited. The source blocks batch/serial-tracked components
 *  outright ("The selected product is tracked by batch or serial number"), and
 *  a bundle inside a bundle has no meaning here. */
const componentOptions = computed(() =>
  getProducts().filter(
    (product) =>
      !product.isBundle &&
      !product.isArchived &&
      product.inventoryTracking === "qty" &&
      product.id !== props.recordId
  )
);

const bundleTotal = computed(() =>
  form.bundleItems.reduce((sum, line) => sum + line.price * line.quantity, 0)
);

function onAddLine(value: unknown) {
  const id = Number(value);
  if (!id) return;
  const product = getProductById(id);
  if (!product) return;
  form.bundleItems.push({
    productId: product.id,
    name: product.name,
    quantity: 1,
    // Priced at the component's buy price, which is what the bundle costs to
    // assemble — the same figure the detail page's Bundle info tab totals.
    price: product.buyPrice
  });
}

function onLineProductChange(index: number, value: unknown) {
  const product = getProductById(Number(value));
  const line = form.bundleItems[index];
  if (!product || !line) return;
  line.productId = product.id;
  line.name = product.name;
  line.price = product.buyPrice;
}

function onLineQuantityChange(index: number, value: unknown) {
  const line = form.bundleItems[index];
  if (!line) return;
  const parsed = Number(String(value ?? "").replace(/[^\d]/g, ""));
  line.quantity = Number.isNaN(parsed) ? 0 : parsed;
}

function removeLine(index: number) {
  form.bundleItems.splice(index, 1);
}

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
  if (!form.name.trim()) missing.push("Product name");
  if (!form.unit) missing.push("Unit");
  if (form.isBuy && !form.buyAccount) missing.push("Purchases account");
  if (form.isSell && !form.sellAccount) missing.push("Sales account");
  if (form.trackInventory && !form.inventoryAccount) missing.push("Default inventory account");
  // No single field to mark red for this one, which is exactly why the banner
  // exists alongside the per-field messages.
  if (form.isBundle && form.bundleItems.length === 0) missing.push("Bundle components");
  if (!form.isBuy && !form.isSell) missing.push("I buy this item or I sell this item");
  return missing;
});

function commitBuffer() {
  const digits = bufferText.value.replace(/[^\d]/g, "");
  form.buffer = form.trackInventory && digits ? Number(digits) : form.trackInventory ? 0 : null;
}

function onSubmit(addAnother: boolean) {
  submitted.value = true;
  if (missingFields.value.length) return;
  commitBuffer();

  if (isEdit.value && props.recordId != null) {
    updateProduct(props.recordId, { ...form, bundleItems: [...form.bundleItems] });
    navigateTo(`/products/detail/${props.recordId}`);
    return;
  }

  const created = createProduct({ ...form, bundleItems: [...form.bundleItems] });
  if (addAnother) {
    // "Save & add new" stays on the form with a clean slate, which is the
    // whole point of the button — navigating away would make it identical to
    // Save.
    Object.assign(form, emptyProductInput());
    money.buyPrice = "";
    money.sellPrice = "";
    bufferText.value = "";
    submitted.value = false;
    return;
  }
  navigateTo(`/products/detail/${created.id}`);
}

/** Cancelling a form the user has actually put something into confirms first;
 *  an untouched form just leaves. */
const isDirty = computed(() =>
  Boolean(
    form.name.trim() ||
    form.code.trim() ||
    form.barcode.trim() ||
    form.description.trim() ||
    form.category ||
    form.unit ||
    form.bundleItems.length ||
    form.buyPrice ||
    form.sellPrice
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
  navigateTo(isEdit.value && props.recordId ? `/products/detail/${props.recordId}` : "/products");
}

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const bannerClass = css({ mb: 6 });
// One column rhythm for the whole page: every section is repeat(4, 1fr) and
// pads with empty cells rather than re-dividing the width per section
// (docs/patterns/form-page-format.md).
const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 5,
  alignItems: "start"
});
const runningTotalClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 1,
  textAlign: "right"
});
const descriptionRowClass = css({ mt: 5, maxWidth: "640px" });
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mt: 8, mb: 4 });
const switchRowClass = css({ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" });
const switchHelpClass = css({ display: "block", mt: 2 });
const radioRowClass = css({ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" });
const trackingFieldClass = css({ mt: 5 });

const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
// Proportional widths with a min-width floor: fixed px summing past the
// container silently pushes the trailing remove column out of view
// (docs/patterns/form-page-format.md § Editable line-items table).
const lineColWidths = ["40%", "14%", "18%", "18%", "10%"];
const lineTableClass = css({ tableLayout: "fixed", width: "100%", minWidth: "720px" });
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});
const lineTotalRowClass = css({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 3,
  mt: 4
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
