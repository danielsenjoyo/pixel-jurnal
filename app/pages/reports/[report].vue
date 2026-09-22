<template>
  <DefaultPageContent
    :title="title"
    :subtitle="subtitle"
    breadcrumb="Reports"
    breadcrumb-to="/reports"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import DefaultPageContent from "~/components/template/DefaultPageContent.vue";
import { useLanguage } from "~/composables/useLanguage";
import { REPORTS_BY_SLUG } from "~/data/reports";

/**
 * Stub detail route for every card on the reports index — the same
 * "not built yet" placeholder the other unported pages use, but titled from
 * `data/reports.ts` so each link lands somewhere that names the report it
 * came from. Replace this file when the real report pages are ported.
 */
const route = useRoute();
const { tField } = useLanguage();

const report = computed(() => REPORTS_BY_SLUG[String(route.params.report)]);

if (!report.value) {
  throw createError({ statusCode: 404, statusMessage: "Report not found", fatal: true });
}

const title = computed(() => (report.value ? tField(report.value, "label") : ""));
const subtitle = computed(() => (report.value ? tField(report.value, "description") : ""));

useHead({ title: () => `${title.value} — Mekari Jurnal` });
</script>
