# Advanced Filter (staged draft/applied drawer)

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`app/pages/sales.vue`](../../app/pages/sales.vue) + [`SalesAdvancedFilterDrawer.vue`](../../app/components/sales/SalesAdvancedFilterDrawer.vue).
> See also [`Drawer`](./Drawer.md) (the simpler "live filter" drawer this pattern departs from), [`FilterBar`](./FilterBar.md), [`Pagination`](./Pagination.md), [`BlankSlate`](./BlankSlate.md).

## Purpose

A right-side filter drawer for when the plain [`Drawer`](./Drawer.md) pattern's
"live filter, Apply just closes" model isn't enough — many fields, per-field
validation, and edits that must be discardable. Built for the Sales index's
multi-tab, multi-field filter (7 keyword scopes, two date ranges, two amount
ranges with operators, two multi-selects with chips), but the state model
applies to any drawer that needs real Reset/Cancel/Apply semantics.

## When to use this over `Drawer.md`

Reach for this pattern when any of these are true — otherwise the plain live
drawer is simpler and correct:

- The drawer has **4 or more fields**.
- Any field needs **validation before it should affect results** (e.g. a date
  range where end must be ≥ start).
- **Cancel must discard in-progress edits** and restore the last applied state,
  rather than everything being live as you type.

## The state model: draft vs. applied

Unlike `Drawer.md`'s single shared-ref model, this pattern keeps **two copies**
of the filter shape per filterable scope (per Sales tab, in the reference impl):

- **`applied`** — the filter currently affecting the table. Toolbar quick
  controls (status select, search box) bind directly to `applied` fields —
  they stay "live," same as `FilterBar.md`.
- **`draft`** — a working copy, edited only while the drawer is open. Never
  read by the table.

| Action                                           | Effect                                                                                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open** (Filter button)                         | `draft = clone(applied)` — the drawer always starts from whatever is currently in effect (including anything set from the toolbar).                                                                           |
| **Reset**                                        | `draft = empty()`. Drawer **stays open**.                                                                                                                                                                     |
| **Cancel**, the **×**, overlay click, **Escape** | `draft = clone(applied)` (discarded), drawer closes. All four map to the same handler.                                                                                                                        |
| **Apply**                                        | Validate `draft`. If invalid, set field-level errors and **do nothing else** (drawer stays open, `applied` and the table are untouched). If valid: `applied = clone(draft)`, drawer closes, page resets to 1. |

Cloning (not a plain shallow copy) matters for any array-valued field — see
Gotchas below.

```ts
// app/utils/salesFilter.ts
export function createEmptySalesFilterState(): SalesFilterState {
  /* one field-default per key */
}
export function cloneSalesFilterState(f: SalesFilterState): SalesFilterState {
  return { ...f, warehouses: [...f.warehouses], tags: [...f.tags] };
}
```

```ts
// app/pages/sales.vue
function openFilterDrawer() {
  const s = activeState.value;
  Object.assign(s.draft, cloneSalesFilterState(s.applied));
  s.dateErrors.tx = "";
  s.dateErrors.due = "";
  s.isFilterDrawerOpen = true;
}
function discardDraft() {
  // bound to @cancel — covers Cancel, ×, overlay, Escape
  const s = activeState.value;
  Object.assign(s.draft, cloneSalesFilterState(s.applied));
  s.isFilterDrawerOpen = false;
}
function resetDraft() {
  // bound to @reset
  Object.assign(activeState.value.draft, createEmptySalesFilterState());
}
function applyDraft() {
  // bound to @apply
  const s = activeState.value;
  const txOk = isValidDateRange(s.draft.txFrom, s.draft.txTo);
  s.dateErrors.tx = txOk ? "" : "End date must be on or after the start date.";
  if (!txOk) return; // blocks Apply, leaves applied + results untouched
  Object.assign(s.applied, cloneSalesFilterState(s.draft));
  s.isFilterDrawerOpen = false;
  s.page = 1;
}
```

## One drawer, config-gated fields

Don't build a generic dynamic-field/schema renderer for this. With a small,
fixed set of field _kinds_, one drawer template with `v-if`s driven by a plain
config object reads far more clearly than a `fields: FieldDef[]` + `<component
:is>` dispatch layer — see `app/data/sales.ts`'s `TabConfig` (`dueDate`,
`warehouse` flags) and how `SalesAdvancedFilterDrawer.vue` gates the Due date
and Warehouse fields on them. This keeps 4 near-identical drawers (one per
Sales tab) as **one** component instance reused with different config/state,
not 4 hand-copied drawers.

Two field kinds _are_ worth their own small component, because their markup
is genuinely non-trivial and repeated **twice within the same drawer**:

- `AmountRangeField.vue` — three operator radios (More than / In between /
  Less than) sharing one `v-model:mode`, plus 1–2 sanitized numeric inputs.
  Used for Balance due and Total.
- `TagMultiSelectField.vue` — searchable multi-select with chips, wrapping
  `MpInputTag`. Used for Additional tag (with an All/Either mode toggle) and
  Warehouse (OR-only, no toggle).

Everything else (Keyword+Column, the two date ranges, Status) is inline in the
drawer — extracting a 2-field wrapper for symmetry alone isn't worth it.

## Business-rule logic lives in one place

Keyword matching, amount-range predicates, tag AND/OR, date-range validation,
and active-criteria counting are pulled into plain functions
(`app/utils/salesFilter.ts`) — not duplicated per tab, and not wrapped in a
composable/factory either (there's exactly one filter shape here; a generic
`useAdvancedFilter<T>()` would be solving a genericity problem that doesn't
exist yet). If a rule changes, it changes once in that file, not in N drawer
copies.

## `MpDrawer` gotcha: it doesn't close itself from a prop change

**`@mekari/pixel3-drawer@0.0.26`'s internal open state is captured once at
mount (`const isModalOpen = ref(props.isOpen)`) and is never re-synced when
the prop changes afterward.** Its own X/overlay/Escape triggers only `emit
"close"` — they don't flip the component's own visual state either; nothing in
the installed version ever sets it back to closed. Concretely: setting
`:is-open="false"` from the app (whether from Apply, Cancel, or in response to
`@close`) is silently ignored, and the drawer stays visually open. This
reproduces in the plain `Drawer.md` pattern too (`templates/index-template.vue`'s
filter drawer's Apply button has the same latent bug) — it's a library issue,
not specific to this pattern.

**Workaround:** gate mounting with `v-if` at the call site instead of relying
on `MpDrawer`'s own `:is-open` toggling to close:

```vue
<MpDrawer v-if="props.isOpen" :is-open="true" placement="right" size="sm" @close="emit('cancel')">
  ...
</MpDrawer>
```

Unmounting via `v-if` is instant (no slide-out animation on close — an
accepted trade-off for actually closing), and a fresh mount with `is-open`
already `true` opens correctly since that only needs the _initial_ value to be
right.

## Gotchas

- **Clone, don't shallow-copy, array fields.** `Object.assign(s.applied,
s.draft)` would leave `applied.tags`/`applied.warehouses` pointing at the
  _same array_ as `draft`'s — mutating one after the fact silently mutates the
  other, breaking the whole point of draft/applied independence. Always clone
  through a helper like `cloneSalesFilterState`.
- **Toolbar quick controls stay live**, same as `FilterBar.md` — they write
  straight to `applied`, never through `draft`. This is what makes "the
  toolbar reflects anything applied from the drawer, and vice versa" fall out
  for free: opening the drawer always re-clones from whatever `applied`
  currently holds.
- **Page-reset on any filter change**, not just drawer Apply — a `deep` watch
  on `applied` covers both the toolbar's live edits and Apply committing a new
  draft. See [`Pagination`](./Pagination.md)'s broadened reset rule.
- **Zero-match empty state gets a CTA** — a deliberate, scoped exception to
  [`BlankSlate.md`](./BlankSlate.md)'s "no CTA" rule; see that file's 4th case.
