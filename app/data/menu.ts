import type { IconName } from "@mekari/pixel3";

export interface AppMenuChild {
  id: string;
  label: string;
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
  icon: IconName;
  route: string;
  badge?: boolean;
  /** Trailing chevron — used by items that link outward (Applications). */
  isExternal?: boolean;
  submenu?: {
    title: string;
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
 * Icon names map to Pixel 3 v1.0.12 — verify any new icon with the Pixel
 * MCP `get-icon-name` skill before adding.
 */
export const APP_MENU_GROUPS: AppMenuGroup[] = [
  [
    { id: "home", label: "Home", icon: "home", route: "/" },
    { id: "dashboard", label: "Dashboard", icon: "dashboard", route: "/dashboard" },
    { id: "reports", label: "Reports", icon: "reports", route: "/reports" },
    { id: "budget", label: "Budget", icon: "finance", route: "/budget" }
  ],
  [
    { id: "cash-bank", label: "Cash & bank", icon: "bank", route: "/cash-bank" },
    { id: "sales", label: "Sales", icon: "sales", route: "/sales" },
    { id: "purchase", label: "Purchase", icon: "cart", route: "/purchase" },
    { id: "expenses", label: "Expenses", icon: "expenses", route: "/expenses" },
    { id: "job-order", label: "Job order", icon: "table-view-list", route: "/job-order" },
    { id: "mekari-pay", label: "Mekari Pay", icon: "mekari_pay", route: "/mekari-pay" }
  ],
  [
    { id: "contacts", label: "Contacts", icon: "contact", route: "/contacts" },
    { id: "products", label: "Products", icon: "products", route: "/products" },
    { id: "production", label: "Production", icon: "fulfillment", route: "/production" },
    {
      id: "fulfillment",
      label: "Fulfillment",
      icon: "truck",
      route: "/fulfillment",
      submenu: {
        title: "Fulfillment",
        items: [
          { id: "sales", label: "Sales", route: "/fulfillment/sales", count: 4 },
          { id: "purchases", label: "Purchases", route: "/fulfillment/purchases", count: 2 }
        ]
      }
    },
    { id: "assets", label: "Assets", icon: "assets", route: "/assets" },
    {
      id: "chart-of-accounts",
      label: "Chart of accounts",
      icon: "chart-of-account",
      route: "/chart-of-accounts"
    }
  ],
  [
    {
      id: "applications",
      label: "Applications",
      icon: "application",
      route: "/applications",
      isExternal: true
    }
  ],
  [
    { id: "other-lists", label: "Other lists", icon: "doc", route: "/other-lists" },
    { id: "integrations", label: "Integrations", icon: "add-ons", route: "/integrations" },
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      route: "/settings",
      submenu: {
        title: "Settings",
        items: [
          { id: "company", label: "Company", route: "/settings/company" },
          { id: "users", label: "User settings", route: "/settings/users" },
          {
            id: "sales",
            label: "Sales",
            route: "/settings/sales",
            children: [
              { id: "format", label: "Format settings", route: "/settings/sales/format" },
              { id: "reminder", label: "Invoice reminder", route: "/settings/sales/reminder" }
            ]
          },
          { id: "purchases", label: "Purchases", route: "/settings/purchases" },
          {
            id: "products",
            label: "Products",
            route: "/settings/products",
            children: [
              { id: "goods", label: "Goods & services", route: "/settings/products/goods" },
              { id: "warehouse", label: "Warehouse", route: "/settings/products/warehouse" }
            ]
          },
          { id: "production", label: "Production", route: "/settings/production" },
          {
            id: "templates",
            label: "Templates",
            route: "/settings/templates",
            children: [
              { id: "section-email", label: "EMAIL TEMPLATES", route: "", isSection: true },
              {
                id: "invoice-email",
                label: "Sales invoice",
                route: "/settings/templates/invoice-email"
              },
              { id: "quote-email", label: "Sales quote", route: "/settings/templates/quote-email" },
              { id: "order-email", label: "Sales order", route: "/settings/templates/order-email" },
              { id: "section-pdf", label: "PDF TEMPLATES", route: "", isSection: true },
              {
                id: "pdf-general",
                label: "General settings",
                route: "/settings/templates/pdf-general"
              },
              { id: "pdf-customize", label: "Customize PDF", route: "/settings/templates/pdf" },
              { id: "section-wa", label: "WHATSAPP", route: "", isSection: true },
              {
                id: "wa-sales",
                label: "Sales message template",
                route: "/settings/templates/wa-sales"
              },
              {
                id: "wa-order",
                label: "Order message template",
                route: "/settings/templates/wa-order"
              }
            ]
          },
          { id: "custom-fields", label: "Custom fields", route: "/settings/custom-fields" },
          { id: "account-mapping", label: "Account mapping", route: "/settings/account-mapping" },
          { id: "billing", label: "Billing", route: "/settings/billing" },
          { id: "approval-rules", label: "Approval rules", route: "/settings/approval-rules" },
          { id: "tagging-rules", label: "Tagging rules", route: "/settings/tagging-rules" }
        ]
      }
    }
  ]
];

export const APP_MENU_ITEMS: AppMenuItem[] = APP_MENU_GROUPS.flat();
