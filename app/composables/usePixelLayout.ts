import { ref, readonly, onBeforeMount, onMounted } from "vue";
import { NAVBAR_HEIGHT, SIDEBAR_EXPANDED_WIDTH } from "~/data/constants";

/**
 * Shell-layout state singleton.
 *
 * `@mekari/pixel3` ships only `usePixelTheme()` — the layout state
 * (sidebar/navbar refs, collapse flags, account chip) is owned by the
 * application. This file mirrors Qontak's prototype usePixelLayout so
 * navbar/sidebar/template components have a single coordination point.
 *
 * State lives at module scope (SPA mode — `ssr: false`) so every caller
 * shares the same refs.
 */

interface AccountInformation {
  userPhoto: string;
  fullName: string;
  companyName: string;
  companyId: string;
}

// — Account chip —
const accountInformation = ref<AccountInformation>({
  userPhoto: "https://i.pravatar.cc/64?img=12",
  fullName: "Rizal Candra",
  companyId: "102938",
  companyName: "PT Central Perk Indonesia"
});

function setAccountInformation(payload: AccountInformation) {
  accountInformation.value = payload;
}

// — Sidebar (main rail) —
const isSidebarCollapsed = ref(false);
const isSidebarHovered = ref(false);
const isSidebarLoading = ref(false);
const sidebarNode = ref<HTMLElement | null>(null);

function handleSidebarHover(value: boolean) {
  // Hover-expand only matters while the rail is collapsed.
  if (!isSidebarCollapsed.value) return;
  isSidebarHovered.value = value;
}

const useSidebar = {
  calculateCssVar: () => {
    if (import.meta.client) {
      document.documentElement.style.setProperty(
        "--pixel-sidebar-width",
        `${(sidebarNode.value as HTMLElement | null)?.clientWidth || 0}px`
      );
    }
  },
  setCollapse: (value: boolean) => {
    isSidebarCollapsed.value = value;
  },
  toggle: () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    if (import.meta.client) {
      document.documentElement.style.setProperty(
        "--pixel-sidebar-width",
        `${isSidebarCollapsed.value ? 60 : SIDEBAR_EXPANDED_WIDTH}px`
      );
    }
  },
  setLoading: (value: boolean) => {
    isSidebarLoading.value = value;
  }
};

// — Sidebar child (submenu panel) —
const isSidebarChildCollapsed = ref(false);
const sidebarChildNode = ref<HTMLElement | null>(null);

const useSidebarChild = {
  toggle: () => {
    isSidebarChildCollapsed.value = !isSidebarChildCollapsed.value;
  }
};

// — Navbar —
const isNavbarLoading = ref(false);
const navbarNode = ref<HTMLElement | null>(null);

const useNavbar = {
  setLoading: (value: boolean) => {
    isNavbarLoading.value = value;
  },
  calculateCssVar: () => {
    if (import.meta.client) {
      document.documentElement.style.setProperty(
        "--pixel-navbar-height",
        `${(navbarNode.value as HTMLElement | null)?.clientHeight || NAVBAR_HEIGHT}px`
      );
    }
  }
};

// — Keyboard shortcuts — Shift+X toggles main rail, Shift+C toggles child.
function handleKeydown(e: KeyboardEvent) {
  const body = document.getElementsByTagName("body")[0];
  if (e.shiftKey && e.keyCode === 88 && e.target === body) useSidebar.toggle();
  if (e.shiftKey && e.keyCode === 67 && e.target === body) useSidebarChild.toggle();
}

let listenersAttached = false;

const pixelContentAttrs = {
  style: {
    paddingTop: "var(--pixel-navbar-height)",
    minHeight: "100svh",
    width: "100%"
  }
};

export function usePixelLayout() {
  onBeforeMount(() => {
    if (!listenersAttached && import.meta.client) {
      listenersAttached = true;
      window.addEventListener("keydown", handleKeydown);
    }
  });

  onMounted(() => {
    useSidebar.calculateCssVar();
    useNavbar.calculateCssVar();
  });

  return {
    /** Account */
    accountInformation: readonly(accountInformation),
    setAccountInformation,

    /** Sidebar */
    useSidebar,
    sidebarNode,
    isSidebarLoading,
    isSidebarHovered,
    isSidebarCollapsed,
    handleSidebarHover,

    /** Sidebar child */
    isSidebarChildCollapsed,
    sidebarChildNode,
    useSidebarChild,

    /** Navbar */
    navbarNode,
    isNavbarLoading,
    useNavbar,

    /** Content */
    pixelContentAttrs
  };
}
