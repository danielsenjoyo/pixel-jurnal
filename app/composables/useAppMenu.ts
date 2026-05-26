import { computed } from "vue";
import { useRoute } from "vue-router";
import { APP_MENU_GROUPS, APP_MENU_ITEMS, type AppMenuChild, type AppMenuItem } from "~/data/menu";

function isRouteActive(currentPath: string, itemRoute: string) {
  return itemRoute === "/"
    ? currentPath === "/"
    : currentPath === itemRoute || currentPath.startsWith(`${itemRoute}/`);
}

function getFirstChildRoute(item: AppMenuItem | AppMenuChild): string {
  if ("submenu" in item && item.submenu?.items[0]) {
    return getFirstChildRoute(item.submenu.items[0]);
  }
  if ("children" in item && (item as AppMenuChild & { children?: AppMenuChild[] }).children?.[0]) {
    return getFirstChildRoute((item as AppMenuChild & { children: AppMenuChild[] }).children[0]);
  }
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
    if (activeChildMenu.value) return activeChildMenu.value.label;
    return activeTopMenu.value?.label ?? "";
  });

  return {
    menuGroups: APP_MENU_GROUPS,
    menuItems: APP_MENU_ITEMS,
    activeTopMenu,
    activeSubmenu,
    activeChildMenu,
    activePageTitle,
    getFirstChildRoute,
    isRouteActive: (itemRoute: string) => isRouteActive(route.path, itemRoute)
  };
}
