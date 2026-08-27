<!--
  Sales Advanced Filter drawer — the staged draft/applied filter set, driven
  by one TabConfig so all 4 Sales tabs share this single template (fields
  gated by config.dueDate / config.warehouse). See docs/patterns/AdvancedFilter.md
  for the full Reset/Cancel/Apply state matrix this implements.
-->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  MpButton,
  MpDrawer,
  MpDrawerBody,
  MpDrawerCloseButton,
  MpDrawerContent,
  MpDrawerFooter,
  MpDrawerHeader,
  MpDrawerOverlay,
  MpFormControl,
  MpFormLabel,
  MpInput,
  MpSelect,
  MpDatePicker,
  css
} from "@mekari/pixel3";
import type { TabConfig, SalesFilterState } from "~/data/sales";
import { COLUMN_OPTIONS, TAGS, WAREHOUSES } from "~/data/sales";

const props = defineProps<{
  isOpen: boolean;
  config: TabConfig;
  errors: { tx: string; due: string };
}>();

const emit = defineEmits<{
  (e: "cancel" | "reset" | "apply"): void;
}>();

const draft = defineModel<SalesFilterState>("draft", { required: true });

const keywordInputRef = ref<{ $el?: HTMLElement } | null>(null);

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    nextTick(() => {
      keywordInputRef.value?.$el?.querySelector("input")?.focus();
    });
  }
);

const txRange = computed<string[]>({
  get: () => [draft.value.txFrom, draft.value.txTo],
  set: ([from, to]) => {
    draft.value.txFrom = from ?? "";
    draft.value.txTo = to ?? "";
  }
});
const dueRange = computed<string[]>({
  get: () => [draft.value.dueFrom, draft.value.dueTo],
  set: ([from, to]) => {
    draft.value.dueFrom = from ?? "";
    draft.value.dueTo = to ?? "";
  }
});

const drawerTitleClass = css({ fontSize: "lg" });
const formClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const footerClass = css({
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  width: "full"
});
const footerRightClass = css({ display: "flex", gap: 2 });
</script>

<template>
  <!--
    v-if gates mounting here rather than relying on MpDrawer's own :is-open
    toggling to close itself — @mekari/pixel3-drawer@0.0.26's internal open
    state is captured once at mount and never re-synced to prop changes
    (see docs/patterns/AdvancedFilter.md), so a later `isOpen=false` from the
    app is silently ignored. Unmounting via v-if is the reliable close.
  -->
  <MpDrawer v-if="props.isOpen" :is-open="true" placement="right" size="sm" @close="emit('cancel')">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitleClass">Filter</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <div :class="formClass">
          <MpFormControl>
            <MpFormLabel>Keyword</MpFormLabel>
            <MpInput
              ref="keywordInputRef"
              v-model="draft.keyword"
              placeholder="Search transaction"
              is-full-width
              is-clearable
            />
          </MpFormControl>

          <MpFormControl>
            <MpFormLabel>Column option</MpFormLabel>
            <MpSelect v-model="draft.column" is-full-width>
              <option v-for="opt in COLUMN_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </MpSelect>
          </MpFormControl>

          <MpFormControl :is-invalid="!!props.errors.tx">
            <MpFormLabel>Transaction date</MpFormLabel>
            <MpDatePicker
              v-model="txRange"
              is-range
              value-type="string"
              is-full-width
              is-clearable
              range-separator=" - "
              placeholder="dd/mm/yyyy"
              :is-invalid="!!props.errors.tx"
              :error-message="props.errors.tx"
            />
          </MpFormControl>

          <MpFormControl v-if="props.config.dueDate" :is-invalid="!!props.errors.due">
            <MpFormLabel>Due date</MpFormLabel>
            <MpDatePicker
              v-model="dueRange"
              is-range
              value-type="string"
              is-full-width
              is-clearable
              range-separator=" - "
              placeholder="dd/mm/yyyy"
              :is-invalid="!!props.errors.due"
              :error-message="props.errors.due"
            />
          </MpFormControl>

          <MpFormControl>
            <MpFormLabel>Status</MpFormLabel>
            <MpSelect v-model="draft.status" placeholder="All status" is-full-width is-clearable>
              <option value="">All status</option>
              <option v-for="s in props.config.statuses" :key="s" :value="s">{{ s }}</option>
            </MpSelect>
          </MpFormControl>

          <AmountRangeField
            v-model:mode="draft.balMode"
            v-model:a="draft.balA"
            v-model:b="draft.balB"
            name="balance"
            label="Balance due"
          />
          <AmountRangeField
            v-model:mode="draft.totMode"
            v-model:a="draft.totA"
            v-model:b="draft.totB"
            name="total"
            label="Total"
          />

          <TagMultiSelectField
            v-model="draft.tags"
            v-model:mode="draft.tagMode"
            :options="TAGS"
            label="Additional tag"
            placeholder="Select tag"
            with-mode-toggle
          />
          <TagMultiSelectField
            v-if="props.config.warehouse"
            v-model="draft.warehouses"
            :options="WAREHOUSES"
            label="Warehouse"
            placeholder="Select warehouse"
          />
        </div>
      </MpDrawerBody>

      <MpDrawerFooter>
        <div :class="footerClass">
          <MpButton variant="ghost" @click="emit('reset')">Reset</MpButton>
          <div :class="footerRightClass">
            <MpButton variant="secondary" @click="emit('cancel')">Cancel</MpButton>
            <MpButton variant="primary" @click="emit('apply')">Apply</MpButton>
          </div>
        </div>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
