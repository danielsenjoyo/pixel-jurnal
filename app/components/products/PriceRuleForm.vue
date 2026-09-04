<template>
  <DefaultPageContent
    :title="title"
    breadcrumb="Price rules"
    breadcrumb-to="/products?segment=price_rules"
  >
    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">
        Price rule not found
      </MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This price rule may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products?segment=price_rules')">
        Back to Price rules
      </MpButton>
    </div>

    <template v-else>
      <MpBanner
        v-if="submitted && missingFields.length"
        id="price-rule-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="price-rule-missing-icon" />
        <MpBannerTitle id="price-rule-missing-title">Price rule can't be saved yet</MpBannerTitle>
        <MpBannerDescription id="price-rule-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <div :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && !form.name.trim()">
          <MpFormLabel>Rule name</MpFormLabel>
          <MpInput v-model="form.name" placeholder="Example: Diskon reseller 10%" />
          <MpFormErrorMessage>Enter a rule name</MpFormErrorMessage>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Rule type</MpFormLabel>
          <MpSelect v-model="form.ruleType" is-full-width>
            <option v-for="option in PRICE_RULE_TYPE_OPTIONS" :key="option" :value="option">
              {{ PRICE_RULE_TYPE_LABEL[option] }}
            </option>
          </MpSelect>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Rule period</MpFormLabel>
          <div :class="rangeRowClass">
            <MpDatePicker
              v-model="startDate"
              value-type="string"
              :format="DATE_INPUT_FORMAT"
              placeholder="Start date"
              use-portal
            />
            <MpText color="gray.600" :class="dashClass">-</MpText>
            <MpDatePicker
              v-model="endDate"
              value-type="string"
              :format="DATE_INPUT_FORMAT"
              placeholder="End date"
              use-portal
            />
          </div>
          <MpFormHelpText>Leave both empty for a rule with no end.</MpFormHelpText>
        </MpFormControl>

        <div :class="statusColClass">
          <MpToggle id="price-rule-active" v-model:is-checked="form.isActive">
            Active
            <template #description>An inactive rule stops applying to new transactions.</template>
          </MpToggle>
        </div>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- The discount itself. Which fields appear is driven by the type's
           SHAPE rather than a chain of type comparisons, so adding a type is a
           map entry rather than another branch here (PRICE_RULE_SHAPE). -->
      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">
        {{ PRICE_RULE_TYPE_LABEL[form.ruleType] }}
      </MpText>

      <div v-if="shape === 'percent'" :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && form.amount <= 0">
          <MpFormLabel>{{ isMarkup ? "Markup" : "Discount" }}</MpFormLabel>
          <MpInputGroup>
            <MpInput v-model="percentText" type="text" inputmode="decimal" />
            <MpInputRightAddon>%</MpInputRightAddon>
          </MpInputGroup>
          <MpFormErrorMessage>
            {{ isMarkup ? "Markup" : "Discount" }} must be above 0
          </MpFormErrorMessage>
        </MpFormControl>
        <div />
        <div />
        <div />
      </div>

      <div v-else-if="shape === 'amount'" :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && form.amount <= 0">
          <MpFormLabel>{{ amountLabel }}</MpFormLabel>
          <div @focusout="onAmountBlur">
            <MpInputGroup>
              <MpInputLeftAddon>Rp</MpInputLeftAddon>
              <MpInput
                v-model="amountText"
                type="text"
                inputmode="decimal"
                @update:model-value="onAmountInput"
              />
            </MpInputGroup>
          </div>
          <MpFormErrorMessage>Enter an amount</MpFormErrorMessage>
        </MpFormControl>
        <div />
        <div />
        <div />
      </div>

      <!-- Tiered: buy this much, get this much off. The trailing row is the
           add affordance here too, capped at the source's five tiers. -->
      <template v-else>
        <MpTableContainer :class="scrollShadowClass">
          <MpTable :class="tierTableClass">
            <MpTableHead is-fixed :class="tableHeadClass">
              <MpTableRow>
                <MpTableCell as="th">{{ tierThresholdLabel }}</MpTableCell>
                <MpTableCell as="th">Discount (%)</MpTableCell>
                <MpTableCell as="th" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody>
              <MpTableRow v-for="(tier, index) in form.tiers" :key="index">
                <MpTableCell as="td">
                  <div @focusout="onTierThresholdBlur(index)">
                    <MpInputGroup>
                      <MpInputLeftAddon v-if="isSubtotalTier">Rp</MpInputLeftAddon>
                      <MpInput
                        v-model="tierThresholdText[index]"
                        type="text"
                        inputmode="decimal"
                        :aria-label="`${tierThresholdLabel} for tier ${index + 1}`"
                        @update:model-value="onTierThresholdInput(index)"
                      />
                    </MpInputGroup>
                  </div>
                </MpTableCell>
                <MpTableCell as="td">
                  <MpInputGroup>
                    <MpInput
                      :model-value="String(tier.discount || '')"
                      type="text"
                      inputmode="decimal"
                      :aria-label="`Discount for tier ${index + 1}`"
                      @update:model-value="onTierDiscountChange(index, $event)"
                    />
                    <MpInputRightAddon>%</MpInputRightAddon>
                  </MpInputGroup>
                </MpTableCell>
                <MpTableCell as="td">
                  <MpButton
                    v-if="form.tiers.length > 1"
                    variant="ghost"
                    size="sm"
                    left-icon="minus-circular"
                    aria-label="Remove tier"
                    @click="removeTier(index)"
                  />
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
        </MpTableContainer>
        <MpButton
          v-if="form.tiers.length < PRICE_RULE_TIER_LIMIT"
          variant="secondary"
          size="sm"
          :class="addTierClass"
          @click="addTier"
        >
          {{ isSubtotalTier ? "Add another subtotal" : "Add another tier" }}
        </MpButton>
      </template>

      <MpDivider variant="dashed" :class="dividerClass" />

      <!-- Scope. An empty list is NOT "nothing selected" — it means the rule
           covers everything, including records created later. The caption says
           so, because an empty control otherwise reads as unfinished. -->
      <div :class="scopeGridClass">
        <MpFormControl>
          <MpFormLabel>Product list</MpFormLabel>
          <MpInputTag
            id="price-rule-products"
            :key="`products-${scopeKey}`"
            placeholder="Search product..."
            :data="tagData(form.products)"
            :suggestions="productSuggestions"
            :max-row="-1"
            :is-enable-create-new-tag="false"
            :is-show-suggestions="true"
            :is-show-icon-chevron-down="true"
            @change="onProductsChange"
          />
          <MpFormHelpText>{{ productScopeHelp }}</MpFormHelpText>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Contact list</MpFormLabel>
          <MpInputTag
            id="price-rule-contacts"
            :key="`contacts-${scopeKey}`"
            placeholder="Search contact..."
            :data="tagData(form.contacts)"
            :suggestions="CONTACT_OPTIONS"
            :max-row="-1"
            :is-enable-create-new-tag="false"
            :is-show-suggestions="true"
            :is-show-icon-chevron-down="true"
            @change="onContactsChange"
          />
          <MpFormHelpText>{{ contactScopeHelp }}</MpFormHelpText>
        </MpFormControl>
      </div>

      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton variant="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Save" }}
        </MpButton>
      </div>

      <MpModal
        id="price-rule-discard-modal"
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
  MpDatePicker,
  MpDivider,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
  MpFormLabel,
  MpInput,
  MpInputGroup,
  MpInputLeftAddon,
  MpInputRightAddon,
  MpInputTag,
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
  MpToggle
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  CONTACT_OPTIONS,
  createPriceRule,
  emptyPriceRuleInput,
  formatAmount,
  formatQuantity,
  getPriceRuleById,
  getProducts,
  parseAmount,
  PRICE_RULE_SHAPE,
  PRICE_RULE_TIER_LABEL,
  PRICE_RULE_TIER_LIMIT,
  PRICE_RULE_TYPE_LABEL,
  PRICE_RULE_TYPE_OPTIONS,
  priceRuleToInput,
  updatePriceRule,
  type PriceRuleInput,
  type PriceRuleType
} from "~/data/products";
import { DATE_INPUT_FORMAT, dmyToIso, isoToDmy } from "~/utils/dates";

// ---------------------------------------------------------------------------
// The price-rule create/edit form, rendered by both
// app/pages/products/price-rules/new.vue and .../price-rules/edit/[id].vue.
//
// Cloned from jurnal-frontend-app src/pages/products/price_rules/NewAndEdit.vue.
// The source picks products and contacts through two full drawers with their
// own search, bulk select and contact-group expansion; here both are tag
// pickers over the same lists, which keeps the scope rule ("empty means all")
// visible on one screen instead of behind two panels.
// ---------------------------------------------------------------------------

const props = defineProps<{ recordId?: number }>();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getPriceRuleById(props.recordId) : undefined
);

const form = reactive<PriceRuleInput>(emptyPriceRuleInput());

/** A tier's threshold is money for `subtotal_tier` and a plain count for
 *  `tier` — formatting a quantity of 50 as "50,00" reads as currency and
 *  invites decimals into a count. Takes the rule type as an argument rather
 *  than reading a computed, so `seedFromRecord` can call it from the immediate
 *  watch below without hitting the computed's temporal dead zone. */
function formatThreshold(value: number, ruleType: PriceRuleType): string {
  if (!value) return "";
  return ruleType === "subtotal_tier" ? formatAmount(value) : formatQuantity(value);
}

/** Dates are held as DD/MM/YYYY for MpDatePicker and converted on save — never
 *  round-tripped through `Date`, which shifts the day outside UTC. */
const startDate = ref("");
const endDate = ref("");

const amountText = ref("");
const percentText = ref("");
const tierThresholdText = reactive<string[]>([]);
/** Re-mounts the two tag pickers when their lists are replaced from outside. */
const scopeKey = ref(0);

const submitted = ref(false);
const isDiscardModalOpen = ref(false);

function seedFromRecord() {
  Object.assign(form, existing.value ? priceRuleToInput(existing.value) : emptyPriceRuleInput());
  startDate.value = isoToDmy(form.startDate);
  endDate.value = isoToDmy(form.endDate);
  amountText.value = form.amount ? formatAmount(form.amount) : "";
  percentText.value = form.amount ? String(form.amount) : "";
  tierThresholdText.splice(
    0,
    tierThresholdText.length,
    ...form.tiers.map((tier) => formatThreshold(tier.threshold, form.ruleType))
  );
  scopeKey.value++;
}

watch(existing, seedFromRecord, { immediate: true });

const title = computed(() => {
  if (!isEdit.value) return "Create new price rule";
  return existing.value ? `Edit ${existing.value.name}` : "Edit price rule";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

const shape = computed(() => PRICE_RULE_SHAPE[form.ruleType]);
const isMarkup = computed(() => form.ruleType.startsWith("markup"));
const isSubtotalTier = computed(() => form.ruleType === "subtotal_tier");
const tierThresholdLabel = computed(() => PRICE_RULE_TIER_LABEL[form.ruleType] ?? "Qty");

const amountLabel = computed(() => {
  if (form.ruleType === "end_discount") return "Last price";
  return isMarkup.value ? "Markup amount" : "Discount amount";
});

// Switching type changes which figure is being edited, so the old one is
// cleared rather than silently carried into a field that means something else.
watch(
  () => form.ruleType,
  () => {
    form.amount = 0;
    amountText.value = "";
    percentText.value = "";
    if (form.tiers.length === 0) form.tiers.push({ threshold: 0, discount: 0 });
    tierThresholdText.splice(0, tierThresholdText.length, ...form.tiers.map(() => ""));
    form.tiers.forEach((tier) => {
      tier.threshold = 0;
      tier.discount = 0;
    });
  }
);

// A percentage is a small plain number, so it needs no grouped mirror — only
// the money fields do.
watch(percentText, (value) => {
  const parsed = Number(value.replace(",", ".").replace(/[^\d.]/g, ""));
  form.amount = Number.isNaN(parsed) ? 0 : parsed;
});

function onAmountInput() {
  form.amount = parseAmount(amountText.value);
}
function onAmountBlur() {
  amountText.value = form.amount ? formatAmount(form.amount) : "";
}

function addTier() {
  form.tiers.push({ threshold: 0, discount: 0 });
  tierThresholdText.push("");
}
function removeTier(index: number) {
  form.tiers.splice(index, 1);
  tierThresholdText.splice(index, 1);
}
function onTierThresholdInput(index: number) {
  const tier = form.tiers[index];
  if (tier) tier.threshold = parseAmount(tierThresholdText[index] ?? "");
}
function onTierThresholdBlur(index: number) {
  const tier = form.tiers[index];
  if (tier) tierThresholdText[index] = formatThreshold(tier.threshold, form.ruleType);
}
function onTierDiscountChange(index: number, value: unknown) {
  const tier = form.tiers[index];
  if (!tier) return;
  const parsed = Number(
    String(value ?? "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );
  tier.discount = Number.isNaN(parsed) ? 0 : parsed;
}

// ---- Scope --------------------------------------------------------------

const productSuggestions = computed(() =>
  getProducts()
    .filter((product) => !product.isArchived)
    .map((product) => product.name)
);

function tagData(values: string[]) {
  return values.map((value) => ({
    id: `tag-${value}`,
    text: value,
    value,
    isInvalid: false,
    isReadOnly: false
  }));
}

function onProductsChange(tags: { value?: string; text?: string }[]) {
  form.products = tags.map((tag) => tag.value ?? tag.text ?? "").filter(Boolean);
}
function onContactsChange(tags: { value?: string; text?: string }[]) {
  form.contacts = tags.map((tag) => tag.value ?? tag.text ?? "").filter(Boolean);
}

const productScopeHelp = computed(() =>
  form.products.length === 0
    ? "All products — including any created after this rule is applied."
    : `${form.products.length} product${form.products.length === 1 ? "" : "s"} selected.`
);
const contactScopeHelp = computed(() =>
  form.contacts.length === 0
    ? "All contacts — including any created after this rule is applied."
    : `${form.contacts.length} contact${form.contacts.length === 1 ? "" : "s"} selected.`
);

// ---- Validation ---------------------------------------------------------

const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.name.trim()) missing.push("Rule name");
  if (shape.value !== "tier" && form.amount <= 0) missing.push(amountLabel.value);
  if (shape.value === "tier") {
    if (form.tiers.every((tier) => tier.threshold <= 0 || tier.discount <= 0)) {
      missing.push("At least one complete tier");
    }
  }
  // A period with only one bound can't be evaluated — the rule would either
  // never start or never end, and neither is what a half-filled range means.
  const hasStart = Boolean(dmyToIso(startDate.value));
  const hasEnd = Boolean(dmyToIso(endDate.value));
  if (hasStart !== hasEnd) missing.push("Both rule period dates");
  return missing;
});

function onSubmit() {
  submitted.value = true;
  if (missingFields.value.length) return;

  const payload: PriceRuleInput = {
    ...form,
    startDate: dmyToIso(startDate.value),
    endDate: dmyToIso(endDate.value),
    // Drop the incomplete rows a user left behind rather than storing a tier
    // that can never match.
    tiers: form.tiers.filter((tier) => tier.threshold > 0 && tier.discount > 0),
    products: [...form.products],
    contacts: [...form.contacts]
  };

  if (isEdit.value && props.recordId != null) {
    updatePriceRule(props.recordId, payload);
  } else {
    createPriceRule(payload);
  }
  navigateTo("/products?segment=price_rules");
}

const isDirty = computed(() =>
  Boolean(form.name.trim() || form.amount || form.products.length || form.contacts.length)
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
  navigateTo("/products?segment=price_rules");
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
const scopeGridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 6,
  alignItems: "start"
});
const statusColClass = css({ display: "flex", alignItems: "flex-start", pt: 6 });
const rangeRowClass = css({ display: "flex", alignItems: "center", gap: 2 });
const dashClass = css({ flexShrink: 0 });
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mb: 4 });

const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const tierTableClass = css({ tableLayout: "fixed", width: "full", minWidth: "560px" });
const addTierClass = css({ mt: 4 });
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
