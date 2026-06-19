import type { IconName } from "@mekari/pixel3";

export interface AppMenuChild {
  id: string;
  label: string;
  /** Indonesian label — used when the app locale is `id`. Falls back to `label`. */
  labelId?: string;
  route: string;
  count?: string | number;
  newTab?: boolean;
  /** Render as an uppercase section header inside an accordion instead of a clickable row. */
  isSection?: boolean;
  /** Nested children — drives the accordion variant in `SidebarChildItems`. */
  children?: AppMenuChild[];
}

export interface AppMenuItem {
  id: string;
  label: string;
  /** Indonesian label — used when the app locale is `id`. Falls back to `label`. */
  labelId?: string;
  icon: IconName;
  route: string;
  badge?: boolean;
  /** Trailing chevron — used by items that link outward (Applications). */
  isExternal?: boolean;
  submenu?: {
    title: string;
    /** Indonesian submenu title. Falls back to `title`. */
    titleId?: string;
    items: AppMenuChild[];
  };
}

export type AppMenuGroup = AppMenuItem[];

/**
 * Sidebar source of truth (Mekari Jurnal Master Pages, Figma node 1:17750).
 *
 * Groups render with a divider between them. Only **Fulfillment** and
 * **Settings** carry submenus in this prototype — every other item links
 * to a single route. Settings demonstrates the nested-accordion pattern;
 * Fulfillment is a flat submenu.
 *
 * `label` is English (the default locale). `labelId` carries the Indonesian
 * string — only present where it actually differs (terms kept in English
 * across both locales, e.g. "Mekari Pay", "Custom fields", omit `labelId`).
 *
 * Icon names map to Pixel 3 v1.0.12 — verify any new icon with the Pixel
 * MCP `get-icon-name` skill before adding.
 */
export const APP_MENU_GROUPS: AppMenuGroup[] = [
  [
    { id: "home", label: "Home", labelId: "Beranda", icon: "home", route: "/" },
    { id: "dashboard", label: "Dashboard", icon: "dashboard", route: "/dashboard" },
    { id: "reports", label: "Reports", labelId: "Laporan", icon: "reports", route: "/reports" },
    { id: "budget", label: "Budget", labelId: "Anggaran", icon: "finance", route: "/budget" }
  ],
  [
    { id: "cash-bank", label: "Cash & bank", labelId: "Kas & bank", icon: "bank", route: "/cash-bank" },
    { id: "sales", label: "Sales", labelId: "Penjualan", icon: "sales", route: "/sales" },
    { id: "purchase", label: "Purchases", labelId: "Pembelian", icon: "cart", route: "/purchase" },
    { id: "expenses", label: "Expenses", labelId: "Biaya", icon: "expenses", route: "/expenses" },
    { id: "job-order", label: "Job orders", labelId: "Job order", icon: "table-view-list", route: "/job-order" },
    { id: "mekari-pay", label: "Mekari Pay", icon: "mekari_pay", route: "/mekari-pay" }
  ],
  [
    { id: "contacts", label: "Contacts", labelId: "Kontak", icon: "contact", route: "/contacts" },
    { id: "products", label: "Products", labelId: "Produk", icon: "products", route: "/products" },
    { id: "production", label: "Production", labelId: "Produksi", icon: "fulfillment", route: "/production" },
    {
      id: "fulfillment",
      label: "Fulfillment",
      labelId: "Pemenuhan",
      icon: "truck",
      route: "/fulfillment",
      submenu: {
        title: "Fulfillment",
        titleId: "Pemenuhan",
        items: [
          { id: "sales", label: "Sales", labelId: "Penjualan", route: "/fulfillment/sales", count: 4 },
          { id: "purchases", label: "Purchases", labelId: "Pembelian", route: "/fulfillment/purchases", count: 2 }
        ]
      }
    },
    { id: "assets", label: "Assets", labelId: "Aset", icon: "assets", route: "/assets" },
    {
      id: "chart-of-accounts",
      label: "Chart of accounts",
      labelId: "Daftar akun",
      icon: "chart-of-account",
      route: "/chart-of-accounts"
    }
  ],
  [
    {
      id: "applications",
      label: "Applications",
      labelId: "Aplikasi",
      icon: "application",
      route: "/applications",
      isExternal: true
    }
  ],
  [
    { id: "other-lists", label: "Other lists", labelId: "Daftar lainnya", icon: "doc", route: "/other-lists" },
    { id: "integrations", label: "Integrations", labelId: "Integrasi", icon: "add-ons", route: "/integrations" },
    {
      id: "settings",
      label: "Settings",
      labelId: "Pengaturan",
      icon: "settings",
      route: "/settings",
      submenu: {
        title: "Settings",
        titleId: "Pengaturan",
        items: [
          { id: "company", label: "Company", labelId: "Perusahaan", route: "/settings/company" },
          { id: "users", label: "User settings", labelId: "Pengaturan pengguna", route: "/settings/users" },
          {
            id: "sales",
            label: "Sales",
            labelId: "Penjualan",
            route: "/settings/sales",
            children: [
              { id: "format", label: "Format settings", labelId: "Format pengaturan", route: "/settings/sales/format" },
              { id: "reminder", label: "Invoice reminder", labelId: "Pengingat faktur", route: "/settings/sales/reminder" }
            ]
          },
          { id: "purchases", label: "Purchases", labelId: "Pembelian", route: "/settings/purchases" },
          {
            id: "products",
            label: "Products",
            labelId: "Produk",
            route: "/settings/products",
            children: [
              { id: "goods", label: "Goods & services", labelId: "Barang & jasa", route: "/settings/products/goods" },
              { id: "warehouse", label: "Warehouse", labelId: "Gudang", route: "/settings/products/warehouse" }
            ]
          },
          { id: "production", label: "Production", labelId: "Produksi", route: "/settings/production" },
          {
            id: "templates",
            label: "Templates",
            labelId: "Template",
            route: "/settings/templates",
            children: [
              { id: "section-email", label: "EMAIL TEMPLATES", labelId: "TEMPLATE EMAIL", route: "", isSection: true },
              {
                id: "invoice-email",
                label: "Sales invoice",
                labelId: "Faktur penjualan",
                route: "/settings/templates/invoice-email"
              },
              { id: "quote-email", label: "Sales quote", labelId: "Penawaran penjualan", route: "/settings/templates/quote-email" },
              { id: "order-email", label: "Sales order", labelId: "Pemesanan penjualan", route: "/settings/templates/order-email" },
              { id: "section-pdf", label: "PDF TEMPLATES", labelId: "PDF TEMPLATE", route: "", isSection: true },
              {
                id: "pdf-general",
                label: "General settings",
                labelId: "Pengaturan umum",
                route: "/settings/templates/pdf-general"
              },
              { id: "pdf-customize", label: "Customize PDF", labelId: "Atur PDF", route: "/settings/templates/pdf" },
              { id: "section-wa", label: "WHATSAPP", route: "", isSection: true },
              {
                id: "wa-sales",
                label: "Sales message template",
                labelId: "Pesan template penjualan",
                route: "/settings/templates/wa-sales"
              },
              {
                id: "wa-order",
                label: "Order message template",
                labelId: "Pesan template pemesanan",
                route: "/settings/templates/wa-order"
              }
            ]
          },
          { id: "custom-fields", label: "Custom fields", labelId: "Kolom khusus", route: "/settings/custom-fields" },
          { id: "account-mapping", label: "Account mapping", labelId: "Pemetaan akun", route: "/settings/account-mapping" },
          { id: "billing", label: "Billing", labelId: "Tagihan", route: "/settings/billing" },
          { id: "approval-rules", label: "Approval rules", labelId: "Aturan persetujuan", route: "/settings/approval-rules" },
          { id: "tagging-rules", label: "Tagging rules", labelId: "Aturan tagging", route: "/settings/tagging-rules" }
        ]
      }
    }
  ]
];

export const APP_MENU_ITEMS: AppMenuItem[] = APP_MENU_GROUPS.flat();
