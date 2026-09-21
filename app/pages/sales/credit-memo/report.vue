<template>
  <DefaultPageContent title="Laporan Detail Kredit Memo" subtitle="(dalam IDR)">
    <!-- Dev-only state switcher — lets reviewers see all 4 states without a backend.
         Not part of the shipped product; drop this box once wired to a real API. -->
    <div :class="devSwitcherClass">
      <MpText size="body-small" weight="semiBold" color="gray.600"
        >Contoh status (khusus prototipe)</MpText
      >
      <MpFlex gap="4">
        <MpRadio id="state-normal" v-model="demoState" name="demoState" value="normal"
          >Normal</MpRadio
        >
        <MpRadio id="state-loading" v-model="demoState" name="demoState" value="loading"
          >Loading</MpRadio
        >
        <MpRadio id="state-error" v-model="demoState" name="demoState" value="error">Error</MpRadio>
      </MpFlex>
    </div>

    <div :class="freshnessRowClass">
      <span :class="freshnessDotClass" />
      <MpText size="body-small" color="gray.600"
        >Data per {{ formatDateID(REPORT_TODAY_ISO) }}, 15:30 (GMT+7)</MpText
      >
    </div>

    <!-- Controls: date, Periode, Tampilkan and Filter all sit on the top row
         with Ekspor pinned right; the search field sits on the row below,
         right-aligned so it lines up directly under Ekspor. -->
    <div :class="controlsClass">
      <div :class="controlsRowClass">
        <!-- Date and Periode stay glued together so they never wrap apart. -->
        <div :class="dateGroupClass">
          <MpFormControl id="as-of-date">
            <MpFormLabel>Per tanggal</MpFormLabel>
            <MpDatePicker
              v-model="pendingDate"
              format="DD/MM/YYYY"
              :is-clearable="false"
              :class="datePickerClass"
            />
          </MpFormControl>

          <MpFormControl id="as-of-period">
            <MpFormLabel>Periode</MpFormLabel>
            <MpSelect
              :model-value="activePreset ?? ''"
              placeholder="Pilih cepat"
              :class="quickSelectClass"
              @change="(_e, val) => applyPreset(String(val))"
            >
              <option value="" disabled>Pilih cepat</option>
              <option v-for="preset in QUICK_PRESETS" :key="preset.key" :value="preset.key">
                {{ preset.label }}
              </option>
            </MpSelect>
          </MpFormControl>
        </div>

        <MpButton
          variant="primary"
          :class="controlButtonClass"
          :is-disabled="!pendingDate"
          @click="generateReport"
          >Tampilkan</MpButton
        >

        <MpButton
          variant="secondary"
          left-icon="filter"
          :class="controlButtonClass"
          @click="openDrawer('filter')"
          >Filter</MpButton
        >

        <MpButton
          variant="secondary"
          left-icon="download"
          :class="rightAlignedClass"
          @click="openDrawer('export')"
          >Ekspor</MpButton
        >
      </div>

      <div :class="controlsRowClass">
        <div :class="[searchGroupClass, rightAlignedClass]">
          <MpInputGroup>
            <MpInputLeftAddon>
              <MpIcon name="search" size="sm" color="gray.400" />
            </MpInputLeftAddon>
            <MpInput
              v-model="search"
              placeholder="Cari No. CM, dokumen, atau No. transaksi"
              @keydown.enter="runSearch"
            />
          </MpInputGroup>
          <button
            v-if="searchTerm"
            type="button"
            data-search-clear
            aria-label="Bersihkan pencarian"
            :class="searchClearClass"
            @click="clearSearch"
          >
            <MpIcon name="reset" size="sm" color="gray.400" />
          </button>
          <MpText
            v-if="searchNoMatch"
            size="body-small"
            color="red.400"
            :class="searchNoMatchClass"
          >
            Tidak ada hasil untuk "{{ searchTerm }}".
          </MpText>
        </div>
      </div>
    </div>

    <!-- Informational banner (NOT a warning) — only when the as-of date is in the future. -->
    <div v-if="isFutureAsOfDate" :class="infoBannerClass">
      <MpText weight="semiBold" size="body-small" color="dark"
        >Menampilkan data hingga hari ini.</MpText
      >
      <MpText size="body-small" color="gray.600">
        Transaksi bertanggal setelah hari ini belum tercermin di laporan ini.
      </MpText>
    </div>

    <!-- Normal: nested customer / credit memo table. -->
    <template v-if="reportState === 'normal'">
      <MpTableContainer :class="tableWrapClass">
        <MpTable :is-hoverable="false" :class="tableFixedClass">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <MpTableHead is-fixed>
            <MpTableRow>
              <MpTableCell as="th">Tanggal</MpTableCell>
              <MpTableCell as="th">No. CM</MpTableCell>
              <MpTableCell as="th">Deskripsi</MpTableCell>
              <MpTableCell as="th">Status</MpTableCell>
              <MpTableCell as="th" :class="numCellClass">Saldo</MpTableCell>
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <template v-for="block in customerBlocks" :key="block.customer.id">
              <!-- Customer header row — expanded by default, click toggles. -->
              <MpTableRow>
                <MpTableCell as="td" :colspan="columnCount" :class="customerHeaderCellClass">
                  <div :class="customerHeaderRowClass">
                    <button
                      type="button"
                      :class="customerHeaderButtonClass"
                      @click="toggleCustomer(block.customer.id)"
                    >
                      <MpIcon
                        name="chevrons-down"
                        size="sm"
                        color="gray.400"
                        :class="[
                          chevronClass,
                          block.isExpanded ? chevronOpenClass : chevronClosedClass
                        ]"
                      />
                      <MpText weight="semiBold" size="label" color="dark">
                        {{ block.customer.code }} &middot; {{ block.customer.name }}
                      </MpText>
                    </button>
                    <MpText weight="semiBold" size="label" color="dark">{{
                      formatRp(block.custTotal)
                    }}</MpText>
                  </div>
                </MpTableCell>
              </MpTableRow>

              <template v-if="block.isExpanded">
                <template v-for="entry in block.cms" :key="entry.cm.id">
                  <MpTableRow
                    :id="`cm-row-${entry.cm.id}`"
                    :class="flashCmId === entry.cm.id ? flashRowClass : cmRowClass"
                  >
                    <MpTableCell as="td" :class="cmFirstCellClass">
                      <button
                        type="button"
                        :class="cmExpandButtonClass"
                        @click="toggleCm(entry.cm.id)"
                      >
                        <MpIcon
                          name="chevrons-down"
                          size="sm"
                          color="gray.400"
                          :class="[
                            chevronClass,
                            expandedCms[entry.cm.id] ? chevronOpenClass : chevronClosedClass
                          ]"
                        />
                        {{ formatDateID(entry.cm.issueDateISO) }}
                      </button>
                    </MpTableCell>
                    <MpTableCell as="td">{{ entry.cm.no }}</MpTableCell>
                    <MpTableCell as="td" :class="descCellClass">{{
                      entry.cm.description
                    }}</MpTableCell>
                    <MpTableCell as="td">
                      <MpBadge for="tableStatus" :type="STATUS_TYPE[entry.computed.status]">
                        {{ STATUS_LABEL[entry.computed.status] }}
                      </MpBadge>
                    </MpTableCell>
                    <MpTableCell as="td" :class="numCellClass">{{
                      formatRp(entry.computed.balance)
                    }}</MpTableCell>
                  </MpTableRow>

                  <!-- Expandable transaction history for this CM — flattened
                       into the same 5-column grid as the rows above it (no
                       repeated header, no nested table), one indent deeper. -->
                  <template v-if="expandedCms[entry.cm.id]">
                    <MpTableRow
                      v-for="row in entry.computed.rows"
                      :id="`tx-row-${row.id}`"
                      :key="row.id"
                      :class="flashTxId === row.id ? flashRowClass : txRowClass"
                    >
                      <MpTableCell as="td" :class="txFirstCellClass">{{
                        formatDateID(row.dateISO)
                      }}</MpTableCell>
                      <MpTableCell as="td">
                        <MpTextlink
                          v-if="row.type === 'applied' || row.type === 'refund'"
                          as="button"
                          variant="primary"
                          :class="txLinkClass"
                        >
                          {{ row.no }}
                        </MpTextlink>
                        <span v-else>{{ row.no ?? "–" }}</span>
                      </MpTableCell>
                      <MpTableCell as="td">
                        <div :class="txDescClass">
                          <MpText size="body-small" color="gray.400">{{
                            TX_TYPE_LABEL[row.type]
                          }}</MpText>
                          <MpText size="body-small" color="gray.600" :class="txDescTextClass">{{
                            txDescription(row)
                          }}</MpText>
                        </div>
                      </MpTableCell>
                      <MpTableCell as="td">
                        <MpBadge
                          v-if="row.status"
                          for="tableStatus"
                          :type="TX_STATUS_TYPE[row.status]"
                          >{{ TX_STATUS_LABEL[row.status] }}</MpBadge
                        >
                      </MpTableCell>
                      <MpTableCell as="td" :class="numCellClass">{{
                        formatRp(row.balance)
                      }}</MpTableCell>
                    </MpTableRow>

                    <MpTableRow v-if="entry.computed.hiddenFutureCount > 0">
                      <MpTableCell as="td" :colspan="columnCount" :class="futureNoteCellClass">
                        <MpText size="body-small" color="gray.400" :class="futureNoteClass">
                          {{ entry.computed.hiddenFutureCount }} transaksi bertanggal setelah
                          {{ formatDateID(asOfDateISO) }} tidak ditampilkan pada tanggal ini.
                        </MpText>
                      </MpTableCell>
                    </MpTableRow>
                  </template>
                </template>
              </template>
            </template>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>
    </template>

    <!-- Loading: skeleton rows in place of the table, up to 10s in a real request. -->
    <template v-else-if="reportState === 'loading'">
      <MpTableContainer :class="tableWrapClass">
        <MpTable :is-hoverable="false" :class="tableFixedClass">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <MpTableHead is-fixed>
            <MpTableRow>
              <MpTableCell as="th">Tanggal</MpTableCell>
              <MpTableCell as="th">No. CM</MpTableCell>
              <MpTableCell as="th">Deskripsi</MpTableCell>
              <MpTableCell as="th">Status</MpTableCell>
              <MpTableCell as="th" :class="numCellClass">Saldo</MpTableCell>
            </MpTableRow>
          </MpTableHead>
          <MpTableBody>
            <MpTableRow v-for="n in 5" :key="`skeleton-${n}`">
              <MpTableCell v-for="col in 5" :key="col" as="td">
                <MpSkeleton is-loading><span :class="skeletonBarClass" /></MpSkeleton>
              </MpTableCell>
            </MpTableRow>
          </MpTableBody>
        </MpTable>
      </MpTableContainer>
    </template>

    <!-- Error: distinct from all 3 empty variants below (EH-005-01). -->
    <div v-else-if="reportState === 'error'" :class="errorStateClass">
      <MpText weight="semiBold" color="dark" :class="emptyTitleClass">Laporan gagal dimuat.</MpText>
      <MpText size="body-small" color="gray.600" :class="emptyDescClass">Silakan coba lagi.</MpText>
      <MpButton variant="secondary" @click="demoState = 'normal'">Coba lagi</MpButton>
    </div>

    <!-- Empty: 3 contextually distinct copy variants, never conflated with the error state. -->
    <div v-else :class="emptyStateClass">
      <img src="/illustrations/search-not-found.png" alt="" :class="emptyIllustrationClass" />
      <MpText weight="semiBold" color="dark" :class="emptyTitleClass">{{ emptyTitle }}</MpText>
      <MpText size="body-small" color="gray.600" :class="emptyDescClass">{{
        emptyDescription
      }}</MpText>
      <MpButton v-if="emptyReason === 'filter-no-match'" variant="secondary" @click="resetFilters">
        Reset filter
      </MpButton>
    </div>
  </DefaultPageContent>

  <!-- Filter drawer — the ONLY place applied filters are ever visible. The main
       page above never shows a chip row or a count badge (twice-confirmed PM
       correction during wireframing). -->
  <MpDrawer
    :is-open="isFilterDrawerOpen"
    placement="right"
    size="sm"
    @close="isFilterDrawerOpen = false"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitleClass">Filter</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <div :class="filterDrawerFormClass">
          <MpFormControl id="filter-customer">
            <MpFormLabel>Customer</MpFormLabel>
            <MpInputTag
              placeholder="Ketik nama customer..."
              :data="customerTagData"
              :suggestions="customerSuggestions"
              suggestion-key="label"
              :is-show-suggestions="true"
              :is-enable-create-new-tag="false"
              @change="customerTagData = $event"
            />
          </MpFormControl>

          <MpFormControl id="filter-group">
            <MpFormLabel>Grup customer</MpFormLabel>
            <MpInputTag
              placeholder="Ketik nama grup..."
              :data="groupTagData"
              :suggestions="groupSuggestions"
              suggestion-key="label"
              :is-show-suggestions="true"
              :is-enable-create-new-tag="false"
              @change="groupTagData = $event"
            />
            <MpFormHelpText>Tanpa tag = semua grup, termasuk yang tidak ditetapkan.</MpFormHelpText>
          </MpFormControl>

          <MpFormControl id="filter-customer-total-range">
            <MpFormLabel>Rentang total customer</MpFormLabel>
            <div :class="rangeRowClass">
              <MpInput v-model="customerTotalMin" placeholder="Rp minimum" />
              <MpText color="gray.400">&ndash;</MpText>
              <MpInput v-model="customerTotalMax" placeholder="Rp maksimum" />
            </div>
          </MpFormControl>

          <MpFormControl id="filter-cm-balance-range">
            <MpFormLabel>Rentang saldo credit memo</MpFormLabel>
            <div :class="rangeRowClass">
              <MpInput v-model="cmBalanceMin" placeholder="Rp minimum" />
              <MpText color="gray.400">&ndash;</MpText>
              <MpInput v-model="cmBalanceMax" placeholder="Rp maksimum" />
            </div>
            <MpFormHelpText>
              Kedua rentang di atas dapat diisi bersamaan &mdash; menyaring dengan logika AND.
            </MpFormHelpText>
          </MpFormControl>

          <MpToggle :is-checked="showZeroBalance" @update:is-checked="showZeroBalance = $event">
            Tampilkan CM habis
            <template #description>Tampilkan customer dan CM dengan saldo Rp 0.</template>
          </MpToggle>

          <template v-if="drawerPurpose === 'export'">
            <MpFormControl id="export-format">
              <MpFormLabel>Format file</MpFormLabel>
              <MpFlex gap="4">
                <MpRadio
                  id="export-format-xlsx"
                  v-model="exportFormat"
                  name="exportFormat"
                  value="xlsx"
                  >XLSX</MpRadio
                >
                <MpRadio
                  id="export-format-csv"
                  v-model="exportFormat"
                  name="exportFormat"
                  value="csv"
                  >CSV</MpRadio
                >
              </MpFlex>
            </MpFormControl>

            <MpCheckbox
              id="export-include-tx-details"
              :is-checked="includeTransactionDetails"
              @update:is-checked="includeTransactionDetails = $event"
            >
              Sertakan detail transaksi
              <template #description
                >Tambahkan sheet rincian mutasi per CM, bukan hanya ringkasan.</template
              >
            </MpCheckbox>
          </template>
        </div>
      </MpDrawerBody>
      <MpDrawerFooter>
        <div :class="filterDrawerFooterClass">
          <MpButton variant="ghost" @click="resetFilters">Reset filter</MpButton>
          <MpButton v-if="drawerPurpose === 'export'" variant="primary" @click="handleExport"
            >Ekspor</MpButton
          >
          <MpButton v-else variant="primary" @click="isFilterDrawerOpen = false">Terapkan</MpButton>
        </div>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  css,
  MpBadge,
  MpButton,
  MpCheckbox,
  MpDatePicker,
  MpDrawer,
  MpDrawerBody,
  MpDrawerCloseButton,
  MpDrawerContent,
  MpDrawerFooter,
  MpDrawerHeader,
  MpDrawerOverlay,
  MpFlex,
  MpFormControl,
  MpFormHelpText,
  MpFormLabel,
  MpIcon,
  MpInput,
  MpInputGroup,
  MpInputLeftAddon,
  MpInputTag,
  MpRadio,
  MpSelect,
  MpSkeleton,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText,
  MpTextlink,
  MpToggle,
  type DataInterface
} from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";

useHead({ title: "Laporan Detail Kredit Memo — Mekari Jurnal" });

// ── Types ────────────────────────────────────────────────────────────────────
type TxType = "issued" | "applied" | "refund" | "reversal";
type CmStatus = "active" | "partial" | "closed";
/** A transaction is mostly open or closed; an application against an invoice
 *  can also sit at "partially paid" while that invoice is still part-settled.
 *  CM creation ("issued") is always closed. */
type TxStatus = "open" | "closed" | "partiallyPaid";

interface Transaction {
  id: string;
  dateISO: string;
  type: TxType;
  no: string | null;
  refDoc: string | null;
  description: string;
  /** Where this CM came from — a source document ("Retur Penjualan #1009") for
   *  a document-created CM, left null when it was created manually. Only
   *  meaningful on the "issued" row. */
  sourceOfCreation?: string | null;
  /** User-entered note: the manual description on an "issued" row, or the note
   *  captured at the time of an application/refund. */
  memo?: string;
  status?: TxStatus;
  mutation: number;
}

interface CreditMemo {
  id: string;
  no: string;
  issueDateISO: string;
  originalAmount: number;
  description: string;
  sourceDocNo: string;
  transactions: Transaction[];
}

interface Customer {
  id: string;
  code: string;
  name: string;
  group: string | null;
  creditMemos: CreditMemo[];
}

interface ComputedCm {
  rows: (Transaction & { balance: number })[];
  balance: number;
  status: CmStatus;
  hiddenFutureCount: number;
  hasAnyVisible: boolean;
}

// ── Mock data (same 6 sample customers as the reference prototype, ported to
//    Bahasa Indonesia) ───────────────────────────────────────────────────────
const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    code: "00009",
    name: "PT Bintang Sejahtera",
    group: "Distributor - Jakarta",
    creditMemos: [
      {
        id: "cm1",
        no: "CM-2026-0001",
        issueDateISO: "2026-03-31",
        originalAmount: 15_000_000,
        description: "Refund kelebihan bayar dari INV-2026-088",
        sourceDocNo: "INV-2026-088",
        transactions: [
          {
            id: "t1",
            dateISO: "2026-03-31",
            type: "issued",
            no: "CM-2026-0001",
            refDoc: null,
            description: "CM diterbitkan — refund kelebihan bayar",
            sourceOfCreation: "Retur Penjualan #1009",
            status: "closed",
            mutation: 15_000_000
          }
        ]
      },
      {
        id: "cm2",
        no: "CM-2026-0002",
        issueDateISO: "2026-04-14",
        originalAmount: 8_000_000,
        description: "Retur barang rusak",
        sourceDocNo: "INV-2026-0102",
        transactions: [
          {
            id: "t3",
            dateISO: "2026-04-14",
            type: "issued",
            no: "CM-2026-0002",
            refDoc: null,
            description: "CM diterbitkan — retur 2 unit Barang X",
            memo: "Retur 2 unit Barang X, kondisi rusak saat diterima",
            status: "closed",
            mutation: 8_000_000
          },
          {
            id: "t4",
            dateISO: "2026-04-16",
            type: "applied",
            no: "APP-2026-1102",
            refDoc: "INV-2026-0307",
            description: "Diterapkan ke Faktur Penjualan #10307",
            memo: "Pelunasan sebagian atas retur barang rusak, sisa ditahan customer",
            status: "partiallyPaid",
            mutation: -4_000_000
          }
        ]
      }
    ]
  },
  {
    id: "c2",
    code: "949",
    name: "CV Makmur Abadi",
    group: "Retail - Bandung",
    creditMemos: [
      {
        id: "cm3",
        no: "CM-2026-0003",
        issueDateISO: "2026-04-15",
        originalAmount: 5_000_000,
        description: "Diskon promosi Q2",
        sourceDocNo: "INV-2026-0091",
        transactions: [
          {
            id: "t7",
            dateISO: "2026-04-15",
            type: "issued",
            no: "CM-2026-0003",
            refDoc: null,
            description: "CM diterbitkan — kode promo Q2",
            sourceOfCreation: "Faktur Penjualan #10091",
            status: "closed",
            mutation: 5_000_000
          },
          {
            id: "t8",
            dateISO: "2026-04-20",
            type: "applied",
            no: "APP-2026-1075",
            refDoc: "INV-2026-0396",
            description: "Diterapkan ke Faktur Penjualan #13965",
            memo: "Pelunasan penuh sesuai kesepakatan promo Q2",
            status: "closed",
            mutation: -5_000_000
          }
        ]
      }
    ]
  },
  {
    id: "c3",
    code: "1024",
    name: "Toko Setara",
    group: null,
    creditMemos: [
      {
        id: "cm4",
        no: "CM-2026-0004",
        issueDateISO: "2026-04-18",
        originalAmount: 2_500_000,
        description: "Deposit customer",
        sourceDocNo: "INV-2026-0121",
        transactions: [
          {
            id: "t10",
            dateISO: "2026-04-18",
            type: "issued",
            no: "CM-2026-0004",
            refDoc: null,
            description: "CM diterbitkan — transfer deposit",
            memo: "Deposit transfer customer untuk pesanan berikutnya",
            status: "closed",
            mutation: 2_500_000
          }
        ]
      }
    ]
  },
  {
    id: "c4",
    code: "1187",
    name: "PT Sinar Abadi",
    group: "Distributor - Jakarta",
    creditMemos: [
      {
        id: "cm5",
        no: "CM-2026-0005",
        issueDateISO: "2026-05-02",
        originalAmount: 10_000_000,
        description: "Rebat volume Mei",
        sourceDocNo: "INV-2026-0210",
        transactions: [
          {
            id: "t11",
            dateISO: "2026-05-02",
            type: "issued",
            no: "CM-2026-0005",
            refDoc: null,
            description: "CM diterbitkan — rebat volume",
            sourceOfCreation: "Retur Penjualan #1021",
            status: "closed",
            mutation: 10_000_000
          },
          {
            id: "t12",
            dateISO: "2026-05-18",
            type: "refund",
            no: "RFD-2026-0031",
            refDoc: "BANK-TRX-88214",
            description: "Direfund ke rekening bank customer",
            memo: "Refund tunai sesuai permintaan customer via WhatsApp",
            status: "closed",
            mutation: -6_000_000
          },
          {
            id: "t13",
            dateISO: "2026-09-15",
            type: "applied",
            no: "APP-2026-1290",
            refDoc: "INV-2026-0455",
            description: "Diterapkan ke Faktur Penjualan #14502",
            memo: "Pelunasan sisa saldo CM ke faktur terbaru",
            status: "open",
            mutation: -4_000_000
          }
        ]
      }
    ]
  },
  {
    id: "c5",
    code: "612",
    name: "Toko Melati",
    group: "Retail - Bandung",
    creditMemos: [
      {
        id: "cm6",
        no: "CM-2026-0006",
        issueDateISO: "2026-03-10",
        originalAmount: 3_000_000,
        description: "Tukar produk",
        sourceDocNo: "INV-2026-0044",
        transactions: [
          {
            id: "t14",
            dateISO: "2026-03-10",
            type: "issued",
            no: "CM-2026-0006",
            refDoc: null,
            description: "CM diterbitkan — tukar produk",
            sourceOfCreation: "Retur Penjualan #1004",
            status: "closed",
            mutation: 3_000_000
          },
          {
            id: "t15",
            dateISO: "2026-03-22",
            type: "applied",
            no: "APP-2026-0980",
            refDoc: "INV-2026-0055",
            description: "Diterapkan ke Faktur Penjualan #9911",
            memo: "Pelunasan penuh atas tukar produk",
            status: "closed",
            mutation: -3_000_000
          }
        ]
      }
    ]
  },
  {
    id: "c6",
    code: "1303",
    name: "UD Cahaya Timur",
    group: null,
    creditMemos: [
      {
        id: "cm7",
        no: "CM-2026-0007",
        issueDateISO: "2026-06-05",
        originalAmount: 12_000_000,
        description: "Retur barang, pengiriman rusak",
        sourceDocNo: "INV-2026-0288",
        transactions: [
          {
            id: "t16",
            dateISO: "2026-06-05",
            type: "issued",
            no: "CM-2026-0007",
            refDoc: null,
            description: "CM diterbitkan — retur pengiriman rusak",
            memo: "Retur pengiriman rusak, disetujui manajer gudang",
            status: "closed",
            mutation: 12_000_000
          },
          {
            id: "t17",
            dateISO: "2026-06-20",
            type: "applied",
            no: "APP-2026-1180",
            refDoc: "INV-2026-0402",
            description: "Diterapkan ke Faktur Penjualan #14022",
            memo: "Pelunasan sebagian, faktur sempat disengketakan customer",
            status: "open",
            mutation: -5_000_000
          },
          {
            id: "t18",
            dateISO: "2026-07-02",
            type: "reversal",
            no: "REV-2026-0012",
            refDoc: "APP-2026-1180",
            description: "Pembalikan — faktur #14022 disengketakan",
            mutation: 5_000_000
          },
          {
            id: "t19",
            dateISO: "2026-07-10",
            type: "applied",
            no: "APP-2026-1201",
            refDoc: "INV-2026-0418",
            description: "Diterapkan ulang ke Faktur Penjualan #14105",
            memo: "Diterapkan ulang setelah pembalikan disetujui",
            status: "partiallyPaid",
            mutation: -5_000_000
          }
        ]
      }
    ]
  }
];

const STATUS_TYPE: Record<CmStatus, "completed" | "warning" | "announcement"> = {
  active: "completed",
  partial: "warning",
  closed: "announcement"
};
const STATUS_LABEL: Record<CmStatus, string> = {
  active: "Aktif",
  partial: "Sebagian",
  closed: "Habis"
};
const TX_TYPE_LABEL: Record<TxType, string> = {
  issued: "CM Diterbitkan",
  applied: "CM Diterapkan",
  refund: "CM Direfund",
  reversal: "Pembalikan CM"
};

const TX_STATUS_TYPE: Record<TxStatus, "completed" | "warning" | "information"> = {
  open: "information",
  closed: "completed",
  partiallyPaid: "warning"
};
const TX_STATUS_LABEL: Record<TxStatus, string> = {
  open: "Terbuka",
  closed: "Selesai",
  partiallyPaid: "Dibayar sebagian"
};

// ── Date helpers ─────────────────────────────────────────────────────────────
// Fixed "today" so the prototype behaves the same regardless of when it's
// opened — mirrors the reference prototype (credit-memo-report-v3.html).
const REPORT_TODAY = new Date(2026, 7, 27);
const REPORT_TODAY_ISO = isoDate(REPORT_TODAY);
const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des"
];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatDateID(iso: string) {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
function formatRp(v: number) {
  if (v === 0) return "Rp 0";
  const abs = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Math.abs(v));
  return v < 0 ? `-${abs}` : abs;
}

// What the Deskripsi column shows per transaction:
//  • CM Issued  → the manual description if one was typed, otherwise the
//    document the CM was created from (e.g. "Retur Penjualan #1009").
//  • Applied / Refund → the memo captured with that transaction.
// Each falls back to the system-generated description when neither exists.
function txDescription(row: Transaction): string {
  if (row.type === "issued") return row.memo ?? row.sourceOfCreation ?? row.description;
  if (row.type === "applied" || row.type === "refund") return row.memo ?? row.description;
  return row.description;
}

// ── Balance computation — derived fresh from the mutation log, never stored. ─
function computeCM(cm: CreditMemo, asOfISO: string): ComputedCm {
  const visible = cm.transactions
    .filter((t) => t.dateISO <= asOfISO)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const hiddenFutureCount = cm.transactions.length - visible.length;
  let running = 0;
  const rows = visible.map((t) => {
    running += t.mutation;
    return { ...t, balance: running };
  });
  const balance = running;
  const status: CmStatus =
    balance <= 0 ? "closed" : balance >= cm.originalAmount ? "active" : "partial";
  return { rows, balance, status, hiddenFutureCount, hasAnyVisible: visible.length > 0 };
}

// ── As-of date state ─────────────────────────────────────────────────────────
const pendingDate = ref<Date>(new Date(REPORT_TODAY));
const appliedDate = ref<Date>(new Date(REPORT_TODAY));
const activePreset = ref<string | null>(null);

const asOfDateISO = computed(() => isoDate(appliedDate.value));
const isFutureAsOfDate = computed(() => asOfDateISO.value > REPORT_TODAY_ISO);

const QUICK_PRESETS = [
  { key: "today", label: "Hari ini" },
  { key: "lastMonth", label: "Akhir bulan lalu" },
  { key: "thisQuarter", label: "Akhir kuartal ini" },
  { key: "thisYear", label: "Akhir tahun ini" }
];

function applyPreset(key: string) {
  let d: Date;
  if (key === "today") d = new Date(REPORT_TODAY);
  else if (key === "lastMonth")
    d = new Date(REPORT_TODAY.getFullYear(), REPORT_TODAY.getMonth(), 0);
  else if (key === "thisQuarter") {
    const q = Math.floor(REPORT_TODAY.getMonth() / 3);
    d = new Date(REPORT_TODAY.getFullYear(), q * 3 + 3, 0);
  } else d = new Date(REPORT_TODAY.getFullYear(), 11, 31);
  pendingDate.value = d;
  appliedDate.value = d;
  activePreset.value = key;
}

function generateReport() {
  appliedDate.value = pendingDate.value;
  activePreset.value = null;
}

// ── Search (OD-06) — CM Number, Source Document Number, CM Apply/Refund
//    transaction numbers only. CM Reversal numbers are deliberately excluded. ─
const search = ref("");
const searchTerm = computed(() => search.value.trim());
const flashCmId = ref<string | null>(null);
const flashTxId = ref<string | null>(null);
// Search is a jump-to lookup, not a list filter (OD-06) — report state is
// otherwise unchanged on a miss; only this inline message appears.
const searchNoMatch = ref(false);
watch(search, () => (searchNoMatch.value = false));

function clearSearch() {
  search.value = "";
  searchNoMatch.value = false;
}

function scrollToRow(id: string) {
  nextTick(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function runSearch() {
  const q = searchTerm.value.toLowerCase();
  if (!q) return;
  searchNoMatch.value = false;
  for (const c of CUSTOMERS) {
    for (const cm of c.creditMemos) {
      if (cm.no.toLowerCase().includes(q) || cm.sourceDocNo.toLowerCase().includes(q)) {
        expandedCustomers.value[c.id] = true;
        flashCmId.value = cm.id;
        scrollToRow(`cm-row-${cm.id}`);
        setTimeout(() => (flashCmId.value = null), 1800);
        return;
      }
      for (const t of cm.transactions) {
        if ((t.type === "applied" || t.type === "refund") && t.no?.toLowerCase().includes(q)) {
          expandedCustomers.value[c.id] = true;
          expandedCms.value[cm.id] = true;
          flashTxId.value = t.id;
          scrollToRow(`tx-row-${t.id}`);
          setTimeout(() => (flashTxId.value = null), 1800);
          return;
        }
      }
    }
  }
  searchNoMatch.value = true;
}

// ── Filter drawer state ──────────────────────────────────────────────────────
const isFilterDrawerOpen = ref(false);
// Same drawer, two entry points — the export-only fields (format, include
// transaction details) only render when opened via the Ekspor button.
const drawerPurpose = ref<"filter" | "export">("filter");

function openDrawer(purpose: "filter" | "export") {
  drawerPurpose.value = purpose;
  isFilterDrawerOpen.value = true;
}

const showZeroBalance = ref(false); // Defaults OFF, never persisted — resets on every load.
const customerTagData = ref<DataInterface[]>([]);
const groupTagData = ref<DataInterface[]>([]);
const customerTotalMin = ref("");
const customerTotalMax = ref("");
const cmBalanceMin = ref("");
const cmBalanceMax = ref("");

const customerSuggestions = computed(() =>
  CUSTOMERS.map((c) => ({ id: c.id, label: `${c.code} · ${c.name}`, value: c.id }))
);
const GROUPS = Array.from(
  new Set(CUSTOMERS.map((c) => c.group).filter((g): g is string => Boolean(g)))
).sort();
const groupSuggestions = computed(() => [
  ...GROUPS.map((g) => ({ id: g, label: g, value: g })),
  { id: "__none__", label: "Tidak ada grup ditetapkan", value: "__none__" }
]);

const customerTagIds = computed(() => customerTagData.value.map((t) => t.value as string));
const groupTagValues = computed(() => groupTagData.value.map((t) => t.value as string));

function parseRp(v: string): number | null {
  const n = Number(v.replace(/[^0-9]/g, ""));
  return v.trim() === "" || Number.isNaN(n) ? null : n;
}

function resetFilters() {
  showZeroBalance.value = false;
  customerTagData.value = [];
  groupTagData.value = [];
  customerTotalMin.value = "";
  customerTotalMax.value = "";
  cmBalanceMin.value = "";
  cmBalanceMax.value = "";
}

// ── Expand / collapse ────────────────────────────────────────────────────────
const expandedCustomers = ref<Record<string, boolean>>(
  Object.fromEntries(CUSTOMERS.map((c) => [c.id, true]))
);

function toggleCustomer(id: string) {
  expandedCustomers.value[id] = !expandedCustomers.value[id];
}

// CM-level expand/collapse — reveals that CM's transaction history inline
// (replaces the old side-panel; collapsed by default so the list stays dense).
const expandedCms = ref<Record<string, boolean>>({});

function toggleCm(id: string) {
  expandedCms.value[id] = !expandedCms.value[id];
}

// ── Computed customer/CM blocks — the single source of truth for what renders,
//    per the four Key Logic rules (customer inclusion, header total, zero-
//    balance principles, balance range). ─────────────────────────────────────
const customerBlocks = computed(() => {
  const minCustTotal = parseRp(customerTotalMin.value);
  const maxCustTotal = parseRp(customerTotalMax.value);
  const minCm = parseRp(cmBalanceMin.value);
  const maxCm = parseRp(cmBalanceMax.value);

  return CUSTOMERS.filter(
    (c) => customerTagIds.value.length === 0 || customerTagIds.value.includes(c.id)
  )
    .filter((c) => {
      if (groupTagValues.value.length === 0) return true;
      if (groupTagValues.value.includes("__none__") && !c.group) return true;
      return c.group ? groupTagValues.value.includes(c.group) : false;
    })
    .map((customer) => {
      const cms = customer.creditMemos
        .map((cm) => ({ cm, computed: computeCM(cm, asOfDateISO.value) }))
        .filter((x) => x.computed.hasAnyVisible)
        .filter((x) => showZeroBalance.value || x.computed.balance > 0)
        .filter(
          (x) =>
            (minCm === null || x.computed.balance >= minCm) &&
            (maxCm === null || x.computed.balance <= maxCm)
        )
        .sort((a, b) => b.computed.balance - a.computed.balance);

      const custTotal = customer.creditMemos.reduce((sum, cm) => {
        const r = computeCM(cm, asOfDateISO.value);
        return r.balance > 0 ? sum + r.balance : sum;
      }, 0);

      return { customer, cms, custTotal, isExpanded: expandedCustomers.value[customer.id] ?? true };
    })
    .filter((block) => block.cms.length > 0)
    .filter(
      (block) =>
        (minCustTotal === null || block.custTotal >= minCustTotal) &&
        (maxCustTotal === null || block.custTotal <= maxCustTotal)
    )
    .sort((a, b) => b.custTotal - a.custTotal);
});

const columnCount = 5;

// ── Report state (normal / loading / error / empty) ─────────────────────────
const demoState = ref<"normal" | "loading" | "error">("normal");

// Search is excluded here — it's a jump-to lookup (OD-06), not a list filter,
// so it never drives the blank-slate reason (see searchNoMatch for its own
// independent inline message instead).
const hasAnyFilterActive = computed(
  () =>
    customerTagData.value.length > 0 ||
    groupTagData.value.length > 0 ||
    customerTotalMin.value !== "" ||
    customerTotalMax.value !== "" ||
    cmBalanceMin.value !== "" ||
    cmBalanceMax.value !== ""
);

const emptyReason = computed<"no-activity" | "all-zero-toggle-off" | "filter-no-match" | null>(
  () => {
    if (customerBlocks.value.length > 0) return null;
    if (hasAnyFilterActive.value) return "filter-no-match";
    const anyCmVisibleIgnoringZero = CUSTOMERS.some((c) =>
      c.creditMemos.some((cm) => computeCM(cm, asOfDateISO.value).hasAnyVisible)
    );
    if (!anyCmVisibleIgnoringZero) return "no-activity";
    if (!showZeroBalance.value) return "all-zero-toggle-off";
    return "no-activity";
  }
);

const reportState = computed<"normal" | "loading" | "error" | "empty">(() => {
  if (demoState.value === "error") return "error";
  if (demoState.value === "loading") return "loading";
  return customerBlocks.value.length > 0 ? "normal" : "empty";
});

const emptyTitle = computed(() => "Tidak ada Kredit Memo aktif pada tanggal ini.");
const emptyDescription = computed(() => {
  if (emptyReason.value === "filter-no-match")
    return "Tidak ada data yang sesuai dengan filter ini.";
  if (emptyReason.value === "all-zero-toggle-off")
    return "Aktifkan 'Tampilkan CM habis' untuk melihat kredit memo yang sudah habis.";
  return "Coba ubah tanggal 'per tanggal' yang dipilih.";
});

// ── Export (always async, per PRD) ───────────────────────────────────────────
const exportFormat = ref<"xlsx" | "csv">("xlsx");
const includeTransactionDetails = ref(false);

function handleExport() {
  // Wire to the async export job queue + Riwayat Ekspor in a real build,
  // passing exportFormat.value + includeTransactionDetails.value alongside
  // the current filter state (snapshotted at click time, per PRD IT-011).
  // Toast: "File sedang disiapkan. Notifikasi akan dikirim saat siap diunduh."
  isFilterDrawerOpen.value = false;
}

// ── Table layout ─────────────────────────────────────────────────────────────
// Deskripsi (index 2) is left with no width — in a fixed-layout table only an
// unset/auto column absorbs leftover space; a percentage column is sized
// literally against the table width and won't "flex" to fill the remainder.
const colWidths = ["130px", "150px", "", "120px", "160px"];

// All css() below uses Pixel 3 v2.1 token names only (see docs/tokens.md).
const devSwitcherClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  bg: "gray.25",
  border: "sm",
  borderColor: "gray.100",
  rounded: "md",
  p: 3,
  mb: 4
});

const freshnessRowClass = css({ display: "flex", alignItems: "center", gap: 2, mb: 4 });
const freshnessDotClass = css({
  width: "6px",
  height: "6px",
  rounded: "full",
  bg: "green.400",
  display: "inline-block"
});

// Two stacked control rows.
const controlsClass = css({ display: "flex", flexDirection: "column", gap: 3, mb: 4 });
const controlsRowClass = css({
  display: "flex",
  alignItems: "flex-end",
  gap: 3,
  flexWrap: "nowrap"
});
// Date + Periode are one unit — grouping them keeps Periode beside the date
// instead of wrapping to its own line on a narrow viewport.
const dateGroupClass = css({ display: "flex", alignItems: "flex-end", gap: 3 });
const datePickerClass = css({ width: "160px" });
const quickSelectClass = css({ width: "180px" });
const controlButtonClass = css({ flexShrink: 0 });
// Pins an item to the right end of its row — Ekspor on the top row, the
// search field on the row directly below it, so the two line up.
const rightAlignedClass = css({ marginLeft: "auto", flexShrink: 0 });

const searchGroupClass = css({
  position: "relative",
  width: "300px",
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
// Floats below the search field so it doesn't disturb the controls row's
// height (the row uses alignItems:"flex-end").
const searchNoMatchClass = css({ position: "absolute", top: "100%", left: 0, mt: 1 });

const infoBannerClass = css({
  display: "flex",
  flexDirection: "column",
  gap: 1,
  bg: "blue.50",
  borderLeft: "lg",
  borderLeftColor: "blue.400",
  rounded: "md",
  p: 3,
  mb: 4
});

const tableWrapClass = css({ mb: 4 });
const tableFixedClass = css({ tableLayout: "fixed", minWidth: "760px" });
const numCellClass = css({ textAlign: "right" });
const descCellClass = css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

// The colspan cell itself MUST stay `display: table-cell` (its native value) —
// overriding that to `flex` breaks colspan/column-width tracking entirely
// (the cell collapses to a single column's width and its content overlaps
// neighbouring cells). The flex layout goes on an inner <div> instead, same
// as the bulk-action row in index-template.vue.
const customerHeaderCellClass = css({ bg: "gray.25" });
const customerHeaderRowClass = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
});
const customerHeaderButtonClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  border: "0",
  bg: "transparent",
  p: 0,
  cursor: "pointer",
  minWidth: 0
});

const chevronClass = css({ transition: "transform 0.15s ease", flexShrink: 0 });
const chevronOpenClass = css({ transform: "rotate(0deg)" });
const chevronClosedClass = css({ transform: "rotate(-90deg)" });

const cmRowClass = css({});
const cmFirstCellClass = css({
  borderLeft: "lg",
  borderLeftColor: "blue.400",
  pl: "4!"
});
const cmExpandButtonClass = css({
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
// Transaction rows share the parent table's own 5-column grid (no nested
// table, no repeated header) — one indent deeper than the CM row's own
// left-accent, and a smaller/muted tone so they read as detail, not another
// top-level row.
const txRowClass = css({ "& td": { color: "gray.600", fontSize: "sm" } });
// pl matches the CM row's chevron-button indent (16px cell padding + 20px
// icon + 4px gap = 40px) so the date text lines up under the CM row's own
// date, even though this row has no chevron of its own.
const txFirstCellClass = css({
  borderLeft: "lg",
  borderLeftColor: "gray.100",
  pl: "40px!"
});
// MpTextlink doesn't expose a size prop — it always renders at the button
// recipe's md (14px) regardless of an ancestor's font-size, so it must be
// overridden directly to match the rest of this (smaller) row.
const txLinkClass = css({ fontSize: "sm!" });
const txDescClass = css({ display: "flex", flexDirection: "column", gap: 1 });
const txDescTextClass = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
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
const errorStateClass = css({
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

const drawerTitleClass = css({ fontSize: "lg" });
const filterDrawerFormClass = css({ display: "flex", flexDirection: "column", gap: 4 });
const filterDrawerFooterClass = css({
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  width: "full"
});
const rangeRowClass = css({ display: "flex", alignItems: "center", gap: 2, mt: 1 });

const futureNoteCellClass = css({ bg: "gray.25", p: "3!" });
const futureNoteClass = css({ fontStyle: "italic" });
const flashRowClass = css({ bg: "blue.50!" });
</script>
