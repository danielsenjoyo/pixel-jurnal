import type { IconName } from "@mekari/pixel3";

/**
 * Home (Beranda) source of truth — ported from `jurnal-frontend-app`
 * (`src/pages/onboarding/home/`), the production Vue 2 implementation.
 *
 * Five sections, in the order the production page renders them:
 *
 *   1. Activities        — greeting + shortcut grid
 *   2. Highlights        — dismissible promo carousel
 *   3. Add-ons           — premium-feature teasers on the blue gradient card
 *   4. Live training     — free training schedule
 *   5. Optimize business — Mekari product cross-sell carousel
 *
 * **Ported, not copied.** Production drives these off feature flags, package
 * tier, and per-user access (`user_app_access`, `showMigrationLayout`,
 * `ent_plus_package`, paywalls). This prototype has no backend, so every item
 * is always visible and every CTA lands on a real prototype route or the same
 * external URL production uses. The banners that exist purely to report live
 * backend state — multi-currency activation, anomaly detection, data-migration
 * progress — are intentionally absent.
 *
 * Copy is verbatim from the production `i18n.json` files. `label`/`labelId`
 * follows the `menu.ts` convention: `label` is English, `labelId` carries the
 * Indonesian string.
 */

export interface HomeCopy {
  label: string;
  labelId: string;
}

export interface HomeActivity extends HomeCopy {
  id: string;
  icon: IconName;
  route: string;
}

export interface HomeHighlight extends HomeCopy {
  id: string;
  /** CTA label. */
  action: string;
  actionId: string;
  /** Decorative mark — stands in for production's per-slide illustration. */
  icon: IconName;
  route: string;
}

export interface HomeAddOn extends HomeCopy {
  id: string;
  icon: IconName;
  description: string;
  descriptionId: string;
}

export interface HomeTraining extends HomeCopy {
  id: string;
  icon: IconName;
  day: string;
  dayId: string;
  time: string;
  place: string;
  placeId: string;
  url: string;
}

export interface HomeApp extends HomeCopy {
  id: string;
  /** Product name — a brand name, never translated. */
  name: string;
  icon: IconName;
  /** Internal prototype route, or an external product page. */
  route?: string;
  externalUrl?: string;
}

/** Mekari Marketplace catalog — production's `MARKETPLACE_EXPLORE`. */
export const MARKETPLACE_URL = "https://launchpad.mekari.com/marketplace/catalog";

/** Zoho registration base — production's `MEETING_ZOHO_URL`. */
const MEETING_URL = "https://meeting.zoho.com/meeting/register";

/** Section headings. */
export const HOME_SECTION_COPY = {
  greeting: { label: "Hello", labelId: "Halo" },
  activitiesTitle: {
    label: "What activity do you want to do?",
    labelId: "Aktivitas apa yang ingin Anda lakukan?"
  },
  highlightsTitle: { label: "Highlight", labelId: "Sorotan" },
  highlightsClosed: {
    label: "Highlight closed. This section will appear again every time you sign in",
    labelId: "Sorotan ditutup. Bagian ini akan muncul kembali setiap Anda sign in"
  },
  addOnsTitle: {
    label: "Boost your business productivity with Jurnal additional features",
    labelId: "Tingkatkan produktivitas bisnis Anda dengan fitur tambahan Jurnal"
  },
  addOnsAction: {
    label: "Visit Mekari Marketplace",
    labelId: "Kunjungi Mekari Marketplace"
  },
  trainingTitle: { label: "Free Jurnal training", labelId: "Pelatihan Jurnal gratis" },
  trainingSubtitle: {
    label: "Choose the training that suits your needs.",
    labelId: "Pilih pelatihan sesuai kebutuhan Anda."
  },
  trainingAction: { label: "Sign up now", labelId: "Daftar sekarang" },
  trainingDay: { label: "Day", labelId: "Hari" },
  trainingTime: { label: "Time", labelId: "Waktu" },
  trainingPlace: { label: "Place", labelId: "Tempat" },
  optimizeTitle: {
    label: "Optimize your business process",
    labelId: "Optimalkan proses bisnis Anda"
  },
  optimizeAction: { label: "Check", labelId: "Cek" },
  closeHighlight: { label: "Close", labelId: "Tutup" }
} satisfies Record<string, HomeCopy>;

/**
 * Shortcut tiles. Production renders a PNG illustration per tile; this
 * prototype ships no illustration assets, so each tile uses the same Pixel
 * icon its destination module uses in the sidebar (`menu.ts`) — the tile and
 * the nav row for the same module then read as the same thing.
 */
export const HOME_ACTIVITIES: HomeActivity[] = [
  {
    id: "create-sales-invoice",
    label: "Create sales invoice",
    labelId: "Buat faktur penjualan",
    icon: "sales",
    route: "/sales"
  },
  {
    id: "create-sales-order",
    label: "Create sales order",
    labelId: "Buat pemesanan penjualan",
    icon: "doc",
    route: "/sales"
  },
  {
    id: "create-purchase-invoice",
    label: "Create purchase invoice",
    labelId: "Buat faktur pembelian",
    icon: "cart",
    route: "/purchase"
  },
  {
    id: "create-product",
    label: "Add new product",
    labelId: "Tambah produk baru",
    icon: "products",
    route: "/products"
  },
  {
    id: "profit-and-loss",
    label: "See profit & loss report",
    labelId: "Lihat laporan laba rugi",
    icon: "reports",
    route: "/reports"
  },
  {
    id: "create-expense",
    label: "Create expense transaction",
    labelId: "Buat pencatatan biaya",
    icon: "expenses",
    route: "/expenses"
  },
  {
    id: "mekari-pay",
    label: "Activate Mekari Pay",
    labelId: "Aktifkan Mekari Pay",
    icon: "mekari_pay",
    route: "/mekari-pay"
  }
];

/**
 * Promo carousel. Production gates slides on package tier and migration
 * state, and picks one of three closing-book messages by calendar month.
 * Here every slide is always shown and closing-book uses its default copy.
 *
 * Two production destinations (data migration, referral program) have no page
 * in this prototype — they point at Applications, the marketplace surface
 * those flows are reached through here.
 */
export const HOME_HIGHLIGHTS: HomeHighlight[] = [
  {
    id: "mekari-pay",
    label: "Send and receive payments are simplified on a single platform with Mekari Pay",
    labelId:
      "Kirim dan terima pembayaran lebih mudah melalui Mekari Pay yang terintegrasi dengan Jurnal",
    action: "Activate Mekari Pay",
    actionId: "Aktifkan Mekari Pay",
    icon: "mekari_pay",
    route: "/mekari-pay"
  },
  {
    id: "upsell",
    label: "Try more features on transaction, price rule, and invoices in Enterprise+",
    labelId: "Coba fitur transaksi, aturan harga, dan invoicing lebih lengkap di Enterprise+",
    action: "More info",
    actionId: "Info selengkapnya",
    icon: "add-ons",
    route: "/settings/billing"
  },
  {
    id: "data-migration",
    label: "Only a few clicks away to migrate your company data to Jurnal!",
    labelId: "Cukup beberapa klik untuk migrasi data perusahaan Anda ke Jurnal!",
    action: "Start migration",
    actionId: "Mulai migrasi",
    icon: "migrate",
    route: "/applications"
  },
  {
    id: "closing-book",
    label: "Get your company financial report precisely by closing the book",
    labelId: "Pastikan pelaporan keuangan perusahaan Anda sudah akurat dengan tutup buku",
    action: "Start closing book",
    actionId: "Mulai tutup buku",
    icon: "reports",
    route: "/reports"
  },
  {
    id: "referral-program",
    label: "Get the chance to reward up to 3 million IDR in referral program now!",
    labelId: "Raih kesempatan untuk reward hingga Rp3 juta di program referral sekarang!",
    action: "Join referral program",
    actionId: "Ikuti program referral",
    icon: "gift",
    route: "/applications"
  }
];

/**
 * Premium-feature teasers. Production opens a paywall modal per card; the
 * prototype has no billing state, so a card opens the marketplace instead.
 */
export const HOME_ADD_ONS: HomeAddOn[] = [
  {
    id: "advance-invoicing",
    label: "Advanced invoicing",
    labelId: "Advanced invoicing",
    icon: "doc",
    description: "Pro forma and join invoicing creation.",
    descriptionId: "Pembuatan faktur pro forma dan tukar faktur."
  },
  {
    id: "approval",
    label: "Approval",
    labelId: "Approval",
    icon: "approval-rules",
    description: "Transaction and warehouse activity approval.",
    descriptionId: "Persetujuan transaksi dan aktivitas gudang."
  },
  {
    id: "multiproduct-pricing",
    label: "Multiproduct pricing",
    labelId: "Multiproduct pricing",
    icon: "products",
    description: "Automatic price rule implementation.",
    descriptionId: "Penerapan aturan harga secara otomatis."
  },
  {
    id: "profitability-report",
    label: "Profitability report",
    labelId: "Profitability report",
    icon: "reports",
    description: "Sales performance report for each product.",
    descriptionId: "Laporan performa penjualan setiap produk."
  }
];

export const HOME_TRAININGS: HomeTraining[] = [
  {
    id: "initial-setup",
    label: "Initial setup & database migration",
    labelId: "Initial setup & database migration",
    icon: "migrate",
    day: "First Tuesday of every month",
    dayId: "Selasa pertama setiap bulan",
    time: "14:00 - 17:00 WIB",
    place: "Online",
    placeId: "Online",
    url: `${MEETING_URL}?uId=2062730000001607079`
  },
  {
    id: "bookkeeping-and-reporting",
    label: "Bookkeeping & reporting",
    labelId: "Bookkeeping & reporting",
    icon: "loan",
    day: "Second Tuesday of every month",
    dayId: "Selasa kedua setiap bulan",
    time: "14:00 - 17:00 WIB",
    place: "Online",
    placeId: "Online",
    url: `${MEETING_URL}?uId=2062730000001231135`
  }
];

/**
 * Mekari product cross-sell. Production renders each product's PNG wordmark;
 * Pixel 3 ships a brand icon for every one of them, so the icon carries the
 * brand and the name sits beside it as text.
 */
export const HOME_APPS: HomeApp[] = [
  {
    id: "mekari-pay",
    name: "Mekari Pay",
    icon: "pay-brand",
    label: "Receive payments faster",
    labelId: "Terima pembayaran lebih cepat",
    route: "/mekari-pay"
  },
  {
    id: "mekari-capital",
    name: "Mekari Capital",
    icon: "capital-brand",
    label: "Apply trusted business financing",
    labelId: "Ajukan pembiayaan bisnis terpercaya",
    externalUrl: "https://mekari.com/produk/capital/"
  },
  {
    id: "mekari-klikpajak",
    name: "Mekari Klikpajak",
    icon: "klikpajak-brand",
    label: "Manage tax easier",
    labelId: "Kelola perpajakan lebih mudah",
    externalUrl: "https://klikpajak.id/"
  },
  {
    id: "mekari-talenta",
    name: "Mekari Talenta",
    icon: "talenta-brand",
    label: "Manage payroll and HR efficiently",
    labelId: "Kelola payroll dan SDM lebih efisien",
    externalUrl: "https://www.talenta.co/"
  },
  {
    id: "mekari-qontak",
    name: "Mekari Qontak",
    icon: "qontak-brand",
    label: "Manage omnichannel CRM",
    labelId: "Kelola omnichannel CRM",
    externalUrl: "https://qontak.com/"
  },
  {
    id: "mekari-expense",
    name: "Mekari Expense",
    icon: "expense-brand",
    label: "Manage company costs efficiently",
    labelId: "Kelola pengeluaran dengan lebih rapi",
    externalUrl: "https://mekari.com/produk/expense/"
  },
  {
    id: "mekari-flex",
    name: "Mekari Flex",
    icon: "flex-brand",
    label: "Manage employee benefits",
    labelId: "Kelola benefit karyawan",
    externalUrl: "https://mekari.com/produk/flex/"
  },
  {
    id: "mekari-esign",
    name: "Mekari eSign",
    icon: "sign-brand",
    label: "Automate document validation",
    labelId: "Otomatiskan pengesahan dokumen",
    externalUrl: "https://mekarisign.com/"
  }
];

/** Split a list into fixed-size chunks — one carousel slide per chunk. */
export function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}
