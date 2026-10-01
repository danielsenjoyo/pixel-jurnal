/**
 * Reports index source of truth — ported from `jurnal-frontend-app`
 * (`src/pages/reports/index/`), the production Vue 2 implementation.
 *
 * The production page is a tab bar of report categories; each tab renders a
 * two-column grid of report entries, and each entry is a title, a one-line
 * description, and a "View report" button. That structure is reproduced here
 * one-for-one.
 *
 * **Ported, not copied.** Production fetches
 * `api/v1/users/authorization/report/list` and renders whatever the backend
 * says this user's role and package allow (`can_access`,
 * `report_authorization_list`, per-report feature flags, FIFO/SCM toggles,
 * paywalls). This prototype has no backend, so the tab and report set is the
 * union of everything the production mock returns, and everything is always
 * visible. Deliberately absent: the export modals (product conversion,
 * assembly/disassembly order, COGM) — those are export flows, not reports —
 * the ongoing-recalculation and background-export banners that only report
 * live backend state, and the profitability paywall upsell.
 *
 * Copy is verbatim from the production `i18n.json`. `label`/`labelId` follows
 * the `menu.ts` convention: `label` is English, `labelId` carries the
 * Indonesian string.
 *
 * `slug` drives `/reports/<slug>`, the stub detail route
 * (`app/pages/reports/[report].vue`) — no report page is built yet, so every
 * card lands on a titled placeholder rather than a dead link.
 */

export interface ReportEntry {
  /** Production's `report.name`; also the `/reports/<slug>` route segment. */
  slug: string;
  label: string;
  labelId: string;
  description: string;
  descriptionId: string;
  /** Production shows a red "New" badge beside the title. */
  isNew?: boolean;
  /**
   * Production marks these reports as Airene-powered with the Airene wordmark
   * image beside the title. That asset isn't in this prototype, so the card
   * renders an information badge reading "Airene" instead.
   */
  airene?: boolean;
  /**
   * Production keeps a link to the pre-redesign report alongside the new one,
   * with a tooltip naming the sunset date.
   */
  hasLegacy?: boolean;
}

export interface ReportTab {
  /** Production's `tab_authorization_list[].name`, minus the `_tab` suffix. */
  id: string;
  label: string;
  labelId: string;
  reports: ReportEntry[];
}

/** Sunset date production shows in the "View old version" tooltip. */
export const LEGACY_REPORT_SUNSET_DATE = "31 October 2024";

export const REPORT_SECTION_COPY = {
  viewReport: { label: "View report", labelId: "Lihat laporan" },
  viewOldReport: { label: "View old version", labelId: "Lihat versi lama" },
  newBadge: { label: "New", labelId: "Baru" },
  legacyTooltip: {
    label: `This report version is available until ${LEGACY_REPORT_SUNSET_DATE}.`,
    labelId: `Versi laporan ini tersedia sampai ${LEGACY_REPORT_SUNSET_DATE}.`
  }
} as const;

export const REPORT_TABS: ReportTab[] = [
  {
    id: "business_overview",
    label: "Business overview",
    labelId: "Sekilas bisnis",
    reports: [
      {
        slug: "balance_sheet",
        label: "Balance sheet",
        labelId: "Neraca",
        description:
          "Shows what are owned (assets), what are owed (liabilities), and what have been invested in this company (equity) as of a specific date.",
        descriptionId:
          "Menampilkan apa yang dimiliki (aset), apa saja utangnya (liabilitas), dan apa yang sudah diinvestasikan ke perusahaan ini (ekuitas) pada tanggal tertentu.",
        hasLegacy: true
      },
      {
        slug: "general_ledger",
        label: "General ledger",
        labelId: "Buku besar",
        description:
          "Shows all transactions based on accounts in a certain period. It includes transaction movement chronology during the period.",
        descriptionId:
          "Menampilkan semua transaksi berdasarkan akun dalam periode tertentu, termasuk kronologi pergerakan transaksinya selama periode berlangsung."
      },
      {
        slug: "profit_loss",
        label: "Profit & loss",
        labelId: "Laba rugi",
        description:
          "Shows all earned income and incurred expenses in a certain period. The report template is customizable in the latest version.",
        descriptionId:
          "Menampilkan semua pendapatan yang diperoleh dan biaya yang dikeluarkan dalam periode tertentu. Template laporan versi terkini bisa Anda custom sesuai kebutuhan.",
        hasLegacy: true
      },
      {
        slug: "journal",
        label: "Journal",
        labelId: "Jurnal",
        description:
          "Shows all journal entries for each transaction in a certain period. You can track transactions that go into each account.",
        descriptionId:
          "Menampilkan semua journal entry per transaksi dalam periode tertentu. Anda dapat melacak transaksi yang masuk ke masing-masing akun."
      },
      {
        slug: "cash_flow",
        label: "Cash flow",
        labelId: "Arus kas",
        description:
          "Shows the movement of cash in and cash out from transactions within a certain period. This report template is customizable.",
        descriptionId:
          "Menampilkan pergerakan uang masuk dan keluar dari transaksi dalam periode tertentu. Template laporan ini bisa Anda custom sesuai kebutuhan.",
        airene: true
      },
      {
        slug: "trial_balance",
        label: "Trial balance",
        labelId: "Neraca saldo",
        description:
          "Shows balances of each account, including opening balance, movement, and ending balance in a certain period.",
        descriptionId:
          "Menampilkan saldo dari setiap akun, termasuk saldo awal, pergerakan, dan saldo akhir dalam periode tertentu."
      },
      {
        slug: "statement_of_change_in_equity",
        label: "Statement of changes in equity",
        labelId: "Perubahan modal",
        description: "Shows owner's equity changes or movements in a certain period.",
        descriptionId:
          "Menampilkan perubahan atau pergerakan ekuitas pemilik dalam periode tertentu."
      },
      {
        slug: "executive_summary",
        label: "Executive summary",
        labelId: "Ringkasan bisnis",
        description:
          "Shows the summary of main financial report and its insight in a certain period.",
        descriptionId:
          "Menampilkan ringkasan laporan keuangan utama dan wawasannya dalam periode tertentu."
      },
      {
        slug: "profit_loss_budgeting",
        label: "Profit & loss budgeting",
        labelId: "Anggaran laba rugi",
        description:
          "Shows the comparison between actual transaction amount and arranged budget per account.",
        descriptionId:
          "Menampilkan perbandingan antara jumlah transaksi sebenarnya dan anggaran yang telah disusun per akun.",
        isNew: true
      },
      {
        slug: "budget_management",
        label: "Budget management",
        labelId: "Manajemen anggaran",
        description:
          "Allows you to set and manage the budget for expenses and income of this company.",
        descriptionId:
          "Memungkinkan Anda mengatur dan mengelola anggaran untuk pengeluaran dan pendapatan perusahaan ini.",
        isNew: true
      }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    labelId: "Penjualan",
    reports: [
      {
        slug: "sales_list",
        label: "Sales list",
        labelId: "Daftar penjualan",
        description:
          "Shows sales transactions chronologically based on type in a certain period. This report template is customizable.",
        descriptionId:
          "Menampilkan transaksi penjualan secara kronologis berdasarkan tipenya dalam periode tertentu. Template laporan ini bisa Anda custom sesuai kebutuhan."
      },
      {
        slug: "sales_by_customer",
        label: "Sales by customer",
        labelId: "Penjualan per pelanggan",
        description: "Shows all sales transactions from each customer in a certain period.",
        descriptionId:
          "Menampilkan semua transaksi penjualan dari setiap pelanggan dalam periode tertentu."
      },
      {
        slug: "customer_balance",
        label: "Customer balance",
        labelId: "Piutang pelanggan",
        description:
          "Shows all unpaid invoices and credit memo balances of customers in a specific date.",
        descriptionId:
          "Menampilkan semua faktur yang belum dibayar dan saldo memo kredit pelanggan pada tanggal tertentu."
      },
      {
        slug: "aged_receivable",
        label: "Aged receivable",
        labelId: "Usia piutang",
        description:
          "Shows the account receivable total from each customer based on various ages (30, 60, 90, and after 90 days).",
        descriptionId:
          "Menampilkan total piutang dari setiap pelanggan berdasarkan usianya (30, 60, 90, dan setelah 90 hari)."
      },
      {
        slug: "sales_delivery",
        label: "Sales delivery",
        labelId: "Pengiriman penjualan",
        description: "Shows all delivered products for sales transactions in a certain period.",
        descriptionId:
          "Menampilkan semua produk yang dikirim untuk transaksi penjualan dalam periode tertentu."
      },
      {
        slug: "sales_by_product",
        label: "Sales by product",
        labelId: "Penjualan per produk",
        description:
          "Shows all sold product quantities, return quantities, net sales, and average selling price in a certain period.",
        descriptionId:
          "Menampilkan semua kuantitas produk yang terjual, kuantitas retur, penjualan bersih, dan harga penjualan rata-rata dalam periode tertentu."
      },
      {
        slug: "sales_order_completion",
        label: "Sales order completion",
        labelId: "Penyelesaian pesanan penjualan",
        description:
          "Shows business process summary of this company. You can identify each sales quote and order completion until its invoice and payment are made.",
        descriptionId:
          "Menampilkan ringkasan proses bisnis perusahaan ini. Anda dapat mengidentifikasi setiap penyelesaian penawaran dan pesanan penjualan hingga penagihan dan pembayarannya dilakukan.",
        isNew: true
      },
      {
        slug: "product_profitability",
        label: "Product profitability",
        labelId: "Profitabilitas produk",
        description: "Shows gained total profit from sold products in a certain period.",
        descriptionId:
          "Menampilkan total keuntungan yang diperoleh dari produk yang terjual dalam periode tertentu."
      },
      {
        slug: "proforma_invoice_list",
        label: "Proforma invoice list",
        labelId: "Daftar faktur proforma",
        description: "Shows all created proforma invoices in a certain period.",
        descriptionId: "Menampilkan semua faktur proforma yang dibuat dalam periode tertentu."
      },
      {
        slug: "merged_invoice_list",
        label: "Join invoice list",
        labelId: "Daftar tukar faktur",
        description: "Shows all join invoices in a certain period.",
        descriptionId: "Menampilkan semua tukar faktur dalam periode tertentu."
      }
    ]
  },
  {
    id: "purchases",
    label: "Purchases",
    labelId: "Pembelian",
    reports: [
      {
        slug: "purchases_list",
        label: "Purchase list",
        labelId: "Daftar pembelian",
        description:
          "Shows purchase transactions chronologically based on type in a certain period. This report template is customizable.",
        descriptionId:
          "Menampilkan transaksi pembelian secara kronologis berdasarkan tipenya dalam periode tertentu. Template laporan ini bisa Anda custom sesuai kebutuhan."
      },
      {
        slug: "purchases_by_vendor",
        label: "Purchase by vendor",
        labelId: "Pembelian per supplier",
        description: "Shows all purchase transactions from each vendor in a certain period.",
        descriptionId:
          "Menampilkan semua transaksi pembelian dari setiap supplier dalam periode tertentu."
      },
      {
        slug: "vendor_balance",
        label: "Vendor balance",
        labelId: "Utang supplier",
        description:
          "Shows all unpaid invoices and debit memo balances of vendors as of a specific date.",
        descriptionId:
          "Menampilkan semua faktur yang belum dibayar dan saldo memo debit supplier pada tanggal tertentu."
      },
      {
        slug: "expense_list",
        label: "Expense list",
        labelId: "Daftar pengeluaran",
        description: "Shows all expense transactions in a certain period.",
        descriptionId: "Menampilkan semua transaksi pengeluaran dalam periode tertentu."
      },
      {
        slug: "expense_details",
        label: "Expense details",
        labelId: "Detail pengeluaran",
        description: "Shows all expense transactions based on accounts in a certain period.",
        descriptionId:
          "Menampilkan semua transaksi pengeluaran berdasarkan akun dalam periode tertentu."
      },
      {
        slug: "aged_payable",
        label: "Aged payable",
        labelId: "Usia utang",
        description:
          "Shows the account payable total to each vendor based on various ages (30, 60, 90, and after 90 days).",
        descriptionId:
          "Menampilkan total utang kepada setiap supplier berdasarkan usianya (30, 60, 90, dan setelah 90 hari)."
      },
      {
        slug: "purchases_delivery",
        label: "Purchase delivery",
        labelId: "Pengiriman pembelian",
        description: "Shows all delivered products for purchase transactions in a certain period.",
        descriptionId:
          "Menampilkan semua produk yang dikirim untuk transaksi pembelian dalam periode tertentu."
      },
      {
        slug: "purchases_by_product",
        label: "Purchase by product",
        labelId: "Pembelian per produk",
        description:
          "Shows all purchased product quantities, return quantities, net purchases, and average buying price in a certain period.",
        descriptionId:
          "Menampilkan semua kuantitas produk yang dibeli, kuantitas retur, pembelian bersih, dan harga pembelian rata-rata dalam periode tertentu."
      },
      {
        slug: "purchases_order_completion",
        label: "Purchase order completion",
        labelId: "Penyelesaian pesanan pembelian",
        description:
          "Shows business process summary of this company. You can identify each purchase quote and order completion until its invoice and payment are made.",
        descriptionId:
          "Menampilkan ringkasan proses bisnis perusahaan ini. Anda dapat mengidentifikasi setiap penyelesaian penawaran dan pesanan pembelian hingga penagihan dan pembayarannya dilakukan.",
        isNew: true
      }
    ]
  },
  {
    id: "products",
    label: "Products",
    labelId: "Produk",
    reports: [
      {
        slug: "inventory_summary",
        label: "Inventory summary",
        labelId: "Ringkasan persediaan barang",
        description:
          "Shows available stock quantity with its average cost per unit and total value as of a specific date.",
        descriptionId:
          "Menampilkan kuantitas stok yang tersedia dengan harga rata-rata per unit dan total nilainya pada tanggal tertentu."
      },
      {
        slug: "warehouse_stock_quantity",
        label: "Warehouse stock quantity",
        labelId: "Kuantitas stok gudang",
        description:
          "Shows each product quantity based on selected warehouses and as of a specific date.",
        descriptionId:
          "Menampilkan setiap kuantitas produk berdasarkan gudang yang dipilih pada tanggal tertentu."
      },
      {
        slug: "inventory_valuation",
        label: "Inventory valuation",
        labelId: "Nilai persediaan barang",
        description:
          "Shows the stock movement of each product based on current stock and its value in a certain period.",
        descriptionId:
          "Menampilkan pergerakan stok per produk berdasarkan stok yang tersedia dan nilai stoknya dalam periode tertentu."
      },
      {
        slug: "warehouse_items_valuation",
        label: "Warehouse stock valuation",
        labelId: "Nilai stok gudang",
        description: "Shows inventory valuation per warehouse in a certain period.",
        descriptionId: "Menampilkan nilai persediaan barang per gudang dalam periode tertentu."
      },
      {
        slug: "inventory_details",
        label: "Inventory details",
        labelId: "Detail persediaan barang",
        description: "Shows a list of products with their movements and ending quantities.",
        descriptionId: "Menampilkan daftar produk dengan mutasi dan kuantitas akhirnya."
      },
      {
        slug: "warehouse_items_stock_movement_summary",
        label: "Warehouse item movement",
        labelId: "Pergerakan barang gudang",
        description: "Shows stock movement per warehouse in a certain period.",
        descriptionId: "Menampilkan pergerakan stok per gudang dalam periode tertentu."
      },
      {
        slug: "inventory_turnover",
        label: "Inventory turnover",
        labelId: "Perputaran persediaan barang",
        description:
          "Showing the ratio of how often a product is sold and restocked in a warehouse.",
        descriptionId:
          "Menampilkan rasio tentang seberapa sering produk terjual dan ditambahkan stoknya kembali di sebuah gudang."
      },
      {
        slug: "fillrate_report",
        label: "Order fulfillment rate",
        labelId: "Tingkat pemenuhan pesanan",
        description:
          "Showing percentages of fulfilled orders with the current stock for future dates.",
        descriptionId:
          "Menampilkan persentase pesanan yang dapat dipenuhi dengan stok saat ini untuk beberapa waktu ke depan."
      },
      {
        slug: "serial_number_product_quantity",
        label: "Serial numbered product quantity",
        labelId: "Kuantitas produk dengan nomor seri",
        description:
          "Showing the available quantity and stock on hand of products with serial numbers based on a specific date or period.",
        descriptionId:
          "Menampilkan kuantitas tersedia dan stok di gudang dari produk dengan nomor seri berdasarkan tanggal atau periode tertentu."
      },
      {
        slug: "serial_number_warehouse_quantity",
        label: "Warehouse with serial numbered products",
        labelId: "Gudang berisi produk bernomor seri",
        description:
          "Showing warehouses that store products with serial numbers, stock on hand, and available quantity based on a specific date or period.",
        descriptionId:
          "Menampilkan gudang yang menyimpan produk dengan nomor seri, kuantitas tersedia, dan stok di gudang berdasarkan tanggal atau periode tertentu."
      }
    ]
  },
  {
    id: "assets",
    label: "Assets",
    labelId: "Aset",
    reports: [
      {
        slug: "fixed_asset_summary",
        label: "Fixed asset summary",
        labelId: "Ringkasan aset tetap",
        description:
          "Shows fixed assets list with acquisition date, initial cost, depreciation account, and book value.",
        descriptionId:
          "Menampilkan daftar aset tetap dengan tanggal akuisisi, biaya awal, akun penyusutan, dan nilai buku."
      },
      {
        slug: "fixed_asset_details",
        label: "Fixed asset details",
        labelId: "Detail aset tetap",
        description: "Shows fixed assets list with its book value in a certain period.",
        descriptionId: "Menampilkan daftar aset tetap beserta nilai bukunya dalam periode tertentu."
      },
      {
        slug: "sale_dispose_asset",
        label: "Sold or disposed asset",
        labelId: "Penjualan atau pelepasan aset",
        description: "Shows sold or disposed assets in a certain period.",
        descriptionId: "Menampilkan aset yang dijual atau dilepas dalam periode tertentu."
      }
    ]
  },
  {
    id: "foreign_exchange",
    label: "Foreign exchange",
    labelId: "Pertukaran kurs",
    reports: [
      {
        slug: "bank_summary",
        label: "Bank summary",
        labelId: "Ringkasan bank",
        description:
          "Shows the summary of each bank account and its balance information in a certain period.",
        descriptionId:
          "Menampilkan ringkasan setiap akun bank dan informasi saldonya dalam periode tertentu."
      },
      {
        slug: "foreign_exchange_gain_loss",
        label: "Foreign exchange gain/loss",
        labelId: "Devisa laba atau rugi",
        description:
          "Shows the gain or loss of each currency used in transactions and foreign bank accounts based on the exchange rate.",
        descriptionId:
          "Menampilkan laba atau rugi setiap nilai mata uang yang digunakan di transaksi dan rekening bank asing berdasarkan kurs."
      },
      {
        slug: "realised_currency_gain_loss",
        label: "Realized currency gain/loss",
        labelId: "Laba atau rugi mata uang terealisasi",
        description:
          "Shows the gain or loss incurred from each paid transaction based on the exchange rate.",
        descriptionId:
          "Menampilkan laba atau rugi yang timbul dari setiap transaksi yang dibayar berdasarkan kurs."
      },
      {
        slug: "unrealised_currency_gain_loss",
        label: "Unrealized currency gain/loss",
        labelId: "Laba atau rugi mata uang belum terealisasi",
        description:
          "Shows estimated gain or loss incurred potentially from each unpaid transaction based on the exchange rate.",
        descriptionId:
          "Menampilkan perkiraan laba atau rugi yang berpotensi timbul dari setiap transaksi yang belum dibayar berdasarkan kurs."
      }
    ]
  },
  {
    id: "bank",
    label: "Bank",
    labelId: "Bank",
    reports: [
      {
        slug: "bank_reconciliation_summary",
        label: "Bank reconciliation summary",
        labelId: "Ringkasan rekonsiliasi bank",
        description:
          "Shows the summary of reconciled bank statement balances, as well as lists of unreconciled bank statements and transactions.",
        descriptionId:
          "Menampilkan ringkasan saldo rekening koran terekonsiliasi, serta daftar rekening laporan dan transaksi yang belum direkonsiliasi."
      },
      {
        slug: "bank_statement_report",
        label: "Bank statement",
        labelId: "Mutasi rekening koran",
        description:
          "Shows a list of bank statements, reconciliation status, and their sources in a certain period.",
        descriptionId:
          "Menampilkan daftar rekening koran, status rekonsiliasi, dan sumbernya dalam periode tertentu."
      }
    ]
  },
  {
    id: "tax",
    label: "Tax",
    labelId: "Pajak",
    reports: [
      {
        slug: "witholding_tax_report",
        label: "Withholding tax",
        labelId: "Pajak pemotongan",
        description:
          "Shows taxable amount, tax rate, and tax amount with the withholding type used in transactions in a certain period.",
        descriptionId:
          "Menampilkan dasar pengenaan pajak (DPP), tarif pajak, dan jumlah pajak dengan tipe pemotongan yang digunakan di transaksi dalam periode tertentu."
      },
      {
        slug: "sales_tax_report",
        label: "Sales tax",
        labelId: "Pajak penjualan",
        description:
          "Shows taxable amount, tax rate, and tax amount with the value added tax used in transactions in a certain period.",
        descriptionId:
          "Menampilkan dasar pengenaan pajak (DPP), tarif pajak, dan jumlah pajak dengan pajak pertambahan nilai (PPN) yang digunakan di transaksi dalam periode tertentu."
      }
    ]
  }
];

/** Flat lookup for the `/reports/<slug>` stub detail route. */
export const REPORTS_BY_SLUG: Record<string, ReportEntry> = Object.fromEntries(
  REPORT_TABS.flatMap((tab) => tab.reports.map((report) => [report.slug, report]))
);
