import { ref, readonly } from "vue";

/**
 * App language singleton.
 *
 * SPA mode (`ssr: false`) so module-scope state is shared by every caller —
 * the same pattern as `usePixelLayout`. The selected locale persists to
 * localStorage and drives both the navbar user-popover chrome (via `t()`)
 * and the sidebar menu / page titles (via `tLabel`/`tTitle` in useAppMenu).
 *
 * Default locale is English.
 */

export type AppLocale = "en" | "id";

interface LocaleOption {
  code: AppLocale;
  /** Endonym — a language name is shown in its own language, never translated. */
  name: string;
}

const STORAGE_KEY = "jurnal:locale";

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", name: "English" },
  { code: "id", name: "Indonesia" }
];

type Messages = Record<string, string>;

/** Chrome strings for the user popover. Menu labels live in `menu.ts`. */
const MESSAGES: Record<AppLocale, Messages> = {
  en: {
    personalInfo: "Personal info",
    supportCenter: "Support center",
    companies: "Companies on Jurnal",
    companyId: "Company ID",
    viewAllCompanies: "See all companies",
    apiCredentials: "API credentials",
    changeLanguage: "Change language",
    signOut: "Sign out",
    privacyPolicy: "Privacy policy",
    termsOfService: "Terms of service",
    aboutMekari: "About Mekari Account"
  },
  id: {
    personalInfo: "Info pribadi",
    supportCenter: "Support center",
    companies: "Daftar perusahaan di Jurnal",
    companyId: "ID perusahaan",
    viewAllCompanies: "Lihat daftar perusahaan",
    apiCredentials: "API credentials",
    changeLanguage: "Ganti bahasa",
    signOut: "Sign out",
    privacyPolicy: "Kebijakan privasi",
    termsOfService: "Persyaratan layanan",
    aboutMekari: "Tentang Akun Mekari"
  }
};

// Module-scoped singleton — every component shares this one locale.
const locale = ref<AppLocale>("en");

// Hydrate from a previous session (client only).
if (import.meta.client) {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "id") locale.value = saved;
}

function setLocale(next: AppLocale) {
  locale.value = next;
  if (import.meta.client) window.localStorage.setItem(STORAGE_KEY, next);
}

/**
 * Translate a chrome key. Reads `locale.value` at call time, so invoking
 * `t()` inside a template or computed makes that render reactive to locale.
 */
function t(key: string): string {
  return MESSAGES[locale.value][key] ?? MESSAGES.en[key] ?? key;
}

function localeName(code: AppLocale): string {
  return LOCALE_OPTIONS.find((option) => option.code === code)?.name ?? code;
}

export function useLanguage() {
  return {
    locale: readonly(locale),
    setLocale,
    t,
    localeName,
    localeOptions: LOCALE_OPTIONS
  };
}
