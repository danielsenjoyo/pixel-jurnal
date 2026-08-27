<!--
  Sales index — 4 in-page tabs (Quotation, Order, Delivery, Invoice) sharing
  one physical zone template, each tab carrying its own persistent filter/
  pagination state so switching tabs never loses in-progress work. The
  Advanced Filter drawer implements a draft/applied staged state model (see
  docs/patterns/AdvancedFilter.md) — a deliberate departure from the plain
  "live filter" pattern in templates/index-template.vue.
-->
<template>
  <DefaultPageContent title="Sales">
    <template #actions>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">Import</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent>
            <MpPopoverList>
              <MpPopoverListItem role="menuitem">Import from Excel</MpPopoverListItem>
              <MpPopoverListItem role="menuitem">Download template</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </template>
      </MpPopover>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="primary" right-icon="caret-down">Create new sales</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent>
            <MpPopoverList>
              <MpPopoverListItem v-for="key in TAB_ORDER" :key="key" role="menuitem">
                {{ TAB_CONFIG[key].label }}
              </MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </template>
      </MpPopover>
    </template>

    <template #tabs>
      <MpTabs v-model="activePageTab" variant-color="blue">
        <MpTabList>
          <MpTab v-for="key in TAB_ORDER" :key="key">{{ TAB_CONFIG[key].label }}</MpTab>
        </MpTabList>
      </MpTabs>
    </template>

    <!-- Zone A — KPI summary cards, adapted per tab's own status vocabulary. -->
    <div :class="statsGridClass">
      <SummaryBox
        v-for="card in activeSummaryCards"
        :key="card.label"
        :variant="card.variant"
        :label="card.label"
        :badge="card.count"
        caption="Total"
        :amount="card.amount"
      />
    </div>

    <!-- Zone C — filter bar: quick selects left (doc type, then status),
         search + Filter button right, matching the real Sales index. -->
    <div :class="filterBarClass">
      <div :class="filterLeftClass">
        <div v-if="activeConfig.docTypes" :class="quickFilterClass">
          <MpSelect v-model="activeState.docType" is-full-width>
            <option v-for="d in activeConfig.docTypes" :key="d" :value="d">{{ d }}</option>
          </MpSelect>
        </div>
        <div :class="quickFilterClass">
          <MpSelect
            v-model="activeState.applied.status"
            placeholder="All status"
            is-full-width
            is-clearable
          >
            <option value="">All status</option>
            <option v-for="s in activeConfig.statuses" :key="s" :value="s">{{ s }}</option>
          </MpSelect>
        </div>
      </div>

      <div :class="filterRightClass">
        <div :class="searchGroupClass">
          <MpInputGroup>
            <MpInputLeftAddon>
              <MpIcon name="search" size="sm" color="gray.400" />
            </MpInputLeftAddon>
            <MpInput v-model="activeState.applied.keyword" placeholder="Search..." />
          </MpInputGroup>
          <button
            v-if="searchTerm"
            type="button"
            data-search-clear
            aria-label="Clear search"
            :class="searchClearClass"
            @click="activeState.applied.keyword = ''"
          >
            <MpIcon name="reset" size="sm" color="gray.400" />
          </button>
        </div>

        <MpButton variant="secondary" left-icon="filter" @click="openFilterDrawer">Filter</MpButton>
      </div>
    </div>

    <!-- Rule 13 — sub-type switch clears the filter (Invoice/Order only). -->
    <MpBanner v-if="activeState.scopeNote" variant="info" :class="scopeNoteClass">
      <MpBannerDescription>{{ activeState.scopeNote }}</MpBannerDescription>
      <MpBannerCloseButton @click="activeState.scopeNote = null" />
    </MpBanner>

    <SalesAdvancedFilterDrawer
      v-model:draft="activeState.draft"
      :is-open="activeState.isFilterDrawerOpen"
      :config="activeConfig"
      :errors="activeState.dateErrors"
      @cancel="discardDraft"
      @reset="resetDraft"
      @apply="applyDraft"
    />

    <!-- Zone D/E — table + pagination, OR blank slate. -->
    <template v-if="filteredRows.length">
      <MpTableContainer ref="tableContainerRef" has-shadow>
        <MpTable is-hoverable :class="tableFixedClass" :style="{ minWidth: tableMinWidth }">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <MpTableHead is-fixed :class="tableHeadClass">
            <MpTableRow v-if="activeState.selected.length">
              <MpTableCell as="th" :class="checkboxCellClass">
                <MpCheckbox
                  :is-checked="allOnPageSelected"
                  :is-indeterminate="someOnPageSelected && !allOnPageSelected"
                  @change="toggleAllOnPage"
                />
              </MpTableCell>
              <MpTableCell as="th" :colspan="columns.length + 1" :class="bulkCellClass">
                <div :class="bulkBarClass">
                  <MpText size="label" weight="semiBold" color="dark">
                    {{ activeState.selected.length }} selected
                  </MpText>
                  <MpButton variant="ghost" size="sm" @click="activeState.selected = []">
                    Clear selection
                  </MpButton>
                </div>
              </MpTableCell>
            </MpTableRow>

            <MpTableRow v-else>
              <MpTableCell as="th" :class="checkboxCellClass">
                <MpCheckbox
                  :is-checked="allOnPageSelected"
                  :is-indeterminate="someOnPageSelected && !allOnPageSelected"
                  @change="toggleAllOnPage"
                />
              </MpTableCell>
              <MpTableCell
                v-for="col in columns"
                :key="col.key"
                as="th"
                :class="[cellClipClass, col.numeric ? numCellClass : '']"
              >
                <button type="button" :class="sortHeaderClass" @click="toggleSort(col.key)">
                  <span :class="truncateSpanClass">{{ col.label }}</span>
                  <MpIcon :name="sortIconFor(col.key)" size="sm" color="gray.400" />
                </button>
              </MpTableCell>
              <MpTableCell
                as="th"
                :class="[actionHeadClass, isTableOverflowing ? actionBorderClass : '']"
              />
            </MpTableRow>
          </MpTableHead>

          <MpTableBody v-if="activeState.isLoading">
            <MpTableRow v-for="n in 5" :key="`skeleton-${n}`">
              <MpTableCell v-for="c in columns.length + 2" :key="c" as="td">
                <MpSkeleton is-loading>
                  <span :class="skeletonBarClass" />
                </MpSkeleton>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>

          <MpTableBody v-else>
            <MpTableRow v-for="row in pagedRows" :key="row.id">
              <MpTableCell as="td" :class="checkboxCellClass">
                <MpCheckbox
                  :is-checked="activeState.selected.includes(row.id)"
                  @change="toggleRow(row.id)"
                />
              </MpTableCell>
              <MpTableCell
                v-for="col in columns"
                :key="col.key"
                as="td"
                :class="[cellClipClass, col.numeric ? numCellClass : '']"
                :title="col.key === 'status' ? undefined : String(cellValue(row, col.key))"
              >
                <MpTextlink
                  v-if="col.key === 'number'"
                  as="button"
                  variant="primary"
                  @click="onOpen(row)"
                >
                  <span :class="truncateSpanClass">{{ row.number }}</span>
                </MpTextlink>
                <MpBadge
                  v-else-if="col.key === 'status'"
                  for="tableStatus"
                  :type="STATUS_TYPE[row.status] ?? 'information'"
                >
                  {{ row.status }}
                </MpBadge>
                <div v-else-if="col.key === 'tags'" :class="tagListClass">
                  <MpTag v-for="tag in row.tags" :key="tag" as="span" size="sm" variant="gray">
                    {{ tag }}
                  </MpTag>
                </div>
                <template v-else>{{ cellValue(row, col.key) }}</template>
              </MpTableCell>
              <MpTableCell
                as="td"
                :class="[actionCellClass, isTableOverflowing ? actionBorderClass : '']"
              >
                <MpPopover placement="bottom-end" use-portal is-adaptive-width>
                  <template #default>
                    <MpPopoverTrigger>
                      <MpButton variant="secondary" right-icon="caret-down">Actions</MpButton>
                    </MpPopoverTrigger>
                    <MpPopoverContent>
                      <MpPopoverList>
                        <MpPopoverListItem role="menuitem" @click="onOpen(row)"
                          >View</MpPopoverListItem
                        >
                      </MpPopoverList>
                    </MpPopoverContent>
                  </template>
                </MpPopover>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>

      <div :class="paginationClass">
        <div :class="pagerLeftClass">
          <MpText size="body-small" color="gray.600">Rows per page</MpText>
          <MpPopover use-portal is-adaptive-width>
            <MpPopoverTrigger>
              <MpButton variant="ghost" size="sm" right-icon="chevrons-down">{{
                activeState.perPage
              }}</MpButton>
            </MpPopoverTrigger>
            <MpPopoverContent>
              <MpPopoverList>
                <MpPopoverListItem
                  v-for="opt in [5, 10, 25, 50]"
                  :key="opt"
                  :is-active="activeState.perPage === opt"
                  @click="setPerPage(opt)"
                >
                  {{ opt }}
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
          <MpText size="body-small" color="gray.600">
            Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredRows.length }}
            <template v-if="activeFilterCount > 0">
              · {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? "s" : "" }} applied
            </template>
          </MpText>
        </div>

        <div :class="pagerRightClass">
          <div :class="pageJumpClass">
            <MpAutocomplete
              :class="pageJumpInnerClass"
              :data="pageOptions"
              :model-value="activeState.page"
              is-searchable
              is-full-width
              @change="onJumpPage"
            />
          </div>
          <MpText size="body-small" color="gray.600">of {{ pageCount }} page</MpText>
          <MpTooltip label="Previous page">
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="chevrons-left"
              :is-disabled="activeState.page <= 1"
              aria-label="Previous page"
              @click="activeState.page--"
            />
          </MpTooltip>
          <MpTooltip label="Next page">
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="chevrons-right"
              :is-disabled="activeState.page >= pageCount"
              aria-label="Next page"
              @click="activeState.page++"
            />
          </MpTooltip>
        </div>
      </div>
    </template>

    <div v-else :class="emptyStateClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ emptyTitle }}</MpText>
      <MpText size="body-small" color="gray.600" :class="emptyDescClass">{{
        emptyDescription
      }}</MpText>
      <MpTextlink
        v-if="emptyReason === 'filter'"
        as="button"
        variant="primary"
        @click="clearAllFilters"
      >
        Clear all filters
      </MpTextlink>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import {
  css,
  MpAutocomplete,
  MpBadge,
  MpBanner,
  MpBannerCloseButton,
  MpBannerDescription,
  MpButton,
  MpCheckbox,
  MpIcon,
  MpInput,
  MpInputGroup,
  MpInputLeftAddon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpSelect,
  MpSkeleton,
  MpTab,
  MpTabList,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpTabs,
  MpTag,
  MpText,
  MpTextlink,
  MpTooltip
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import SummaryBox from "~/components/template/SummaryBox.vue";
import SalesAdvancedFilterDrawer from "~/components/sales/SalesAdvancedFilterDrawer.vue";
import type { SalesFilterState, SalesRow, TabKey } from "~/data/sales";
import { SALES_ROWS, TAB_CONFIG, TAB_ORDER } from "~/data/sales";

useHead({ title: "Sales — Mekari Jurnal" });

type SortKey = "date" | "due" | "number" | "customer" | "status" | "total" | "balance" | "tags";

const STATUS_TYPE: Record<
  string,
  "announcement" | "information" | "warning" | "completed" | "critical"
> = {
  Open: "information",
  Overdue: "critical",
  Paid: "completed",
  "Partially paid": "warning",
  Unpaid: "critical",
  "Partially sent": "warning",
  Closed: "announcement"
};

interface SalesTabUiState {
  page: number;
  perPage: number;
  selected: number[];
  sortKey: SortKey | null;
  sortDir: "asc" | "desc";
  isLoading: boolean;
  docType: string;
  isFilterDrawerOpen: boolean;
  draft: SalesFilterState;
  applied: SalesFilterState;
  scopeNote: string | null;
  dateErrors: { tx: string; due: string };
}

function createTabUiState(cfg: (typeof TAB_CONFIG)[TabKey]): SalesTabUiState {
  return reactive({
    page: 1,
    perPage: 10,
    selected: [],
    sortKey: null,
    sortDir: "asc",
    isLoading: false,
    docType: cfg.docTypes ? cfg.docTypes[0] : "",
    isFilterDrawerOpen: false,
    draft: createEmptySalesFilterState(),
    applied: createEmptySalesFilterState(),
    scopeNote: null,
    dateErrors: { tx: "", due: "" }
  });
}

// One persistent state object per tab — never remounted on tab switch, so
// each tab's filter/page/selection survives switching away and back.
const tabState: Record<TabKey, SalesTabUiState> = {
  quotation: createTabUiState(TAB_CONFIG.quotation),
  order: createTabUiState(TAB_CONFIG.order),
  delivery: createTabUiState(TAB_CONFIG.delivery),
  invoice: createTabUiState(TAB_CONFIG.invoice)
};

const activePageTab = ref(0);
const activeTabKey = computed<TabKey>(() => TAB_ORDER[activePageTab.value]);
const activeConfig = computed(() => TAB_CONFIG[activeTabKey.value]);
const activeState = computed(() => tabState[activeTabKey.value]);

const searchTerm = computed(() => (activeState.value.applied.keyword ?? "").trim());
const activeFilterCount = computed(() =>
  countActiveFilters(activeState.value.applied, activeConfig.value)
);

function compareRows(a: SalesRow, b: SalesRow, key: SortKey, dir: 1 | -1): number {
  const av = a[key as keyof SalesRow];
  const bv = b[key as keyof SalesRow];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
  return String(av).localeCompare(String(bv)) * dir;
}

const filteredRows = computed(() => {
  const rows = SALES_ROWS[activeTabKey.value];
  const cfg = activeConfig.value;
  const result = rows.filter((r) => matchesSalesFilter(r, activeState.value.applied, cfg));
  const key = activeState.value.sortKey;
  if (key) {
    const dir = activeState.value.sortDir === "asc" ? 1 : -1;
    return [...result].sort((a, b) => compareRows(a, b, key, dir));
  }
  return result;
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / activeState.value.perPage))
);
const pageOptions = computed(() =>
  Array.from({ length: pageCount.value }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
);
const pagedRows = computed(() => {
  const s = activeState.value;
  const start = (s.page - 1) * s.perPage;
  return filteredRows.value.slice(start, start + s.perPage);
});
const rangeStart = computed(() =>
  filteredRows.value.length === 0 ? 0 : (activeState.value.page - 1) * activeState.value.perPage + 1
);
const rangeEnd = computed(() =>
  Math.min(activeState.value.page * activeState.value.perPage, filteredRows.value.length)
);

watch(
  () => [activeState.value.page, pageCount.value],
  () => {
    const s = activeState.value;
    if (s.page < 1) s.page = 1;
    else if (s.page > pageCount.value) s.page = pageCount.value;
  }
);

// Rule 12 — any change to applied filter criteria (quick filter, search, or
// drawer Apply) resets that tab's page back to 1.
(Object.keys(tabState) as TabKey[]).forEach((key) => {
  watch(
    () => tabState[key].applied,
    () => {
      tabState[key].page = 1;
    },
    { deep: true }
  );
});

// Rule 13 — switching document sub-type clears the filter (Invoice/Order only).
watch(
  () => tabState.invoice.docType,
  () => {
    const cfg = TAB_CONFIG.invoice;
    const n = countActiveFilters(tabState.invoice.applied, cfg);
    if (n > 0) tabState.invoice.scopeNote = describeFilterScopeClear(n, cfg.label);
    Object.assign(tabState.invoice.applied, createEmptySalesFilterState());
    Object.assign(tabState.invoice.draft, createEmptySalesFilterState());
  }
);
watch(
  () => tabState.order.docType,
  () => {
    const cfg = TAB_CONFIG.order;
    const n = countActiveFilters(tabState.order.applied, cfg);
    if (n > 0) tabState.order.scopeNote = describeFilterScopeClear(n, cfg.label);
    Object.assign(tabState.order.applied, createEmptySalesFilterState());
    Object.assign(tabState.order.draft, createEmptySalesFilterState());
  }
);

// Selection (scoped to the current page).
const allOnPageSelected = computed(
  () =>
    pagedRows.value.length > 0 &&
    pagedRows.value.every((r) => activeState.value.selected.includes(r.id))
);
const someOnPageSelected = computed(() =>
  pagedRows.value.some((r) => activeState.value.selected.includes(r.id))
);

function toggleRow(id: number) {
  const s = activeState.value;
  s.selected = s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id];
}
function toggleAllOnPage() {
  const s = activeState.value;
  const ids = pagedRows.value.map((r) => r.id);
  s.selected = allOnPageSelected.value
    ? s.selected.filter((x) => !ids.includes(x))
    : [...new Set([...s.selected, ...ids])];
}
function toggleSort(key: SortKey) {
  const s = activeState.value;
  if (s.sortKey === key) s.sortDir = s.sortDir === "asc" ? "desc" : "asc";
  else {
    s.sortKey = key;
    s.sortDir = "asc";
  }
}
function sortIconFor(key: SortKey) {
  const s = activeState.value;
  if (s.sortKey !== key) return "sort-default";
  return s.sortDir === "asc" ? "sort-ascending" : "sort-descending";
}
function setPerPage(n: number) {
  activeState.value.perPage = n;
  activeState.value.page = 1;
}
function onJumpPage(val: unknown) {
  const v = val && typeof val === "object" ? (val as { value: number }).value : val;
  const n = Number(v);
  if (!Number.isNaN(n)) activeState.value.page = n;
}
function onOpen(row: SalesRow) {
  void row;
}

// Drawer lifecycle — draft/applied staged state (see docs/patterns/AdvancedFilter.md).
function openFilterDrawer() {
  const s = activeState.value;
  Object.assign(s.draft, cloneSalesFilterState(s.applied));
  s.dateErrors.tx = "";
  s.dateErrors.due = "";
  s.isFilterDrawerOpen = true;
}
function discardDraft() {
  const s = activeState.value;
  Object.assign(s.draft, cloneSalesFilterState(s.applied));
  s.isFilterDrawerOpen = false;
}
function resetDraft() {
  Object.assign(activeState.value.draft, createEmptySalesFilterState());
}
function applyDraft() {
  const s = activeState.value;
  const cfg = activeConfig.value;
  const txOk = isValidDateRange(s.draft.txFrom, s.draft.txTo);
  const dueOk = !cfg.dueDate || isValidDateRange(s.draft.dueFrom, s.draft.dueTo);
  s.dateErrors.tx = txOk ? "" : "End date must be on or after the start date.";
  s.dateErrors.due = dueOk ? "" : "End date must be on or after the start date.";
  if (!txOk || !dueOk) return;
  Object.assign(s.applied, cloneSalesFilterState(s.draft));
  s.isFilterDrawerOpen = false;
  s.page = 1;
}
function clearAllFilters() {
  Object.assign(activeState.value.applied, createEmptySalesFilterState());
  Object.assign(activeState.value.draft, createEmptySalesFilterState());
}

// Blank-slate copy — advanced-filter zero-match gets a "Clear all filters"
// CTA, a documented exception to BlankSlate.md's no-CTA rule.
const emptyReason = computed<"search" | "filter" | "none">(() => {
  const f = activeState.value.applied;
  const n = activeFilterCount.value;
  if (n === 0) return "none";
  if (n === 1 && f.keyword.trim()) return "search";
  return "filter";
});
const emptyTitle = computed(() => {
  if (emptyReason.value === "search") return `"${searchTerm.value}" not found`;
  if (emptyReason.value === "filter") return "No results match your filters";
  return "No data yet";
});
const emptyDescription = computed(() => {
  if (emptyReason.value === "search")
    return "Check the keywords you entered and try your search again.";
  if (emptyReason.value === "filter")
    return "Your filter criteria didn't match any transaction. Try widening a date range or clearing a filter.";
  return "There's nothing here yet.";
});

// KPI summary cards — product judgment per tab's own status vocabulary (see
// docs/patterns/AdvancedFilter.md for the rationale); computed off each
// tab's full dataset, not the current filter.
function within30Days(iso: string): boolean {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days <= 30;
}
function sum(rows: SalesRow[], pick: (r: SalesRow) => number): number {
  return rows.reduce((acc, r) => acc + pick(r), 0);
}

// Every card follows the real Sales index's shape uniformly: a count badge
// in the top band, "Total" caption, and a currency amount — never a bare
// count standing in as the "amount".
const activeSummaryCards = computed(() => {
  const rows = SALES_ROWS[activeTabKey.value];
  switch (activeTabKey.value) {
    case "invoice": {
      const unpaid = rows.filter((r) => r.status === "Unpaid" || r.status === "Partially paid");
      const overdue = rows.filter((r) => r.status === "Overdue");
      const paid = rows.filter(
        (r) => (r.status === "Paid" || r.status === "Partially paid") && within30Days(r.date)
      );
      return [
        {
          variant: "orange" as const,
          label: "Unpaid invoices",
          count: unpaid.length,
          amount: formatIDR(sum(unpaid, (r) => r.balance))
        },
        {
          variant: "red" as const,
          label: "Overdue invoices",
          count: overdue.length,
          amount: formatIDR(sum(overdue, (r) => r.balance))
        },
        {
          variant: "green" as const,
          label: "Payments received, last 30 days",
          count: paid.length,
          amount: formatIDR(sum(paid, (r) => r.total - r.balance))
        }
      ];
    }
    case "order": {
      const open = rows.filter((r) => r.status === "Open");
      const partial = rows.filter((r) => r.status === "Partially sent");
      const closed = rows.filter((r) => r.status === "Closed" && within30Days(r.date));
      return [
        {
          variant: "orange" as const,
          label: "Open orders",
          count: open.length,
          amount: formatIDR(sum(open, (r) => r.total))
        },
        {
          variant: "red" as const,
          label: "Partially sent orders",
          count: partial.length,
          amount: formatIDR(sum(partial, (r) => r.total))
        },
        {
          variant: "green" as const,
          label: "Closed orders, last 30 days",
          count: closed.length,
          amount: formatIDR(sum(closed, (r) => r.total))
        }
      ];
    }
    case "delivery": {
      const open = rows.filter((r) => r.status === "Open");
      const today = new Date().toISOString().slice(0, 10);
      const overdue = rows.filter((r) => r.status === "Open" && r.due && r.due < today);
      const closed = rows.filter((r) => r.status === "Closed" && within30Days(r.date));
      return [
        {
          variant: "orange" as const,
          label: "Open deliveries",
          count: open.length,
          amount: formatIDR(sum(open, (r) => r.total))
        },
        {
          variant: "red" as const,
          label: "Overdue deliveries",
          count: overdue.length,
          amount: formatIDR(sum(overdue, (r) => r.total))
        },
        {
          variant: "green" as const,
          label: "Closed deliveries, last 30 days",
          count: closed.length,
          amount: formatIDR(sum(closed, (r) => r.total))
        }
      ];
    }
    default: {
      const open = rows.filter((r) => r.status === "Open");
      const created = rows.filter((r) => within30Days(r.date));
      const closed = rows.filter((r) => r.status === "Closed" && within30Days(r.date));
      return [
        {
          variant: "orange" as const,
          label: "Open quotations",
          count: open.length,
          amount: formatIDR(sum(open, (r) => r.total))
        },
        {
          variant: "gray" as const,
          label: "Quotations created, last 30 days",
          count: created.length,
          amount: formatIDR(sum(created, (r) => r.total))
        },
        {
          variant: "green" as const,
          label: "Closed quotations, last 30 days",
          count: closed.length,
          amount: formatIDR(sum(closed, (r) => r.total))
        }
      ];
    }
  }
});

// Table columns — order and presence match the real Sales index (Date,
// Number, Customer, Due date, Status, Balance due, Total, Tags). Document
// sub-type is a toolbar-only quick select there, never a table column.
const columns = computed(() => {
  const cfg = activeConfig.value;
  const cols: { key: SortKey; label: string; numeric?: boolean }[] = [
    { key: "date", label: "Date" },
    { key: "number", label: "Number" },
    { key: "customer", label: "Customer" }
  ];
  if (cfg.dueDate) cols.push({ key: "due", label: "Due date" });
  cols.push({ key: "status", label: "Status" });
  cols.push({ key: "balance", label: "Balance due", numeric: true });
  cols.push({ key: "total", label: "Total", numeric: true });
  cols.push({ key: "tags", label: "Tags" });
  return cols;
});

// Minimum comfortable pixel width per column — generous enough for the
// column's header label + sort icon + cell padding to render without
// ellipsis, and for the column's typical data ("Sales Invoice #10040",
// "Proforma Invoice", a "Partially paid" badge, …). This is the single
// source of truth for both the table's overall minWidth (below) and the
// <colgroup> percentages (colWidths) — so the ratios always match the real
// per-column minimums, and Quotation/Delivery/Order/Invoice (6/7/7/8
// columns) each get a minWidth sized to their own column set rather than one
// guessed constant that's too tight for the wider tabs.
const COLUMN_MIN_PX: Record<SortKey, number> = {
  number: 150,
  customer: 160,
  date: 90,
  due: 112,
  status: 110,
  total: 110,
  balance: 130,
  tags: 150
};
const CHECKBOX_COL_PX = 44;
const ACTIONS_COL_PX = 140;

const colWidths = computed(() => {
  const cols = columns.value;
  const totalMin = cols.reduce((sum, col) => sum + COLUMN_MIN_PX[col.key], 0);
  const pct = cols.map((col) => ((COLUMN_MIN_PX[col.key] / totalMin) * 100).toFixed(2) + "%");
  return [`${CHECKBOX_COL_PX}px`, ...pct, `${ACTIONS_COL_PX}px`];
});

// Applied as an inline :style on <MpTable> (like the <col> widths above) —
// this genuinely varies per tab's column set, so a static Panda css() literal
// can't represent it; see docs/patterns/TablePage.md.
const tableMinWidth = computed(() => {
  const cols = columns.value;
  const totalMin = cols.reduce((sum, col) => sum + COLUMN_MIN_PX[col.key], 0);
  return `${CHECKBOX_COL_PX + totalMin + ACTIONS_COL_PX}px`;
});

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Single source of per-column cell text — used both for the rendered
// content and the cell's :title (so truncated/clipped text is still
// readable on hover). Status and Tags are excluded — they render as an
// MpBadge / tag chips, not plain text.
function cellValue(row: SalesRow, key: SortKey): string {
  switch (key) {
    case "total":
      return formatIDR(row.total);
    case "balance":
      return formatIDR(row.balance);
    case "date":
      return formatDate(row.date);
    case "due":
      return formatDate(row.due);
    case "number":
      return row.number;
    case "customer":
      return row.customer;
    case "tags":
      return row.tags.length ? row.tags.join(", ") : "-";
    default:
      return String(row[key] ?? "-");
  }
}

// Horizontal-overflow detection for the pinned Actions column divider.
const tableContainerRef = ref<{ $el?: HTMLElement } | null>(null);
const isTableOverflowing = ref(false);
let overflowObserver: ResizeObserver | null = null;

function checkTableOverflow() {
  const el = tableContainerRef.value?.$el;
  if (el) isTableOverflowing.value = el.scrollWidth > el.clientWidth + 1;
}

onMounted(() => {
  checkTableOverflow();
  const el = tableContainerRef.value?.$el;
  if (el && typeof ResizeObserver !== "undefined") {
    overflowObserver = new ResizeObserver(checkTableOverflow);
    overflowObserver.observe(el);
  }
  window.addEventListener("resize", checkTableOverflow);
});
onBeforeUnmount(() => {
  overflowObserver?.disconnect();
  window.removeEventListener("resize", checkTableOverflow);
});
watch(
  () => filteredRows.value.length,
  () => requestAnimationFrame(checkTableOverflow)
);

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const statsGridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 4,
  mb: 5
});
const filterBarClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap",
  mb: 3
});
const filterLeftClass = css({ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" });
const filterRightClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const quickFilterClass = css({ width: "180px" });
const searchGroupClass = css({
  position: "relative",
  width: "260px",
  "& [data-search-clear]": { opacity: 0, transition: "opacity 0.12s ease" },
  "&:hover [data-search-clear], &:focus-within [data-search-clear]": { opacity: 1 }
});
const searchClearClass = css({
  position: "absolute",
  top: "50%",
  right: "3",
  transform: "translateY(-50%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "0",
  bg: "transparent",
  p: 0,
  cursor: "pointer",
  lineHeight: "0"
});
const scopeNoteClass = css({ mb: 3 });
const tableFixedClass = css({ tableLayout: "fixed" });
const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const actionHeadClass = css({ position: "sticky", right: "0", zIndex: 3, bg: "gray.25" });
const actionCellClass = css({ position: "sticky", right: "0", zIndex: 1 });
const actionBorderClass = css({ boxShadow: "inset 2px 0 0 0 var(--mp-colors-gray-100)" });
const numCellClass = css({ textAlign: "right" });
// Single-line chip row — matches the rest of the table's one-line-per-cell
// convention; chips beyond the available width are clipped, not wrapped.
const tagListClass = css({ display: "inline-flex", gap: 1, overflow: "hidden" });
// For a <td> (MpTableCell): must NOT set display, since td needs to stay
// display:table-cell for the fixed <colgroup> widths to hold.
const cellClipClass = css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
// For inline content (e.g. the MpTextlink button's label span) that needs
// forcing to block level before overflow/ellipsis can apply to it at all.
const truncateSpanClass = css({
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: "0",
  maxWidth: "full"
});
const checkboxCellClass = css({ width: "44px", pl: "3!", pr: "0!" });
const sortHeaderClass = css({
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: "0",
  maxWidth: "full",
  border: "0",
  bg: "transparent",
  p: 0,
  cursor: "pointer",
  color: "inherit",
  font: "inherit"
});
const bulkBarClass = css({ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" });
const bulkCellClass = css({ py: "11px!" });
const skeletonBarClass = css({ display: "block", height: "4", rounded: "sm" });
const emptyStateClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  py: 16,
  textAlign: "center"
});
const emptyIllustrationClass = css({ width: "180px", height: "auto", mb: 1 });
const emptyTitleClass = css({ fontSize: "lg" });
const emptyDescClass = css({ maxWidth: "320px" });
const paginationClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 3,
  py: 3
});
const pagerLeftClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const pagerRightClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const pageJumpClass = css({ width: "100px" });
const pageJumpInnerClass = css({ h: "7.5" });
</script>
