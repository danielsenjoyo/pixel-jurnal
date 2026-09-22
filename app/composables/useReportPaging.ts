import { computed, ref, watch, type Ref } from "vue";

/**
 * The pagination footer's state, shared by every report page.
 *
 * Takes the *filtered* row set — the single source the table, the footer and
 * the blank slate all read (see `docs/patterns/index-page-format.md` § State
 * model) — and derives everything the footer needs from it.
 *
 * Extracted rather than copied into each report: five report pages carrying
 * their own copy of `pageCount` / `pagedRows` / the clamp watcher is how the
 * date helpers ended up in seven files (see `docs/patterns/page-recipes.md`
 * § "one format per value type").
 */
export function useReportPaging<T>(rows: Ref<readonly T[]>, defaultPerPage = 25) {
  const page = ref(1);
  const perPage = ref(defaultPerPage);

  const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / perPage.value)));
  const pagedRows = computed(() =>
    rows.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
  );
  const rangeStart = computed(() => (rows.value.length ? (page.value - 1) * perPage.value + 1 : 0));
  const rangeEnd = computed(() => Math.min(page.value * perPage.value, rows.value.length));
  const pageOptions = computed(() =>
    Array.from({ length: pageCount.value }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
  );

  function setPerPage(value: number) {
    perPage.value = value;
    page.value = 1;
  }

  /** `MpAutocomplete @change` hands back the option object, not its value. */
  function onJumpPage(option: { value?: number } | number) {
    const value = typeof option === "number" ? option : option?.value;
    if (value) page.value = value;
  }

  function reset() {
    page.value = 1;
  }

  // Keep `page` inside [1, pageCount] as the row set changes underneath it —
  // narrowing a filter while on page 9 must not leave an empty table.
  watch([page, pageCount], () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
    if (page.value < 1) page.value = 1;
  });

  return {
    page,
    perPage,
    pageCount,
    pagedRows,
    rangeStart,
    rangeEnd,
    pageOptions,
    setPerPage,
    onJumpPage,
    reset
  };
}
