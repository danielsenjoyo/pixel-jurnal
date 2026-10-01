import { computed } from "vue";
import { useRoute } from "vue-router";
import { APP_MENU_GROUPS, APP_MENU_ITEMS, type AppMenuChild, type AppMenuItem } from "~/data/menu";
import { useLanguage } from "~/composables/useLanguage";

function isRouteActive(currentPath: string, itemRoute: string) {
  return itemRoute === "/"
    ? currentPath === "/"
    : currentPath === itemRoute || currentPath.startsWith(`${itemRoute}/`);
}

function getFirstChildRoute(item: AppMenuItem | AppMenuChild): string {
  // Bind each candidate before recursing rather than testing and re-indexing.
  // Under `noUncheckedIndexedAccess` a second `[0]` is `T | undefined` again
  // however the first one was guarded, so the re-index was the type error.
  const submenuFirst = "submenu" in item ? item.submenu?.items[0] : undefined;
  if (submenuFirst) return getFirstChildRoute(submenuFirst);

  const childFirst = (item as AppMenuChild & { children?: AppMenuChild[] }).children?.[0];
  if (childFirst) return getFirstChildRoute(childFirst);

  return item.route;
}

function findActiveChild(items: AppMenuChild[], currentPath: string): AppMenuChild | null {
  for (const item of items) {
    if (isRouteActive(currentPath, item.route)) return item;
  }
  return null;
}

export function useAppMenu() {
  const route = useRoute();
  const { locale } = useLanguage();

  /** Locale-aware label: Indonesian when locale is `id` and a `labelId`
   *  exists, English otherwise. Reading `locale.value` here makes any
   *  template/computed that calls it reactive to language changes. */
  function tLabel(item: { label: string; labelId?: string }): string {
    return locale.value === "id" && item.labelId ? item.labelId : item.label;
  }

  function tTitle(submenu: { title: string; titleId?: string }): string {
    return locale.value === "id" && submenu.titleId ? submenu.titleId : submenu.title;
  }

  const activeTopMenu = computed(
    () => APP_MENU_ITEMS.find((item) => isRouteActive(route.path, item.route)) ?? null
  );

  /** Non-null when the active top-menu owns a submenu (forces the rail
   *  into the "with child" / collapsed-with-panel state). */
  const activeSubmenu = computed(() => (activeTopMenu.value?.submenu ? activeTopMenu.value : null));

  const activeChildMenu = computed(() => {
    const items = activeSubmenu.value?.submenu?.items;
    if (!items) return null;
    return findActiveChild(items, route.path);
  });

  const activePageTitle = computed(() => {
    if (activeChildMenu.value) return tLabel(activeChildMenu.value);
    return activeTopMenu.value ? tLabel(activeTopMenu.value) : "";
  });

  return {
    menuGroups: APP_MENU_GROUPS,
    menuItems: APP_MENU_ITEMS,
    activeTopMenu,
    activeSubmenu,
    activeChildMenu,
    activePageTitle,
    getFirstChildRoute,
    isRouteActive: (itemRoute: string) => isRouteActive(route.path, itemRoute),
    tLabel,
    tTitle
  };
}
