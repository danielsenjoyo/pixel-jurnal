<template>
  <DefaultPageContent>
    <!-- Page-level tabs: one per report category, flush against the stage
         (see docs/patterns/Tabs.md). Production renders the same bar in the
         page header, above the report grid. -->
    <template #tabs>
      <div ref="tabsRef" :class="tabsScrollClass">
        <MpTabs v-model="activeTab" variant-color="blue" is-manual>
          <MpTabList>
            <MpTab v-for="tab in tabs" :key="tab.id">{{ tField(tab, "label") }}</MpTab>
          </MpTabList>
        </MpTabs>
      </div>
    </template>

    <div :class="gridClass">
      <ReportCard v-for="report in activeReports" :key="report.slug" :report="report" />
    </div>
  </DefaultPageContent>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { MpTab, MpTabList, MpTabs, css } from "@mekari/pixel3";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import ReportCard from "~/components/reports/ReportCard.vue";
import { useLanguage } from "~/composables/useLanguage";
import { REPORT_TABS as tabs } from "~/data/reports";

useHead({ title: "Reports — Mekari Jurnal" });

const { tField } = useLanguage();
const route = useRoute();
const router = useRouter();

/**
 * Production mirrors the open tab into `?tab=<name>` so a report category is
 * linkable and survives a reload. Same here — the query carries the tab id
 * (`business_overview`), not its index.
 */
const initialTab = tabs.findIndex((tab) => tab.id === route.query.tab);
const activeTab = ref(initialTab === -1 ? 0 : initialTab);

const tabsRef = ref<HTMLElement | null>(null);

/**
 * Keep the open tab visible. The bar scrolls sideways on a narrow viewport, so
 * a deep link to a right-hand category (`?tab=tax`) would otherwise land with
 * its own tab off-screen. Production solves this with a pair of chevron
 * buttons overlaid on the bar; scrolling the selected tab into view does the
 * same job without the extra chrome.
 */
async function revealActiveTab() {
  await nextTick();
  const list = tabsRef.value?.querySelector(".mp-tab-list__list");
  list?.children[activeTab.value]?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

// The initial reveal has to wait for mount — the watch below fires during
// setup, while `tabsRef` is still null.
onMounted(revealActiveTab);

watch(
  activeTab,
  (index) => {
    router.replace({ query: { ...route.query, tab: tabs[index]?.id } });
    revealActiveTab();
  },
  { immediate: true }
);

const activeReports = computed(() => tabs[activeTab.value]?.reports ?? []);

// The categories overflow the band on a laptop; let the list scroll sideways
// rather than wrap onto a second row and detach from the stage edge.
//
// A tab label is always one line: the two-word categories ("Business
// overview", "Foreign exchange") otherwise wrap inside their own tab, which
// makes the whole bar twice as tall and mis-aligns every single-word label
// against it. `nowrap` + `flexShrink: 0` keeps each tab at its natural width
// and pushes the overflow into the horizontal scroll above.
const tabsScrollClass = css({
  "& .mp-tab-list__list": { overflowX: "auto", scrollbarWidth: "none" },
  "& .mp-tab-list__list::-webkit-scrollbar": { display: "none" },
  "& .mp-tab": { whiteSpace: "nowrap", flexShrink: 0 }
});

const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  columnGap: 12,
  rowGap: 8,
  "@media (max-width: 1024px)": { gridTemplateColumns: "minmax(0, 1fr)" }
});
</script>
