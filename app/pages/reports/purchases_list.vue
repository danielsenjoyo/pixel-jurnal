<template>
  <DefaultPageContent title="Purchase list" breadcrumb="Reports" breadcrumb-to="/reports">
    <!-- Production keeps Template and Export on the right of the filter row.
         They're page-scoped actions, not filters, so they sit in the title
         band here per docs/patterns/page-title-bar.md. -->
    <template #actions>
      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <MpPopoverTrigger>
          <MpButton variant="secondary" left-icon="settings" right-icon="caret-down">
            {{ activeLayout.name }}
          </MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent>
          <MpPopoverList>
            <MpPopoverListItem
              v-for="layout in PURCHASE_REPORT_LAYOUTS"
              :key="layout.id"
              role="menuitem"
              :is-active="layout.id === layoutId"
              @click="layoutId = layout.id"
            >
              {{ layout.name }}
            </MpPopoverListItem>
          </MpPopoverList>
        </MpPopoverContent>
      </MpPopover>

      <MpPopover placement="bottom-end" use-portal is-adaptive-width>
        <MpPopoverTrigger>
          <MpButton variant="secondary" right-icon="caret-down" :is-disabled="!hasRun">
            Export
          </MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent>
          <MpPopoverList>
            <MpPopoverListItem
              v-for="format in EXPORT_FORMATS"
              :key="format"
              role="menuitem"
              @click="onExport(format)"
            >
              {{ format }}
            </MpPopoverListItem>
          </MpPopoverList>
        </MpPopoverContent>
      </MpPopover>
    </template>

    <!-- Zone C — filter bar. A report's controls are its date range and
         period; there is no keyword search, because a report is narrowed by
         criteria rather than by text (docs/patterns/reports-page-format.md). -->
    <div :class="filterBarClass">
      <div :class="dateFieldClass">
        <MpFormControl>
          <MpFormLabel>Start date</MpFormLabel>
          <MpDatePicker
            v-model="filter.startDate"
            value-type="string"
            :format="DATE_INPUT_FORMAT"
            placeholder="DD/MM/YYYY"
            use-portal
            @update:model-value="filter.periodId = 'custom'"
          />
        </MpFormControl>
      </div>

      <div :class="dateFieldClass">
        <MpFormControl>
          <MpFormLabel>End date</MpFormLabel>
          <MpDatePicker
            v-model="filter.endDate"
            value-type="string"
            :format="DATE_INPUT_FORMAT"
            placeholder="DD/MM/YYYY"
            use-portal
            @update:model-value="filter.periodId = 'custom'"
          />
        </MpFormControl>
      </div>

      <div :class="periodFieldClass">
        <MpFormControl>
          <MpFormLabel>Period</MpFormLabel>
          <MpSelect
            :model-value="filter.periodId"
            is-full-width
            @update:model-value="onPeriodChange"
          >
            <option v-for="period in PURCHASE_REPORT_PERIODS" :key="period.id" :value="period.id">
              {{ period.label }}
            </option>
          </MpSelect>
        </MpFormControl>
      </div>

      <MpButton variant="primary" :is-disabled="!isRangeValid" @click="runReport">Filter</MpButton>

      <div :class="moreFilterClass">
        <MpButton variant="secondary" left-icon="filter" @click="isFilterDrawerOpen = true">
          More filter
        </MpButton>
        <!-- The drawer closes over its own settings, so mark the button while
             anything in it is set (docs/patterns/Drawer.md). -->
        <span v-if="isDrawerFilterActive" :class="filterDotClass" />
      </div>
    </div>

    <PurchaseReportFilterDrawer
      :is-open="isFilterDrawerOpen"
      :applied="filter"
      @close="isFilterDrawerOpen = false"
      @apply="onApplyFilter"
    />

    <!-- Report meta strip — production prints the same three facts above the
         table (period, transaction type, currency) so an exported page can be
         read on its own. -->
    <div v-if="hasRun" :class="metaClass">
      <MpText size="body-small" color="gray.600">{{ metaLine }}</MpText>
    </div>

    <template v-if="hasRun && filteredRows.length">
      <MpTableContainer :class="scrollShadowClass">
        <MpTable is-hoverable :class="tableFixedClass">
          <colgroup>
            <col v-for="col in columns" :key="col.key" :style="{ width: `${col.width}px` }" />
          </colgroup>

          <MpTableHead is-fixed :class="tableHeadClass">
            <MpTableRow>
              <MpTableCell
                v-for="col in columns"
                :key="col.key"
                as="th"
                :class="col.numeric ? numCellClass : undefined"
              >
                <button type="button" :class="sortHeaderClass" @click="toggleSort(col.key)">
                  <span>{{ col.label }}</span>
                  <MpIcon :name="sortIconFor(col.key)" size="sm" color="gray.400" />
                </button>
              </MpTableCell>
            </MpTableRow>
          </MpTableHead>

          <MpTableBody v-if="isLoading">
            <MpTableRow v-for="n in 5" :key="`skeleton-${n}`">
              <MpTableCell v-for="col in columns" :key="col.key" as="td">
                <MpSkeleton is-loading>
                  <span :class="skeletonBarClass" />
                </MpSkeleton>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>

          <MpTableBody v-else>
            <MpTableRow v-for="row in pagedRows" :key="row.id">
              <MpTableCell
                v-for="col in columns"
                :key="col.key"
                as="td"
                :class="col.numeric ? numCellClass : undefined"
              >
                <MpTextlink
                  v-if="col.key === 'number' && transactionRoute"
                  as="button"
                  variant="primary"
                  :class="textlinkAlignClass"
                  @click="navigateTo(`${transactionRoute}/${row.id}`)"
                >
                  {{ row.number }}
                </MpTextlink>
                <template v-else-if="col.key === 'number'">{{ row.number }}</template>
                <MpBadge
                  v-else-if="col.key === 'status'"
                  for="tableStatus"
                  :type="PURCHASE_STATUS_TYPE[row.status]"
                >
                  {{ PURCHASE_STATUS_LABEL[row.status] }}
                </MpBadge>
                <div v-else-if="col.key === 'tags'" :class="tagRowClass">
                  <MpTag v-for="tag in row.tags" :key="tag" size="sm">{{ tag }}</MpTag>
                  <MpText v-if="!row.tags.length" color="gray.600">—</MpText>
                </div>
                <template v-else>{{ cellText(row, col) }}</template>
              </MpTableCell>
            </MpTableRow>

            <!-- TOTAL row. Production renders it only on the last page, which
                 hides it entirely unless you navigate there; this one is
                 always present and sums every filtered row, not just the
                 page — which is what the number is actually for. -->
            <MpTableRow :class="totalRowClass">
              <MpTableCell
                v-for="(col, index) in columns"
                :key="col.key"
                as="td"
                :class="col.numeric ? numCellClass : undefined"
              >
                <MpText v-if="index === 0" weight="semiBold" color="dark">TOTAL</MpText>
                <MpText v-else-if="col.numeric" weight="semiBold" color="dark">
                  {{ formatAmount(columnTotal(col.key)) }}
                </MpText>
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
              <MpButton variant="ghost" size="sm" right-icon="chevrons-down">
                {{ perPage }}
              </MpButton>
            </MpPopoverTrigger>
            <MpPopoverContent>
              <MpPopoverList>
                <MpPopoverListItem
                  v-for="opt in [10, 25, 50, 100]"
                  :key="opt"
                  :is-active="perPage === opt"
                  @click="setPerPage(opt)"
                >
                  {{ opt }}
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
          <MpText size="body-small" color="gray.600">
            Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredRows.length }}
          </MpText>
        </div>

        <div :class="pagerRightClass">
          <div :class="pageJumpClass">
            <MpAutocomplete
              :class="pageJumpInnerClass"
              :data="pageOptions"
              :model-value="page"
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
              :is-disabled="page <= 1"
              aria-label="Previous page"
              @click="page--"
            />
          </MpTooltip>
          <MpTooltip label="Next page">
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="chevrons-right"
              :is-disabled="page >= pageCount"
              aria-label="Next page"
              @click="page++"
            />
          </MpTooltip>
        </div>
      </div>
    </template>

    <!-- Two blank states, matching production's two: the report hasn't been
         run yet, or it ran and matched nothing. -->
    <div v-else :class="emptyStateClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ emptyTitle }}</MpText>
      <MpText size="body-small" color="gray.600" :class="emptyDescClass">
        {{ emptyDescription }}
      </MpText>
      <MpButton v-if="hasRun && isDrawerFilterActive" variant="secondary" @click="clearFilters">
        Clear filters
      </MpButton>
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  css,
  MpAutocomplete,
  MpBadge,
  MpButton,
  MpDatePicker,
  MpFormControl,
  MpFormLabel,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpSelect,
  MpSkeleton,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpTag,
  MpText,
  MpTextlink,
  MpTooltip,
  toast
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import PurchaseReportFilterDrawer from "~/components/reports/PurchaseReportFilterDrawer.vue";
import {
  PURCHASE_REPORT_LAYOUTS,
  PURCHASE_REPORT_PERIODS,
  buildPurchaseReportRows,
  reportColumn,
  type PurchaseReportRow,
  type ReportColumn
} from "~/data/purchase-report";
import {
  defaultPurchaseReportFilter,
  isReportFilterActive,
  isReportRangeValid,
  matchesPurchaseReportFilter,
  type PurchaseReportFilter
} from "~/data/purchase-report-filter";
import { PURCHASE_STATUS_LABEL, PURCHASE_STATUS_TYPE } from "~/data/purchase-status";
import {
  TRANSACTION_TYPE_LABEL,
  formatAmount,
  formatDisplayDate,
  type TransactionType
} from "~/data/purchase-transactions";
import { textlinkAlignClass } from "~/utils/textlink-align";
import { DATE_INPUT_FORMAT, isoToDmy } from "~/utils/dates";

useHead({ title: "Purchase list — Mekari Jurnal" });

const EXPORT_FORMATS = ["PDF", "Excel", "CSV"] as const;

// ---------------------------------------------------------------------------
// Filter state
//
// Two objects, not one. `filter` is what the controls edit; `applied` is what
// the table reads. A report does not re-run as you type — you set a range and
// press Filter — which is the whole reason the page has a Filter button and a
// "Report will appear here" blank state at all. Collapsing them into one ref
// would make both meaningless.
// ---------------------------------------------------------------------------
const filter = reactive<PurchaseReportFilter>(defaultPurchaseReportFilter());
const applied = ref<PurchaseReportFilter | null>(null);
const isFilterDrawerOpen = ref(false);
const isLoading = ref(false);

const hasRun = computed(() => applied.value !== null);
const isRangeValid = computed(() => isReportRangeValid(filter));
const isDrawerFilterActive = computed(() => isReportFilterActive(filter));

function onPeriodChange(id: string) {
  filter.periodId = id;
  const bounds = PURCHASE_REPORT_PERIODS.find((p) => p.id === id)?.range?.();
  if (!bounds) return;
  filter.startDate = isoToDmy(bounds.start);
  filter.endDate = isoToDmy(bounds.end);
}

function snapshot(): PurchaseReportFilter {
  return {
    ...filter,
    vendors: [...filter.vendors],
    statuses: [...filter.statuses],
    tags: [...filter.tags]
  };
}

/**
 * Stands in for production's fetch. The delay is deliberate: it is what makes
 * the skeleton rows reachable, and a report that returned instantly would
 * misrepresent a screen whose whole shape is built around waiting for one.
 */
function runReport() {
  if (!isRangeValid.value) return;
  applied.value = snapshot();
  page.value = 1;
  isLoading.value = true;
  window.setTimeout(() => (isLoading.value = false), 450);
}

function onApplyFilter(next: PurchaseReportFilter) {
  Object.assign(filter, next);
  isFilterDrawerOpen.value = false;
  runReport();
}

function clearFilters() {
  Object.assign(filter, defaultPurchaseReportFilter());
  runReport();
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------
const layoutId = ref(PURCHASE_REPORT_LAYOUTS[0]!.id);
const activeLayout = computed(
  () => PURCHASE_REPORT_LAYOUTS.find((l) => l.id === layoutId.value) ?? PURCHASE_REPORT_LAYOUTS[0]!
);
const columns = computed<ReportColumn[]>(() => activeLayout.value.columns.map(reportColumn));

const sortKey = ref<keyof PurchaseReportRow>("date");
const sortDir = ref<"asc" | "desc">("asc");

const filteredRows = computed<PurchaseReportRow[]>(() => {
  const f = applied.value;
  if (!f) return [];
  const rows = buildPurchaseReportRows(f.transactionType).filter((row) =>
    matchesPurchaseReportFilter(row, f)
  );
  const key = sortKey.value;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
});

function toggleSort(key: keyof PurchaseReportRow) {
  if (sortKey.value === key) sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
  page.value = 1;
}

function sortIconFor(key: keyof PurchaseReportRow) {
  if (sortKey.value !== key) return "sort-default" as const;
  return sortDir.value === "asc" ? ("sort-ascending" as const) : ("sort-descending" as const);
}

function columnTotal(key: keyof PurchaseReportRow): number {
  return filteredRows.value.reduce((sum, row) => {
    const value = row[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/** Everything that isn't a link, a badge or tags — dates, text, and money. */
function cellText(row: PurchaseReportRow, col: ReportColumn): string {
  const value = row[col.key];
  if (col.numeric) return formatAmount(Number(value));
  if (col.key === "date" || col.key === "dueDate") return formatDisplayDate(String(value));
  return String(value ?? "") || "—";
}

/**
 * Where a transaction number links to. Every type the Purchases module has a
 * detail page for gets a link; `financing` has none, so those rows render the
 * number as plain text rather than a link that 404s.
 */
const TRANSACTION_ROUTE: Partial<Record<TransactionType, string>> = {
  invoice: "/purchase/invoice",
  join_invoice: "/purchase/join-invoice",
  delivery: "/purchase/delivery",
  order: "/purchase/order",
  quote: "/purchase/quote",
  request: "/purchase/request",
  return: "/purchase/return"
};

const transactionRoute = computed(() =>
  applied.value ? TRANSACTION_ROUTE[applied.value.transactionType] : undefined
);

function onExport(format: (typeof EXPORT_FORMATS)[number]) {
  // No backend to render a file. Say what would happen rather than silently
  // doing nothing, and never hand the user a download that isn't real.
  toast.notify({
    id: "purchase-report-export",
    position: "top-center",
    variant: "success",
    title: `${format} export of ${filteredRows.value.length} rows would start here.`
  });
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
const page = ref(1);
const perPage = ref(25);

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage.value)));
const pagedRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
);
const rangeStart = computed(() =>
  filteredRows.value.length ? (page.value - 1) * perPage.value + 1 : 0
);
const rangeEnd = computed(() => Math.min(page.value * perPage.value, filteredRows.value.length));
const pageOptions = computed(() =>
  Array.from({ length: pageCount.value }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
);

function setPerPage(value: number) {
  perPage.value = value;
  page.value = 1;
}

function onJumpPage(option: { value?: number } | number) {
  const value = typeof option === "number" ? option : option?.value;
  if (value) page.value = value;
}

watch([page, pageCount], () => {
  if (page.value > pageCount.value) page.value = pageCount.value;
  if (page.value < 1) page.value = 1;
});

// ---------------------------------------------------------------------------
// Meta + blank-slate copy
// ---------------------------------------------------------------------------
const metaLine = computed(() => {
  const f = applied.value;
  if (!f) return "";
  const period = PURCHASE_REPORT_PERIODS.find((p) => p.id === f.periodId);
  const label = period && period.id !== "custom" ? period.label : "Custom range";
  return `${TRANSACTION_TYPE_LABEL[f.transactionType]} · ${label} · ${f.startDate} – ${f.endDate} · IDR`;
});

const emptyTitle = computed(() =>
  hasRun.value ? "There was no report data on this date/period" : "Report will appear here"
);
const emptyDescription = computed(() =>
  hasRun.value
    ? "Recheck the filter or select another date/period."
    : "Select dates or period, then click the Filter button."
);

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
// One row: the two dates, the period, then the two buttons — production's
// order. `flex-end` bottom-aligns the buttons with the labelled fields beside
// them. No space-between: with Template and Export moved to the title band
// there is nothing on the right, and pushing the buttons over there would
// separate them from the controls they act on.
const filterBarClass = css({
  display: "flex",
  alignItems: "flex-end",
  gap: 3,
  flexWrap: "wrap",
  mb: 5
});
// 180px, not 160: MpDatePicker's calendar addon eats into the field, and at
// 160 the DD/MM/YYYY value clipped mid-year ("01/07/20…").
const dateFieldClass = css({ width: "180px" });
const periodFieldClass = css({ width: "180px" });

// Dot on the More filter button — same affordance the Purchases list uses.
const moreFilterClass = css({ position: "relative" });
const filterDotClass = css({
  position: "absolute",
  top: "-2px",
  right: "-2px",
  width: "2",
  height: "2",
  rounded: "full",
  bg: "red.400",
  borderWidth: "sm",
  borderColor: "white"
});

const metaClass = css({ mb: 4 });

// `width: max-content` makes the table exactly as wide as its <colgroup>
// widths add up to, so the container scrolls instead of squeezing columns —
// and it does so without an inline style, which the column set being variable
// would otherwise force (a css() value has to be statically extractable).
// `minWidth: full` keeps a narrow layout (Summary is 4 columns) filling the
// stage rather than stopping short of it.
const tableFixedClass = css({ tableLayout: "fixed", width: "max-content", minWidth: "full" });
const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const numCellClass = css({ textAlign: "right" });
const tagRowClass = css({ display: "flex", gap: 2, flexWrap: "wrap" });

// TOTAL row — a rule above it, matching the report's printed convention.
const totalRowClass = css({
  "& td": { borderTopWidth: "sm!", borderColor: "gray.300!" }
});

const sortHeaderClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  border: "0",
  bg: "transparent",
  p: 0,
  cursor: "pointer",
  color: "inherit",
  font: "inherit"
});

// See docs/patterns/TablePage.md § Horizontal scroll affordance.
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});

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
