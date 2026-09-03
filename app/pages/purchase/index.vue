<template>
  <DefaultPageContent title="Purchases">
    <!-- Title-band actions: Import (plain secondary) + New (primary dropdown
         of transaction types). Cloned from jurnal-frontend-app
         src/pages/purchases/index.vue — the "New" popover lists every
         purchase transaction type the user can create. -->
    <template #actions>
      <MpButton variant="secondary">Import</MpButton>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <template #default>
          <MpPopoverTrigger>
            <MpButton variant="primary" right-icon="caret-down">Create new purchase</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent>
            <MpPopoverList>
              <MpPopoverListItem
                v-for="item in NEW_TRANSACTION_ITEMS"
                :key="item.key"
                role="menuitem"
                @click="onNewTransaction(item.key)"
              >
                {{ item.label }}
              </MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </template>
      </MpPopover>
    </template>

    <!-- Zone A — Summary boxes (KPI strip). Scoped to `filteredRows` — the
         rows actually in the table below — so it can never describe a
         different dataset than the one it sits on top of. The caption states
         that scope explicitly. -->
    <div :class="statsGridClass">
      <SummaryBox
        variant="orange"
        label="Open"
        :badge="summary.open.count"
        :amount="formatAmount(summary.open.amount)"
        is-filter
        :is-active="quickStatus === 'open'"
        @click="onSummaryClick('open')"
      />
      <SummaryBox
        variant="red"
        label="Overdue"
        :badge="summary.overdue.count"
        :amount="formatAmount(summary.overdue.amount)"
        is-filter
        :is-active="quickStatus === 'overdue'"
        @click="onSummaryClick('overdue')"
      />
      <SummaryBox variant="green" label="Total value" :amount="formatAmount(summary.totalValue.amount)" is-hoverable />
    </div>
    <div :class="statsCaptionClass">
      <MpText size="body-small" color="gray.600">{{ summaryScopeLabel }} · updated as of {{ asOfDate }}</MpText>
    </div>

    <!-- Zone B — content tabs. Mirrors the 9 tabs of the source page's
         tabs_obj (Invoice / Join invoice / Delivery / Order / Quote /
         Request / Need approval / Rejected / Financing); each tab swaps
         both the table's column set and the status quick-filter options,
         matching the source page's setTableHeads()/status_options logic. -->
    <MpTabs v-model="activeTabIndex" variant-color="blue">
      <MpTabList>
        <MpTab v-for="tab in TABS" :key="tab.key">
          <span :class="tabLabelClass">
            {{ tab.label }}
            <MpBadge v-if="tab.key === 'ap'" for="additionalInformation" type="announcement">
              {{ approvalCount }}
            </MpBadge>
          </span>
        </MpTab>
      </MpTabList>
    </MpTabs>

    <!-- Zone C — filter bar. The status quick-select is omitted for tabs
         with no status_options in the source page (Join invoice, Need
         approval, Rejected, Financing) — the row then right-aligns to the
         search field, matching the original layout. -->
    <div :class="filterBarClass">
      <div :class="filterLeftClass">
        <div v-if="statusOptions.length" :class="quickFilterClass">
          <MpSelect v-model="quickStatus" placeholder="All status" is-full-width is-clearable>
            <option value="">All status</option>
            <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ STATUS_LABEL[opt] }}</option>
          </MpSelect>
        </div>
      </div>

      <div :class="filterRightClass">
        <MpButton variant="secondary" left-icon="filter" @click="isFilterDrawerOpen = true">Filter</MpButton>
        <div :class="searchGroupClass">
          <MpInputGroup>
            <MpInputLeftAddon>
              <MpIcon name="search" size="sm" color="gray.400" />
            </MpInputLeftAddon>
            <MpInput v-model="search" placeholder="Search number, vendor, or tag..." />
          </MpInputGroup>
          <button
            v-if="searchTerm"
            type="button"
            data-search-clear
            aria-label="Clear search"
            :class="searchClearClass"
            @click="search = ''"
          >
            <MpIcon name="reset" size="sm" color="gray.400" />
          </button>
        </div>
      </div>
    </div>

    <!-- Full filter drawer — mirrors the source page's advance-search modal
         (date range, due-date range, amount range, tag), scoped down to the
         fields relevant to a prototype. Applies live; Apply just closes. -->
    <MpDrawer :is-open="isFilterDrawerOpen" placement="right" size="sm" @close="isFilterDrawerOpen = false">
      <MpDrawerOverlay />
      <MpDrawerContent>
        <MpDrawerHeader>
          <span :class="drawerTitleClass">Filter</span>
          <MpDrawerCloseButton />
        </MpDrawerHeader>
        <MpDrawerBody>
          <div :class="filterDrawerFormClass">
            <MpFormControl v-if="statusOptions.length">
              <MpFormLabel>Status</MpFormLabel>
              <MpSelect v-model="quickStatus" placeholder="All status" is-full-width is-clearable>
                <option value="">All status</option>
                <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ STATUS_LABEL[opt] }}</option>
              </MpSelect>
            </MpFormControl>

            <MpFormControl>
              <MpFormLabel>Tag</MpFormLabel>
              <MpSelect v-model="filterTag" placeholder="All tags" is-full-width is-clearable>
                <option value="">All tags</option>
                <option v-for="tag in TAG_OPTIONS" :key="tag" :value="tag">{{ tag }}</option>
              </MpSelect>
            </MpFormControl>

            <MpFormControl>
              <MpFormLabel>Amount from</MpFormLabel>
              <MpInput v-model="filterAmountMin" type="number" placeholder="0" is-full-width />
            </MpFormControl>

            <MpFormControl>
              <MpFormLabel>Amount to</MpFormLabel>
              <MpInput v-model="filterAmountMax" type="number" placeholder="0" is-full-width />
            </MpFormControl>
          </div>
        </MpDrawerBody>
        <MpDrawerFooter>
          <div :class="filterDrawerFooterClass">
            <MpButton variant="ghost" @click="resetFilters">Reset</MpButton>
            <MpButton variant="primary" @click="isFilterDrawerOpen = false">Apply</MpButton>
          </div>
        </MpDrawerFooter>
      </MpDrawerContent>
    </MpDrawer>

    <!-- Delete confirmation — shared by the row-level and bulk "Delete"
         actions (pendingDeleteIds holds either one row or the whole
         selection). Destructive action, per docs/patterns/Modal.md. -->
    <MpModal :is-open="showDeleteModal" size="sm" @close="closeDeleteModal">
      <MpModalOverlay />
      <MpModalContent>
        <MpModalHeader>
          <span :class="modalTitleClass">{{ deleteModalTitle }}</span>
          <MpModalCloseButton />
        </MpModalHeader>
        <MpModalBody>
          <MpText size="body" color="gray.700">This can't be undone.</MpText>
        </MpModalBody>
        <MpModalFooter>
          <div :class="modalFooterClass">
            <MpButton variant="secondary" @click="closeDeleteModal">Cancel</MpButton>
            <MpButton variant="danger" @click="confirmDelete">Delete</MpButton>
          </div>
        </MpModalFooter>
      </MpModalContent>
    </MpModal>

    <!-- Zone D/E — table + pager, OR the blank slate. -->
    <template v-if="filteredRows.length">
      <MpTableContainer :class="scrollShadowClass">
        <MpTable is-hoverable :class="tableFixedClass" :style="{ minWidth: tableMinWidth }">
          <colgroup>
            <col :style="{ width: '44px' }" />
            <col v-for="col in columns" :key="col.key" :style="{ width: `${COLUMN_WIDTH[col.key]}px` }" />
          </colgroup>
          <MpTableHead is-fixed :class="tableHeadClass">
            <!-- The bulk bar is its own row ABOVE the header — it must not
                 replace it. Swapping the header out removes the column labels
                 at exactly the moment the user is deciding which rows to act
                 on, and leaves two adjacent money columns (Balance due /
                 Total) unlabelled. See docs/patterns/BulkActionBar.md. -->
            <MpTableRow v-if="selected.length && activeTabKey !== 'ap'">
              <MpTableCell as="th" :colspan="columns.length + 1" :class="bulkCellClass">
                <div :class="bulkBarClass">
                  <MpText size="label" weight="semiBold" color="dark">{{ selected.length }} selected</MpText>
                  <MpButton size="sm" @click="showPrintModal = true">Print PDF</MpButton>
                  <MpButton size="sm" variant="danger" @click="openDeleteModal(selected)">Delete</MpButton>
                  <MpTextlink as="button" variant="secondary" @click="selected = []">Clear selection</MpTextlink>
                </div>
              </MpTableCell>
            </MpTableRow>

            <MpTableRow>
              <MpTableCell v-if="activeTabKey !== 'ap'" as="th" :class="checkboxCellClass">
                <MpCheckbox
                  :is-checked="allOnPageSelected"
                  :is-indeterminate="someOnPageSelected && !allOnPageSelected"
                  @change="toggleAllOnPage"
                />
              </MpTableCell>
              <MpTableCell v-else as="th" :class="checkboxCellClass" />
              <MpTableCell v-for="col in columns" :key="col.key" as="th" :class="col.numeric ? numCellClass : undefined">
                <button type="button" :class="[sortHeaderClass, col.numeric ? sortHeaderNumClass : '']" @click="toggleSort(col.key)">
                  <span :class="headerLabelClass">{{ col.label }}</span>
                  <MpIcon :name="sortIconFor(col.key)" size="sm" color="gray.400" />
                </button>
              </MpTableCell>
            </MpTableRow>
          </MpTableHead>

          <MpTableBody v-if="isLoading">
            <MpTableRow v-for="n in 5" :key="`skeleton-${n}`">
              <MpTableCell v-for="col in columns.length + 1" :key="col" as="td">
                <MpSkeleton is-loading><span :class="skeletonBarClass" /></MpSkeleton>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>

          <MpTableBody v-else>
            <MpTableRow v-for="row in pagedRows" :key="row.id">
              <MpTableCell v-if="activeTabKey !== 'ap'" as="td" :class="checkboxCellClass">
                <MpCheckbox :is-checked="selected.includes(row.id)" @change="toggleRow(row.id)" />
              </MpTableCell>
              <MpTableCell v-else as="td" :class="checkboxCellClass" />

              <MpTableCell v-for="col in columns" :key="col.key" as="td" :class="col.numeric ? numCellClass : undefined">
                <template v-if="col.key === 'number'">
                  <MpTextlink as="button" variant="primary" :class="wrapCellClass" @click="onOpen(row)">{{ row.number }}</MpTextlink>
                  <MpText v-if="row.memo" size="body-small" color="gray.600" :class="wrapCellClass">{{ row.memo }}</MpText>
                </template>
                <template v-else-if="col.key === 'status'">
                  <MpBadge for="tableStatus" :type="STATUS_TYPE[row.status]">{{ STATUS_LABEL[row.status] }}</MpBadge>
                </template>
                <template v-else-if="col.key === 'tags'">
                  <MpText v-if="row.tags.length" size="body-small" :class="wrapCellClass">{{ row.tags.join(", ") }}</MpText>
                  <MpText v-else size="body-small" color="gray.400">—</MpText>
                </template>
                <template v-else-if="col.key === 'urgency'">
                  <MpFlex v-if="row.urgency" gap="2" align-items="center">
                    <MpIcon :name="`priority-${row.urgency.priority}`" size="sm" />
                    <MpText size="body-small">{{ row.urgency.label }}</MpText>
                  </MpFlex>
                </template>
                <template v-else><span :class="col.numeric ? numWrapCellClass : wrapCellClass">{{ cellText(row, col.key) }}</span></template>
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
              <MpButton variant="ghost" size="sm" right-icon="chevrons-down">{{ perPage }}</MpButton>
            </MpPopoverTrigger>
            <MpPopoverContent>
              <MpPopoverList>
                <MpPopoverListItem v-for="opt in [10, 25, 50]" :key="opt" :is-active="perPage === opt" @click="setPerPage(opt)">
                  {{ opt }}
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
          <MpText size="body-small" color="gray.600">Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredRows.length }}</MpText>
        </div>

        <div :class="pagerRightClass">
          <div :class="pageJumpClass">
            <MpAutocomplete :class="pageJumpInnerClass" :data="pageOptions" :model-value="page" is-searchable is-full-width @change="onJumpPage" />
          </div>
          <MpText size="body-small" color="gray.600">of {{ pageCount }} page</MpText>
          <MpTooltip label="Previous page">
            <MpButton variant="ghost" size="sm" left-icon="chevrons-left" :is-disabled="page <= 1" aria-label="Previous page" @click="page--" />
          </MpTooltip>
          <MpTooltip label="Next page">
            <MpButton variant="ghost" size="sm" left-icon="chevrons-right" :is-disabled="page >= pageCount" aria-label="Next page" @click="page++" />
          </MpTooltip>
        </div>
      </div>
    </template>

    <div v-else :class="emptyStateClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ emptyTitle }}</MpText>
      <MpText size="body-small" color="gray.600" :class="emptyDescClass">{{ emptyDescription }}</MpText>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  css,
  MpAutocomplete,
  MpBadge,
  MpButton,
  MpCheckbox,
  MpDrawer,
  MpDrawerBody,
  MpDrawerCloseButton,
  MpDrawerContent,
  MpDrawerFooter,
  MpDrawerHeader,
  MpDrawerOverlay,
  MpFlex,
  MpFormControl,
  MpFormLabel,
  MpIcon,
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
  MpText,
  MpTextlink,
  MpTooltip,
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import SummaryBox from "~/components/template/SummaryBox.vue";
import { PURCHASE_STATUS_LABEL, PURCHASE_STATUS_TYPE, type PurchaseStatus } from "~/data/purchase-status";
import {
  TAG_OPTIONS,
  TYPE_CAPABILITIES,
  formatAmount,
  deleteTransactions,
  getPurchaseTransactions,
  todayDisplayDate,
  type PurchaseTransaction,
  type TransactionType,
} from "~/data/purchase-transactions";

useHead({ title: "Purchases — Mekari Jurnal" });

// ---------------------------------------------------------------------------
// Cloned from jurnal-frontend-app src/pages/purchases/{index,list}.vue.
// This is a UI-only prototype: no backend, no approval workflow, no Mekari
// Pay integration, no Mixpanel — those are business-logic concerns of the
// real app. What's ported is the *shape* of the screen: the 9 transaction
// tabs, the per-tab column set (setTableHeads()), the per-tab status
// quick-filter options (status_options), summary boxes, filter bar, bulk
// bar, and pagination — built per docs/index-page-pattern.md.
// ---------------------------------------------------------------------------

type TabKey = "pi" | "jpi" | "pd" | "po" | "pq" | "pr" | "ap" | "rj" | "fi";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pi", label: "Invoice" },
  { key: "jpi", label: "Join invoice" },
  { key: "pd", label: "Delivery" },
  { key: "po", label: "Order" },
  { key: "pq", label: "Quote" },
  { key: "pr", label: "Request" },
  { key: "ap", label: "Need approval" },
  { key: "rj", label: "Rejected" },
  { key: "fi", label: "Financing" },
];

// Labels + order match the real product's "Create new purchase" popover
// (Purchase invoice / Join invoice / Purchase order / Purchase quote /
// Purchase request — no "Delivery" entry there, a delivery is created from
// an existing order instead).
const NEW_TRANSACTION_ITEMS: { key: TransactionType; label: string }[] = [
  { key: "invoice", label: "Purchase invoice" },
  { key: "join_invoice", label: "Join invoice" },
  { key: "order", label: "Purchase order" },
  { key: "quote", label: "Purchase quote" },
  { key: "request", label: "Purchase request" },
];

// Status vocabulary + the Invoice tab's mock data now live in app/data/ so the
// detail page (app/pages/purchase/invoice/[id].vue) can share the exact same
// records — clicking an invoice row opens a detail page with matching data.
type StatusValue = PurchaseStatus;
const STATUS_LABEL = PURCHASE_STATUS_LABEL;
const STATUS_TYPE = PURCHASE_STATUS_TYPE;

// Status quick-filter options per tab — mirrors the source page's
// `status_options` getter (a switch on `active_tab.key`). Tabs absent from
// that switch (jpi, ap, rj, fi) get no quick-filter select.
const STATUS_OPTIONS_BY_TAB: Record<TabKey, StatusValue[]> = {
  pi: ["open", "overdue", "paid", "partial", "unpaid"],
  jpi: [],
  pd: ["open", "closed"],
  po: ["open", "partially_sent", "closed"],
  pq: ["open", "closed"],
  pr: ["open", "partial", "closed"],
  ap: [],
  rj: [],
  fi: [],
};

type ColumnKey =
  | "transactionDate"
  | "number"
  | "vendor"
  | "procurementStaff"
  | "dueDate"
  | "status"
  | "depositAmount"
  | "balanceDue"
  | "totalAmount"
  | "totalItems"
  | "urgency"
  | "tags";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  numeric?: boolean;
}

// Per-tab column sets — mirrors the source page's setTableHeads(), which
// starts from a shared base (`heads`) and flips a handful of `show` flags
// per tab.
const COLUMNS_BY_TAB: Record<TabKey, ColumnDef[]> = {
  pi: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "balanceDue", label: "Balance due", numeric: true },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
  jpi: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "balanceDue", label: "Balance due", numeric: true },
    { key: "totalAmount", label: "Total", numeric: true },
  ],
  pd: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "status", label: "Status" },
    { key: "tags", label: "Tags" },
  ],
  po: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "depositAmount", label: "Deposit", numeric: true },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
  pq: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "status", label: "Status" },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
  pr: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "procurementStaff", label: "Procurement staff" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "totalItems", label: "Total items" },
    { key: "urgency", label: "Urgency" },
    { key: "tags", label: "Tags" },
  ],
  ap: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Expiry date" },
    { key: "status", label: "Status" },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
  rj: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
  fi: [
    { key: "transactionDate", label: "Date" },
    { key: "number", label: "Number" },
    { key: "vendor", label: "Vendor" },
    { key: "dueDate", label: "Due date" },
    { key: "status", label: "Status" },
    { key: "totalAmount", label: "Total", numeric: true },
    { key: "tags", label: "Tags" },
  ],
};

interface Row {
  id: number;
  transactionDate: string;
  transactionDateSort: string;
  number: string;
  memo: string;
  vendor: string;
  procurementStaff: string;
  dueDate: string;
  dueDateSort: string;
  status: StatusValue;
  depositAmount: number;
  balanceDue: number;
  totalAmount: number;
  totalItems: number;
  urgency: { priority: "high" | "medium" | "low"; label: string } | null;
  tags: string[];
}

// ---- Shared dataset → per-tab rows --------------------------------------
//
// app/data/purchase-transactions.ts holds ONE array spanning all 7 real
// transaction types. The 7 type tabs and the 2 cross-cutting tabs (Need
// approval, Rejected) are all just filtered views over it — see that
// module's doc comment for why (in short: so a duplicated/reset record has
// exactly one place to reappear, instead of a fake per-tab list it can never
// leave).

// Which TABS entries are a straight `type` filter; "ap"/"rj" have no direct
// type (they cut across every type instead — see rowsForTab).
const TAB_TYPE: Partial<Record<TabKey, TransactionType>> = {
  pi: "invoice",
  jpi: "join_invoice",
  pd: "delivery",
  po: "order",
  pq: "quote",
  pr: "request",
  fi: "financing",
};

function toRow(t: PurchaseTransaction): Row {
  return {
    id: t.id,
    transactionDate: t.transactionDate,
    transactionDateSort: t.transactionDateSort,
    number: t.number,
    memo: t.memo,
    vendor: t.vendorName,
    procurementStaff: t.procurementStaff,
    dueDate: t.dueDate,
    dueDateSort: t.dueDateSort,
    status: t.status,
    depositAmount: t.depositAmount,
    balanceDue: t.balanceDue,
    totalAmount: t.total,
    totalItems: t.lines.length,
    urgency: t.urgency,
    tags: t.tags,
  };
}

function rowsForTab(tab: TabKey): Row[] {
  const all = getPurchaseTransactions();
  if (tab === "ap") {
    return all.filter((t) => t.needsApproval && t.status !== "rejected").map(toRow);
  }
  if (tab === "rj") {
    return all.filter((t) => t.status === "rejected").map(toRow);
  }
  const type = TAB_TYPE[tab];
  // A record that's pending approval or rejected lives only in its
  // cross-cutting tab, not also under its own type — see the module doc
  // comment on rowsForTab above.
  return all.filter((t) => t.type === type && t.status !== "rejected" && !t.needsApproval).map(toRow);
}

const approvalCount = computed(() => {
  void refreshTick.value;
  return rowsForTab("ap").length;
});
// Names the scope the KPI figures cover, so the strip can't be mistaken for a
// module-wide summary when a tab or filter is narrowing it.
const summaryScopeLabel = computed(() => {
  const tab = TABS[activeTabIndex.value]!.label;
  const narrowed = Boolean(searchTerm.value || quickStatus.value || filterTag.value || filterAmountMin.value || filterAmountMax.value);
  return narrowed ? `${tab} · filtered` : tab;
});

const asOfDate = todayDisplayDate();

// ---- Page state ---------------------------------------------------------

const activeTabIndex = ref(0);
const activeTabKey = computed<TabKey>(() => TABS[activeTabIndex.value]!.key);
const columns = computed(() => COLUMNS_BY_TAB[activeTabKey.value]);
const statusOptions = computed(() => STATUS_OPTIONS_BY_TAB[activeTabKey.value]);

const isFilterDrawerOpen = ref(false);
const search = ref("");
const quickStatus = ref("");
const filterTag = ref("");
const filterAmountMin = ref("");
const filterAmountMax = ref("");
const page = ref(1);
const perPage = ref(10);
const selected = ref<number[]>([]);
const sortKey = ref<ColumnKey | null>(null);
const sortDir = ref<"asc" | "desc">("asc");
const isLoading = ref(false);
const showPrintModal = ref(false);
const showDeleteModal = ref(false);
const pendingDeleteIds = ref<number[]>([]);
// The shared dataset (app/data/purchase-transactions.ts) is a plain
// (non-reactive) array — bumping this after a mutation (delete/duplicate) is
// what makes filteredRows/summary/approvalCount re-read it.
const refreshTick = ref(0);

const searchTerm = computed(() => (search.value ?? "").trim());

// Switching tabs resets page/selection/sort/status, same as the source
// page's `@Watch('active_tab')`.
watch(activeTabIndex, () => {
  page.value = 1;
  selected.value = [];
  sortKey.value = null;
  quickStatus.value = "";
});

function sortValue(row: Row, key: ColumnKey): string | number {
  switch (key) {
    case "transactionDate":
      return row.transactionDateSort;
    case "dueDate":
      return row.dueDateSort;
    case "urgency":
      return row.urgency ? row.urgency.priority : "";
    case "tags":
      return row.tags.join(", ");
    default:
      return (row as unknown as Record<string, string | number>)[key] ?? "";
  }
}

function cellText(row: Row, key: ColumnKey): string {
  switch (key) {
    case "vendor":
      return row.vendor;
    case "procurementStaff":
      return row.procurementStaff;
    case "dueDate":
      return row.dueDate;
    case "transactionDate":
      return row.transactionDate;
    case "balanceDue":
      return formatAmount(row.balanceDue);
    case "totalAmount":
      return formatAmount(row.totalAmount);
    case "depositAmount":
      return formatAmount(row.depositAmount);
    case "totalItems":
      return `${row.totalItems} items`;
    default:
      return "";
  }
}

const filteredRows = computed(() => {
  void refreshTick.value;
  const term = searchTerm.value.toLowerCase();
  const min = filterAmountMin.value ? Number(filterAmountMin.value) : null;
  const max = filterAmountMax.value ? Number(filterAmountMax.value) : null;

  let result = rowsForTab(activeTabKey.value).filter((row) => {
    const matchesTerm = !term || row.number.toLowerCase().includes(term) || row.vendor.toLowerCase().includes(term) || row.tags.some((t) => t.toLowerCase().includes(term));
    const matchesStatus = !quickStatus.value || row.status === quickStatus.value;
    const matchesTag = !filterTag.value || row.tags.includes(filterTag.value);
    const matchesMin = min === null || row.totalAmount >= min;
    const matchesMax = max === null || row.totalAmount <= max;
    return matchesTerm && matchesStatus && matchesTag && matchesMin && matchesMax;
  });

  if (sortKey.value) {
    const key = sortKey.value;
    const dir = sortDir.value === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      const av = sortValue(a, key);
      const bv = sortValue(b, key);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }
  return result;
});

// KPI strip — derived from `filteredRows`, i.e. exactly the rows the table is
// showing, so it always summarises what's underneath it. It used to be scoped
// to Invoice-type records only and ignored the tab, filters and search, which
// meant it silently described a different dataset than the table it sat on top
// of (invoice totals while you were reading the Request tab; millions while a
// search rendered "not found"). A KPI strip directly above a table is read as
// a summary OF that table — see docs/patterns/SummaryBox.md.
const summary = computed(() => {
  const rows = filteredRows.value;
  const open = rows.filter((r) => r.status === "open");
  const overdue = rows.filter((r) => r.status === "overdue");
  return {
    open: { count: open.length, amount: open.reduce((sum, r) => sum + r.balanceDue, 0) },
    overdue: { count: overdue.length, amount: overdue.reduce((sum, r) => sum + r.balanceDue, 0) },
    // "Total value" rather than the old "Payment (last 30 days)": a payments
    // figure only exists for money-bearing invoice records, so it could never
    // honestly describe the Request or Delivery tabs.
    totalValue: { amount: rows.reduce((sum, r) => sum + r.totalAmount, 0) },
  };
});

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage.value)));
const pageOptions = computed(() => Array.from({ length: pageCount.value }, (_, i) => ({ label: String(i + 1), value: i + 1 })));
const pagedRows = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filteredRows.value.slice(start, start + perPage.value);
});
const rangeStart = computed(() => (filteredRows.value.length === 0 ? 0 : (page.value - 1) * perPage.value + 1));
const rangeEnd = computed(() => Math.min(page.value * perPage.value, filteredRows.value.length));

watch([page, pageCount], () => {
  if (page.value < 1) page.value = 1;
  else if (page.value > pageCount.value) page.value = pageCount.value;
});

const allOnPageSelected = computed(() => pagedRows.value.length > 0 && pagedRows.value.every((r) => selected.value.includes(r.id)));
const someOnPageSelected = computed(() => pagedRows.value.some((r) => selected.value.includes(r.id)));

function toggleRow(id: number) {
  selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id];
}
function toggleAllOnPage() {
  const ids = pagedRows.value.map((r) => r.id);
  selected.value = allOnPageSelected.value ? selected.value.filter((x) => !ids.includes(x)) : [...new Set([...selected.value, ...ids])];
}
function toggleSort(key: ColumnKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
  page.value = 1;
}
function sortIconFor(key: ColumnKey) {
  if (sortKey.value !== key) return "sort-default";
  return sortDir.value === "asc" ? "sort-ascending" : "sort-descending";
}
function setPerPage(n: number) {
  perPage.value = n;
  page.value = 1;
}
function onJumpPage(val: unknown) {
  const v = val && typeof val === "object" ? (val as { value: number }).value : val;
  const n = Number(v);
  if (!Number.isNaN(n)) page.value = n;
}
// The KPI boxes now describe the CURRENT tab, so clicking one filters in
// place rather than jumping to the Invoice tab — jumping would contradict the
// figure the user just clicked. Clicking an active box clears the filter.
function onSummaryClick(status: StatusValue) {
  if (!statusOptions.value.includes(status)) return; // tab has no such status
  quickStatus.value = quickStatus.value === status ? "" : status;
}

const emptyTitle = computed(() => {
  if (searchTerm.value) return `"${searchTerm.value}" not found`;
  if (quickStatus.value || filterTag.value || filterAmountMin.value || filterAmountMax.value) return "No results found";
  return "No data yet";
});
const emptyDescription = computed(() => {
  if (searchTerm.value) return "Check the keywords you entered and try your search again.";
  if (quickStatus.value || filterTag.value || filterAmountMin.value || filterAmountMax.value)
    return "No items match your filters. Try adjusting them, or clear all filters to start over.";
  return "There's nothing here yet.";
});

function resetFilters() {
  quickStatus.value = "";
  filterTag.value = "";
  filterAmountMin.value = "";
  filterAmountMax.value = "";
  search.value = "";
}

// Invoice, Order, Request, Quote, Delivery, and Join Invoice are the only
// types with a detail page so far (app/pages/purchase/{invoice,order,
// request,quote,delivery,join-invoice}/[id].vue). Other tabs are no-ops
// until their own show pages land. Keyed by TransactionType, not TabKey, so
// it doubles as the "where does a duplicate of this type land" map below
// (Delivery and Join Invoice have no Duplicate action on their own pages,
// but a duplicate landing here from elsewhere would still resolve
// correctly).
const DETAIL_ROUTE: Partial<Record<TransactionType, string>> = {
  invoice: "/purchase/invoice",
  order: "/purchase/order",
  request: "/purchase/request",
  quote: "/purchase/quote",
  delivery: "/purchase/delivery",
  join_invoice: "/purchase/join-invoice",
};
const TAB_DETAIL_ROUTE = computed(() => (TAB_TYPE[activeTabKey.value] ? DETAIL_ROUTE[TAB_TYPE[activeTabKey.value]!] : undefined));

function onOpen(row: Row) {
  const base = TAB_DETAIL_ROUTE.value;
  if (base) navigateTo(`${base}/${row.id}`);
}

// Every type in this menu now has its own create route — see TYPE_CAPABILITIES
// for the route segment each one owns.
function onNewTransaction(key: string) {
  const route = TYPE_CAPABILITIES[key as TransactionType]?.route;
  if (route) navigateTo(`/purchase/${route}/new`);
}

// ---- Delete confirmation (row-level and bulk) ---------------------------

const deleteModalTitle = computed(() => {
  const ids = pendingDeleteIds.value;
  if (ids.length === 1) {
    // ids are globally unique across the whole shared dataset, so this finds
    // the record regardless of which tab it's being deleted from.
    const record = getPurchaseTransactions().find((t) => t.id === ids[0]);
    return `Delete ${record?.number ?? "this item"}?`;
  }
  return `Delete ${ids.length} items?`;
});

function openDeleteModal(ids: number[]) {
  if (!ids.length) return;
  pendingDeleteIds.value = ids;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  pendingDeleteIds.value = [];
}

function confirmDelete() {
  const ids = pendingDeleteIds.value;
  deleteTransactions(ids);
  selected.value = selected.value.filter((id) => !ids.includes(id));
  refreshTick.value++;
  closeDeleteModal();
}

// Per-column widths sized to the content each column actually holds, NOT an
// even percentage split — see docs/index-page-pattern.md §9.1. Splitting the
// container width evenly makes every column as narrow as the narrowest one
// needs to be, which clipped "Purchase Invoice #14026" down to "rchase
// Invoice #140". These widths let each column hold its longest realistic
// value; when they don't all fit, MpTableContainer scrolls horizontally
// (that's the intended behaviour — the table is allowed to overflow) instead
// of squeezing the columns.
const COLUMN_WIDTH: Record<ColumnKey, number> = {
  transactionDate: 120,
  number: 230,
  vendor: 180,
  procurementStaff: 180,
  dueDate: 120,
  status: 120,
  // The money columns carry two decimals ("10.016.640,00"), so they need
  // ~30px more than a bare integer would.
  depositAmount: 170,
  balanceDue: 180,
  totalAmount: 180,
  totalItems: 110,
  urgency: 130,
  tags: 140,
};
const CHECKBOX_COLUMN_WIDTH = 44;
const tableMinWidth = computed(
  () => `${columns.value.reduce((sum, col) => sum + COLUMN_WIDTH[col.key], CHECKBOX_COLUMN_WIDTH)}px`,
);

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const statsGridClass = css({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 4 });
const statsCaptionClass = css({ display: "flex", justifyContent: "flex-end", mt: 2, mb: 4 });
const tabLabelClass = css({ display: "inline-flex", alignItems: "center", gap: 2 });

const filterBarClass = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, flexWrap: "wrap", mt: 5, mb: 5 });
const filterLeftClass = css({ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" });
const filterRightClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });

const searchGroupClass = css({
  position: "relative",
  width: "280px",
  "& [data-search-clear]": { opacity: 0, transition: "opacity 0.12s ease" },
  "&:hover [data-search-clear], &:focus-within [data-search-clear]": { opacity: 1 },
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
  lineHeight: "0",
});
const quickFilterClass = css({ width: "180px" });

// min-width comes from the per-column widths (see COLUMN_WIDTH above), bound
// inline on <MpTable>, so it always matches the active tab's column set.
// Pure-CSS horizontal scroll affordance. The two `local` white gradients sit
// on the content and scroll away with it; the two `scroll` radial shadows are
// pinned to the container's edges. The result: a soft shadow appears on
// whichever side has more content and disappears once you reach that end — so
// a table that overflows says so, with no ResizeObserver and no JS state.
// Without it the last column just gets clipped at the viewport edge and the
// user has no way to tell there is anything past it.
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll",
});
const tableFixedClass = css({ tableLayout: "fixed" });
const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const numCellClass = css({ textAlign: "right" });
const checkboxCellClass = css({ width: "44px", pl: "3!", pr: "0!" });
// MpTableCell defaults to white-space:nowrap + overflow:visible, so long text
// (vendor names, memos) spills sideways into the neighbouring cell. Wrap it
// inside the cell instead — never clip: an ellipsis (or worse, a hard clip)
// mid-way through a document number is unreadable, and these columns are sized
// (COLUMN_WIDTH) to fit their content in one line anyway, so wrapping only
// kicks in for the genuinely-long outliers.
//
// The `!` overrides matter here: MpTextlink (the Number column) ships its own
// `display:inline-flex` + `white-space:nowrap`, which both sizes to content and
// centres it. `display:flex!` + `justifyContent` re-anchor the text to the
// cell's edge, and `width:full!` makes it fill the column rather than hug its
// own content — without that pair, a long number renders centred and
// overflowing equally off *both* sides of the cell.
const wrapCellBase = {
  display: "flex!",
  width: "full!",
  minWidth: "0!",
  whiteSpace: "normal!",
  wordBreak: "break-word",
  textAlign: "left!",
} as const;
const wrapCellClass = css({ ...wrapCellBase, justifyContent: "flex-start!" });
const numWrapCellClass = css({ ...wrapCellBase, justifyContent: "flex-end!", textAlign: "right!" });

const sortHeaderClass = css({ display: "flex", alignItems: "center", gap: 1, border: "0", bg: "transparent", p: 0, cursor: "pointer", color: "inherit", font: "inherit", width: "full" });
// Numeric headers right-align to sit over their (right-aligned) figures.
const sortHeaderNumClass = css({ justifyContent: "flex-end" });
// Header labels wrap rather than clip too, but must NOT take width:full —
// they sit next to the sort icon inside the header button's own flex row.
const headerLabelClass = css({ minWidth: "0", whiteSpace: "normal", wordBreak: "break-word", textAlign: "left" });

const bulkBarClass = css({ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" });
const bulkCellClass = css({ py: "11px!" });

const skeletonBarClass = css({ display: "block", height: "4", rounded: "sm" });

const emptyStateClass = css({ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, py: 16, textAlign: "center" });
const emptyIllustrationClass = css({ width: "180px", height: "auto", mb: 1 });
const emptyTitleClass = css({ fontSize: "lg" });
const emptyDescClass = css({ maxWidth: "320px" });

const paginationClass = css({ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 3, py: 3 });
const pagerLeftClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const pagerRightClass = css({ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" });
const pageJumpClass = css({ width: "100px" });
const pageJumpInnerClass = css({ h: "7.5" });

const drawerTitleClass = css({ fontSize: "lg" });
const filterDrawerFormClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const filterDrawerFooterClass = css({ display: "flex", justifyContent: "space-between", gap: 2, width: "full" });

const modalTitleClass = css({ fontSize: "lg" });
const modalFooterClass = css({ display: "flex", justifyContent: "flex-end", gap: 2 });
</script>
