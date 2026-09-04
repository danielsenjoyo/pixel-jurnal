<template>
  <DefaultPageContent
    :title="title"
    breadcrumb="Warehouse list"
    breadcrumb-to="/products?tab=warehouses"
  >
    <div v-if="isEdit && !existing" :class="notFoundClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="notFoundIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="notFoundTitleClass">
        Warehouse not found
      </MpText>
      <MpText size="body-small" color="gray.600" :class="notFoundDescClass">
        This warehouse may have been deleted, or the link you followed may be out of date.
      </MpText>
      <MpButton variant="secondary" @click="navigateTo('/products?tab=warehouses')">
        Back to Warehouse list
      </MpButton>
    </div>

    <template v-else>
      <MpBanner
        v-if="submitted && missingFields.length"
        id="warehouse-form-missing-banner"
        variant="danger"
        :class="bannerClass"
      >
        <MpBannerIcon id="warehouse-form-missing-icon" />
        <MpBannerTitle id="warehouse-form-missing-title">
          Warehouse can't be saved yet
        </MpBannerTitle>
        <MpBannerDescription id="warehouse-form-missing-desc">
          Complete these before saving: {{ missingFields.join(", ") }}.
        </MpBannerDescription>
      </MpBanner>

      <!-- Four fields, so the page keeps the module's repeat(4, 1fr) rhythm
           rather than inventing a narrower one for a short form. -->
      <div :class="gridClass">
        <MpFormControl is-required :is-invalid="submitted && !form.name.trim()">
          <MpFormLabel>Warehouse name</MpFormLabel>
          <MpInput v-model="form.name" placeholder="Example: Gudang Senopati 01" />
          <MpFormErrorMessage>Enter a warehouse name</MpFormErrorMessage>
          <MpFormHelpText>Name it specifically enough to tell it from the others.</MpFormHelpText>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Warehouse code</MpFormLabel>
          <MpInput v-model="form.code" placeholder="Example: GS01JS" />
          <MpFormHelpText>A consistent code makes stock easier to trace.</MpFormHelpText>
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>PIC</MpFormLabel>
          <MpSelect v-model="form.pic" is-full-width>
            <option value="">Select person in charge</option>
            <option v-for="option in PIC_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </MpSelect>
        </MpFormControl>
        <div />
      </div>

      <div :class="wideRowClass">
        <MpFormControl>
          <MpFormLabel>Address</MpFormLabel>
          <MpTextarea
            v-model="form.address"
            placeholder="Example: Jl. Senopati Raya No. 100K, Kebayoran Baru, Jakarta Selatan 12190"
          />
        </MpFormControl>

        <MpFormControl>
          <MpFormLabel>Description</MpFormLabel>
          <MpTextarea v-model="form.description" placeholder="What this warehouse is used for" />
        </MpFormControl>
      </div>

      <div :class="actionRowClass">
        <MpButton variant="ghost" @click="onCancel">Cancel</MpButton>
        <MpButton variant="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Save" }}
        </MpButton>
      </div>

      <MpModal
        id="warehouse-form-discard-modal"
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
  MpText,
  MpTextarea
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  createWarehouse,
  emptyWarehouseInput,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
  warehouseToInput,
  type WarehouseInput
} from "~/data/products";

// The warehouse create/edit form, rendered by app/pages/products/warehouse/new.vue
// and .../warehouse/edit/[id].vue. Cloned from jurnal-frontend-app
// src/pages/warehouses/form/index.vue — whose per-field "hint" panel is
// collapsed into MpFormHelpText here, since the hints are one line each.

const props = defineProps<{ recordId?: number }>();

const isEdit = computed(() => props.recordId != null);
const existing = computed(() =>
  props.recordId != null ? getWarehouseById(props.recordId) : undefined
);

const form = reactive<WarehouseInput>(emptyWarehouseInput());
const submitted = ref(false);
const isDiscardModalOpen = ref(false);

/** Whoever already runs a warehouse — this prototype has no people directory,
 *  so the existing PICs are the list. */
const PIC_OPTIONS = [...new Set(getWarehouses().map((warehouse) => warehouse.pic))]
  .filter(Boolean)
  .sort();

watch(
  existing,
  () => {
    Object.assign(form, existing.value ? warehouseToInput(existing.value) : emptyWarehouseInput());
  },
  { immediate: true }
);

const title = computed(() => {
  if (!isEdit.value) return "Add new warehouse";
  return existing.value ? `Edit ${existing.value.name}` : "Edit warehouse";
});

useHead({ title: computed(() => `${title.value} — Mekari Jurnal`) });

const missingFields = computed(() => {
  const missing: string[] = [];
  if (!form.name.trim()) missing.push("Warehouse name");
  return missing;
});

function onSubmit() {
  submitted.value = true;
  if (missingFields.value.length) return;
  if (isEdit.value && props.recordId != null) {
    updateWarehouse(props.recordId, { ...form });
    navigateTo(`/products/warehouse/${props.recordId}`);
    return;
  }
  const created = createWarehouse({ ...form });
  navigateTo(`/products/warehouse/${created.id}`);
}

const isDirty = computed(() =>
  Boolean(form.name.trim() || form.code.trim() || form.address.trim() || form.description.trim())
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
    isEdit.value && props.recordId
      ? `/products/warehouse/${props.recordId}`
      : "/products?tab=warehouses"
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
// The two long-text fields get half the width each — a textarea in a quarter
// column is too narrow to read an address back in.
const wideRowClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 5,
  alignItems: "start"
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
