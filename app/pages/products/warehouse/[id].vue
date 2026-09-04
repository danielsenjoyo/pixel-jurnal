<template>
  <DefaultPageContent
    :title="warehouse ? warehouse.name : 'Warehouse not found'"
    breadcrumb="Warehouse list"
    breadcrumb-to="/products?tab=warehouses"
  >
    <template v-if="warehouse && !warehouse.isActive" #title-badge>
      <MpBadge for="tableStatus" type="critical">Inactive</MpBadge>
    </template>

    <template v-if="warehouse" #actions>
      <MpTooltip label="Previous warehouse">
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="chevrons-left"
          aria-label="Previous warehouse"
          :is-disabled="!adjacent.prevId"
          @click="goTo(adjacent.prevId)"
        />
      </MpTooltip>
      <MpTooltip label="Next warehouse">
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="chevrons-right"
          aria-label="Next warehouse"
          :is-disabled="!adjacent.nextId"
          @click="goTo(adjacent.nextId)"
        />
      </MpTooltip>
    </template>

    <div v-if="!warehouse" :class="notFoundClass">
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
      <!-- Zone A. A warehouse's headline figure is how much it is holding —
           the reason anyone opens this page. -->
      <div :class="topRowClass">
        <div :class="metaFieldClass">
          <MpText color="gray.600">Warehouse code</MpText>
          <MpText>{{ warehouse.code || "—" }}</MpText>
        </div>

        <div :class="metaFieldClass">
          <MpText color="gray.600">PIC</MpText>
          <MpText>{{ warehouse.pic || "—" }}</MpText>
        </div>

        <div :class="headlineColClass">
          <MpText weight="semiBold" color="dark">
            {{ formatCount(products.length) }} product{{ products.length === 1 ? "" : "s" }} held
          </MpText>
          <MpText size="body-small" color="gray.600">
            {{ formatCount(locations.length) }} storage location{{
              locations.length === 1 ? "" : "s"
            }}
          </MpText>
        </div>
      </div>

      <MpDivider variant="dashed" :class="dividerClass" />

      <MpText weight="semiBold" color="dark" :class="sectionHeadingClass">Warehouse info</MpText>
      <div :class="metaGridClass">
        <div :class="metaFieldClass">
          <MpText color="gray.600">Address</MpText>
          <MpText :class="wrapValueClass">{{ warehouse.address || "—" }}</MpText>
        </div>
        <div :class="metaFieldClass">
          <MpText color="gray.600">Description</MpText>
          <MpText :class="wrapValueClass">{{ warehouse.description || "—" }}</MpText>
        </div>
        <div :class="metaFieldClass">
          <MpText color="gray.600">Status</MpText>
          <div>
            <MpBadge for="tableStatus" :type="warehouse.isActive ? 'completed' : 'critical'">
              {{ warehouse.isActive ? "Active" : "Inactive" }}
            </MpBadge>
          </div>
        </div>
      </div>

      <div :class="relatedSectionClass">
        <MpTabs v-model="activeTabIndex" is-manual variant-color="blue">
          <MpTabList>
            <MpTab><span :class="tabLabelClass">Product list</span></MpTab>
            <MpTab><span :class="tabLabelClass">Location list</span></MpTab>
            <MpTab><span :class="tabLabelClass">Transaction list</span></MpTab>
          </MpTabList>
        </MpTabs>

        <!-- Products held here -->
        <div v-if="activeTabIndex === 0" :class="relatedBodyClass">
          <MpTableContainer v-if="products.length" :class="scrollShadowClass">
            <MpTable :class="relatedTableClass">
              <MpTableHead is-fixed :class="tableHeadClass">
                <MpTableRow>
                  <MpTableCell as="th">Product name</MpTableCell>
                  <MpTableCell as="th">Product code</MpTableCell>
                  <MpTableCell as="th" :class="numCellClass">Stock on hand</MpTableCell>
                  <MpTableCell as="th" :class="numCellClass">Available qty</MpTableCell>
                </MpTableRow>
              </MpTableHead>
              <MpTableBody>
                <MpTableRow v-for="product in products" :key="product.id">
                  <MpTableCell as="td" :class="wrapCellClass">
                    <MpTextlink
                      :class="textlinkCellClass"
                      as="button"
                      variant="primary"
                      @click="navigateTo(`/products/detail/${product.id}`)"
                    >
                      {{ product.name }}
                    </MpTextlink>
                  </MpTableCell>
                  <MpTableCell as="td" :class="wrapCellClass">{{ product.code }}</MpTableCell>
                  <MpTableCell as="td" :class="[wrapCellClass, numCellClass]">
                    {{ formatQuantity(product.quantity ?? 0) }} {{ product.unit }}
                  </MpTableCell>
                  <MpTableCell as="td" :class="[wrapCellClass, numCellClass]">
                    {{ formatQuantity(product.quantityAvailable ?? 0) }} {{ product.unit }}
                  </MpTableCell>
                </MpTableRow>
              </MpTableBody>
            </MpTable>
          </MpTableContainer>
          <MpText v-else size="body-small" color="gray.600">
            No product is held in this warehouse yet.
          </MpText>
        </div>

        <!-- Storage locations -->
        <div v-if="activeTabIndex === 1" :class="relatedBodyClass">
          <MpTableContainer v-if="locations.length">
            <MpTable :class="relatedTableClass">
              <MpTableHead is-fixed :class="tableHeadClass">
                <MpTableRow>
                  <MpTableCell as="th">Location code</MpTableCell>
                  <MpTableCell as="th">Location name</MpTableCell>
                </MpTableRow>
              </MpTableHead>
              <MpTableBody>
                <MpTableRow v-for="location in locations" :key="location.id">
                  <MpTableCell as="td" :class="wrapCellClass">{{ location.code }}</MpTableCell>
                  <MpTableCell as="td" :class="wrapCellClass">{{ location.name }}</MpTableCell>
                </MpTableRow>
              </MpTableBody>
            </MpTable>
          </MpTableContainer>
          <MpText v-else size="body-small" color="gray.600">
            No storage location has been set up in this warehouse yet.
          </MpText>
          <MpButton
            variant="secondary"
            size="sm"
            :class="addLocationClass"
            @click="openLocationDrawer"
          >
            Add new storage location
          </MpButton>
        </div>

        <!-- Movements touching this warehouse -->
        <div v-if="activeTabIndex === 2" :class="relatedBodyClass">
          <MpTableContainer v-if="transactions.length" :class="scrollShadowClass">
            <MpTable :class="relatedTableClass">
              <MpTableHead is-fixed :class="tableHeadClass">
                <MpTableRow>
                  <MpTableCell as="th">Date</MpTableCell>
                  <MpTableCell as="th">Transaction no.</MpTableCell>
                  <MpTableCell as="th">Transaction type</MpTableCell>
                  <MpTableCell as="th" :class="numCellClass">Total products</MpTableCell>
                </MpTableRow>
              </MpTableHead>
              <MpTableBody>
                <MpTableRow v-for="row in transactions" :key="`${row.kind}-${row.id}`">
                  <MpTableCell as="td" :class="wrapCellClass">
                    {{ formatDisplayDate(row.date) }}
                  </MpTableCell>
                  <MpTableCell as="td" :class="wrapCellClass">
                    <MpTextlink
                      :class="textlinkCellClass"
                      as="button"
                      variant="primary"
                      @click="openTransaction(row)"
                    >
                      {{ row.number }}
                    </MpTextlink>
                  </MpTableCell>
                  <MpTableCell as="td" :class="wrapCellClass">{{ row.typeLabel }}</MpTableCell>
                  <MpTableCell as="td" :class="[wrapCellClass, numCellClass]">
                    {{ formatCount(row.lineCount) }}
                  </MpTableCell>
                </MpTableRow>
              </MpTableBody>
            </MpTable>
          </MpTableContainer>
          <MpText v-else size="body-small" color="gray.600">
            No transaction has touched this warehouse yet.
          </MpText>
        </div>
      </div>

      <div :class="bottomActionsClass">
        <MpButton variant="ghost" @click="isDeleteModalOpen = true">Delete</MpButton>
        <MpFlex gap="2">
          <MpButton
            variant="secondary"
            @click="navigateTo(`/products/warehouse/edit/${warehouse.id}`)"
          >
            Edit
          </MpButton>
          <MpPopover placement="bottom-end" use-portal is-adaptive-width>
            <template #default>
              <MpPopoverTrigger>
                <MpButton variant="primary" right-icon="caret-down">Actions</MpButton>
              </MpPopoverTrigger>
              <MpPopoverContent>
                <MpPopoverList>
                  <MpPopoverListItem role="menuitem" @click="openLocationDrawer">
                    Add new storage location
                  </MpPopoverListItem>
                  <MpPopoverListItem role="menuitem" @click="onToggleActive">
                    {{ warehouse.isActive ? "Deactivate" : "Activate" }}
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </template>
          </MpPopover>
        </MpFlex>
      </div>

      <!-- Deactivation is refused while locations exist, so the reason is
           surfaced where the action was taken rather than failing silently. -->
      <MpBanner
        v-if="actionError"
        id="warehouse-action-error"
        variant="danger"
        is-inline
        :class="errorBannerClass"
      >
        <MpBannerIcon id="warehouse-action-error-icon" />
        <MpBannerDescription id="warehouse-action-error-desc">
          {{ actionError }}
        </MpBannerDescription>
      </MpBanner>

      <MpModal
        id="warehouse-delete-modal"
        :is-open="isDeleteModalOpen"
        size="sm"
        @close="isDeleteModalOpen = false"
      >
        <MpModalOverlay />
        <MpModalContent>
          <MpModalHeader>
            <span :class="modalTitleClass">Delete {{ warehouse.name }}?</span>
            <MpModalCloseButton />
          </MpModalHeader>
          <MpModalBody>
            <MpText size="body" color="gray.700">Deleted warehouses cannot be recovered.</MpText>
          </MpModalBody>
          <MpModalFooter>
            <div :class="modalFooterClass">
              <MpButton variant="secondary" @click="isDeleteModalOpen = false">Cancel</MpButton>
              <MpButton variant="danger" @click="confirmDelete">Delete</MpButton>
            </div>
          </MpModalFooter>
        </MpModalContent>
      </MpModal>

      <!-- A storage location is two fields, so it is a drawer rather than a
           page — same call the source makes (docs/patterns/Drawer.md). -->
      <MpDrawer
        :is-open="isLocationDrawerOpen"
        placement="right"
        size="sm"
        @close="isLocationDrawerOpen = false"
      >
        <MpDrawerOverlay />
        <MpDrawerContent>
          <MpDrawerHeader>
            <span :class="drawerTitleClass">Add new storage location</span>
            <MpDrawerCloseButton />
          </MpDrawerHeader>
          <MpDrawerBody>
            <div :class="drawerFormClass">
              <MpFormControl is-required :is-invalid="locationSubmitted && !locationCode.trim()">
                <MpFormLabel>Location code</MpFormLabel>
                <MpInput v-model="locationCode" placeholder="Example: A-01-01" />
                <MpFormErrorMessage>You must fill in location code</MpFormErrorMessage>
              </MpFormControl>
              <MpFormControl is-required :is-invalid="locationSubmitted && !locationName.trim()">
                <MpFormLabel>Location name</MpFormLabel>
                <MpInput v-model="locationName" placeholder="Example: Rak A / Baris 1 / Bin 1" />
                <MpFormErrorMessage>You must fill in location name</MpFormErrorMessage>
              </MpFormControl>
            </div>
          </MpDrawerBody>
          <MpDrawerFooter>
            <div :class="drawerFooterClass">
              <MpButton variant="ghost" @click="isLocationDrawerOpen = false">Cancel</MpButton>
              <MpButton variant="primary" @click="saveLocation">Save</MpButton>
            </div>
          </MpDrawerFooter>
        </MpDrawerContent>
      </MpDrawer>
    </template>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  css,
  MpBadge,
  MpBanner,
  MpBannerDescription,
  MpBannerIcon,
  MpButton,
  MpDivider,
  MpDrawer,
  MpDrawerBody,
  MpDrawerCloseButton,
  MpDrawerContent,
  MpDrawerFooter,
  MpDrawerHeader,
  MpDrawerOverlay,
  MpFlex,
  MpFormControl,
  MpFormErrorMessage,
  MpFormLabel,
  MpInput,
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
  MpTooltip
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import {
  ADJUSTMENT_TYPE_LABEL,
  createStorageLocation,
  deleteProductRecords,
  formatCount,
  formatDisplayDate,
  formatQuantity,
  getAdjacentWarehouseIds,
  getProducts,
  getStockAdjustments,
  getStorageLocations,
  getWarehouseById,
  getWarehouseTransfers,
  setWarehouseActive
} from "~/data/products";
import { textlinkCellClass } from "~/utils/textlink-align";

// ---------------------------------------------------------------------------
// Warehouse detail. Cloned from jurnal-frontend-app
// src/pages/warehouses/detail/index.vue.
//
// Not ported: the storage LEVEL designer (a settings screen that names the
// tiers before locations can use them), and the batch / serial-number tabs —
// both are per-warehouse views of records this prototype tracks per product
// instead.
// ---------------------------------------------------------------------------

const route = useRoute();
const warehouseId = computed(() => Number(route.params.id));

const refreshTick = ref(0);
const warehouse = computed(() => {
  void refreshTick.value;
  return getWarehouseById(warehouseId.value);
});

useHead({
  title: computed(() =>
    warehouse.value
      ? `${warehouse.value.name} — Mekari Jurnal`
      : "Warehouse not found — Mekari Jurnal"
  )
});

const adjacent = computed(() => getAdjacentWarehouseIds(warehouseId.value));

/** What this warehouse holds — read off the catalogue rather than stored
 *  against the warehouse, so the two can't disagree. */
const products = computed(() => {
  void refreshTick.value;
  const name = warehouse.value?.name;
  if (!name) return [];
  return getProducts().filter(
    (product) => product.warehouse === name && !product.isArchived && product.trackInventory
  );
});

const locations = computed(() => {
  void refreshTick.value;
  return getStorageLocations(warehouseId.value);
});

interface WarehouseTransactionRow {
  kind: "adjustment" | "transfer";
  id: number;
  date: string;
  number: string;
  typeLabel: string;
  lineCount: number;
}

/** Everything that has moved stock in or out of here — adjustments recorded
 *  against it, and transfers with it at either end. */
const transactions = computed<WarehouseTransactionRow[]>(() => {
  void refreshTick.value;
  const name = warehouse.value?.name;
  if (!name) return [];

  const adjustments: WarehouseTransactionRow[] = getStockAdjustments()
    .filter((record) => record.warehouse === name)
    .map((record) => ({
      kind: "adjustment",
      id: record.id,
      date: record.date,
      number: record.number,
      typeLabel: ADJUSTMENT_TYPE_LABEL[record.adjustmentType],
      lineCount: record.lines.length
    }));

  const transfers: WarehouseTransactionRow[] = getWarehouseTransfers()
    .filter((record) => record.fromWarehouse === name || record.toWarehouse === name)
    .map((record) => ({
      kind: "transfer",
      id: record.id,
      date: record.date,
      number: record.number,
      typeLabel: record.fromWarehouse === name ? "Transfer out" : "Transfer in",
      lineCount: record.lines.length
    }));

  return [...adjustments, ...transfers].sort((a, b) => b.date.localeCompare(a.date));
});

const activeTabIndex = ref(0);
const isDeleteModalOpen = ref(false);
const isLocationDrawerOpen = ref(false);
const locationCode = ref("");
const locationName = ref("");
const locationSubmitted = ref(false);
const actionError = ref("");

function goTo(id: number | null) {
  if (id) navigateTo(`/products/warehouse/${id}`);
}

function openTransaction(row: WarehouseTransactionRow) {
  navigateTo(
    row.kind === "adjustment"
      ? `/products/stock-adjustment/${row.id}`
      : `/products/warehouse-transfer/${row.id}`
  );
}

function openLocationDrawer() {
  locationCode.value = "";
  locationName.value = "";
  locationSubmitted.value = false;
  isLocationDrawerOpen.value = true;
}

function saveLocation() {
  locationSubmitted.value = true;
  if (!locationCode.value.trim() || !locationName.value.trim()) return;
  createStorageLocation(warehouseId.value, locationCode.value, locationName.value);
  refreshTick.value++;
  isLocationDrawerOpen.value = false;
  // Land the user on the list they just added to.
  activeTabIndex.value = 1;
}

function onToggleActive() {
  if (!warehouse.value) return;
  const result = setWarehouseActive(warehouse.value.id, !warehouse.value.isActive);
  actionError.value = result.ok ? "" : (result.reason ?? "");
  refreshTick.value++;
}

function confirmDelete() {
  if (!warehouse.value) return;
  deleteProductRecords("warehouses", [warehouse.value.id]);
  isDeleteModalOpen.value = false;
  navigateTo("/products?tab=warehouses");
}

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
const topRowClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 6,
  alignItems: "start"
});
const headlineColClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 1,
  textAlign: "right"
});
const dividerClass = css({ my: 6 });
const sectionHeadingClass = css({ fontSize: "lg", mb: 4 });
const metaGridClass = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 });
const metaFieldClass = css({ display: "flex", flexDirection: "column", gap: 1, minWidth: "0" });
const wrapValueClass = css({ whiteSpace: "normal", wordBreak: "break-word" });

const relatedSectionClass = css({ mt: 10 });
const relatedBodyClass = css({ pt: 4 });
const relatedTableClass = css({ tableLayout: "auto", width: "full", minWidth: "640px" });
const tableHeadClass = css({ boxShadow: "0 1px 0 0 var(--mp-colors-gray-100)!" });
const numCellClass = css({ textAlign: "right" });
const wrapCellClass = css({ whiteSpace: "normal!", wordBreak: "break-word", textAlign: "left" });
const tabLabelClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  whiteSpace: "nowrap"
});
const addLocationClass = css({ mt: 4 });
const scrollShadowClass = css({
  backgroundImage:
    "linear-gradient(to right, var(--mp-colors-white) 30%, transparent), linear-gradient(to left, var(--mp-colors-white) 30%, transparent), linear-gradient(to right, rgba(29,31,36,0.16), transparent), linear-gradient(to left, rgba(29,31,36,0.16), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "36px 100%, 36px 100%, 12px 100%, 12px 100%",
  backgroundAttachment: "local, local, scroll, scroll"
});

const errorBannerClass = css({ mt: 4 });

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

const drawerTitleClass = css({ fontSize: "lg" });
const drawerFormClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const drawerFooterClass = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: 2,
  width: "full"
});

const bottomActionsClass = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mt: 8,
  pt: 6,
  borderTopWidth: "sm",
  borderColor: "gray.100"
});
</script>
