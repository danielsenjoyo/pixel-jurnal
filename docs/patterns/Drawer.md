# Drawer

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (filter drawer).
> See also [`FilterBar`](./FilterBar.md), [`Form`](./Form.md), [`Modal`](./Modal.md).

## Purpose

A right-side panel for the full filter set (or any secondary form that shouldn't
take over the whole screen). Composed from the `MpDrawer` parts.

## When to use

- **Filters** that don't fit the one-line filter bar (the canonical use here).
- Side forms / detail editors where context behind the panel should stay visible.

For destructive confirmation or a focused single-task dialog, use a [`Modal`](./Modal.md) instead.

## Markup

```vue
<MpDrawer
  :is-open="isFilterDrawerOpen"
  placement="right"
  size="sm"
  @close="isFilterDrawerOpen = false"
>
  <MpDrawerOverlay />
  <MpDrawerContent>
    <MpDrawerHeader>
      <span :class="drawerTitleClass">Filter</span>   <!-- fontSize: lg (16px) -->
      <MpDrawerCloseButton />
    </MpDrawerHeader>
    <MpDrawerBody>
      <div :class="filterDrawerFormClass"><!-- flex column, gap:4 -->
        <MpFormControl><MpFormLabel>Category</MpFormLabel><MpSelect …/></MpFormControl>
        <MpFormControl><MpFormLabel>Status</MpFormLabel><MpSelect …/></MpFormControl>
        <MpFormControl><MpFormLabel>Keyword</MpFormLabel><MpInput …/></MpFormControl>
      </div>
    </MpDrawerBody>
    <MpDrawerFooter>
      <div :class="filterDrawerFooterClass"><!-- space-between, full width -->
        <MpButton variant="ghost" @click="resetFilters">Reset</MpButton>
        <MpButton variant="primary" @click="isFilterDrawerOpen = false">Apply</MpButton>
      </div>
    </MpDrawerFooter>
  </MpDrawerContent>
</MpDrawer>
```

## The two-pane picker drawer

Reference impl: [`ScopePickerDrawer.vue`](../../app/components/products/ScopePickerDrawer.vue),
used by the price-rule form's "Add contact" and "Add product".

Use it when a form has to pick **many items out of a long list** — a menu or a
tag input stops working once the list runs past a screenful, because nothing on
screen says what is already picked.

Shape, left to right:

- **`size="xl"`, `placement="right"`.** Two panes need the width; anything
  narrower puts the list and the selection on top of each other.
- **The body is the flex column.** `MpDrawerBody` gets `display: flex` +
  `minHeight: full`, the pane grid `flex: 1; align-items: stretch`, and each
  list `overflow-y: auto` — that is what makes the rule between the panes run
  the drawer's full height instead of stopping under the last row.
- **Header** = the action ("Add contact") + close button. **Intro line** under
  it says what the picking is _for_, in one sentence.
- **Left pane — everything pickable.** A narrowing control on top (an
  `MpSegmentedControl` over kinds of item, an `MpSelect` over a category, or
  both), a search beside it, then the heading directly above the rows it names.
  Each row is one button (`Pixel.button`) carrying an avatar, a label, a caption
  (`Type | code`), and a check when picked — so the whole line is the hit
  target and the row's state is legible without a checkbox column.
- **Right pane — everything picked**, with its own search, an `N selected …`
  count with **Delete all** opposite it, and the _same row markup as the left
  pane_ so a picked thing reads identically on both sides. Clicking a row there
  takes it back off — there is no separate × button. Empty, it carries the same
  flat-icon empty state
  the form's step uses (see [`BlankSlate`](./BlankSlate.md) § Empty table
  state) — not the illustration.
- **Footer** = a **Select all N** checkbox with a description on the left,
  `Cancel` / `Save` on the right.
- **"Select all" is a standing instruction, not N ticks.** It means "everything,
  including whatever is added later", so it is its own state: the drawer emits
  `save(values, isAll)`, touching any row drops back to a list, and reopening an
  "all" scope shows the checkbox ticked with today's members listed on the
  right. The saved price rule spells this as an **empty list** — which is why
  the form validates that a scope was chosen at all, since otherwise "nothing
  picked yet" would save as "applies to everything".
- **The drawer edits a draft**, seeded from the form on every open and handed
  back only on `Save` — the staged rule below, for the same reasons. `Save`
  stays disabled until the draft actually differs from what the form holds.
- **A group is a shortcut, not a scope.** A picked group stays a group _in the
  drawer_ — one row, one entry in the count — and is expanded into its members
  on `Save`, so the form stores plain names and nothing downstream has to
  resolve a group again later. (Reopening therefore shows those members
  individually: the saved rule no longer knows which group they came from.)

## The allocation drawer

Reference impl: [`StorageQuantityDrawer.vue`](../../app/components/products/StorageQuantityDrawer.vue)
("Set location" / "Pick from location"), documented in full in
[`storage-locations.md`](../storage-locations.md).

A third shape, for splitting **one number across several rows** — a movement's
quantity across the shelves it comes from or goes to. What makes it its own
thing rather than a form in a panel:

- **The target is fixed and shown.** A meta list repeats the line (product,
  quantity, warehouse) at the top, and a `Total 40 / 40` footer runs under the
  table, red until the rows add up. `Done` refuses with "Total must be equal"
  rather than saving a split that doesn't.
- **Rows are add-on-pick.** A trailing picker adds a row, one per location, and
  a row's own picker can swap it — the same trailing-row affordance the
  warehouse form's level table uses.
- **The parent clears the allocation when the target changes**, since the split
  was made to add up to the old number.

## Rules

- **Open state:** drive with `:is-open` + `@close` — this version emits `open`/`close`, **not** `update:isOpen`, so there is **no `v-model:is-open`**. `@close` covers the × button, overlay click, and Esc.
- **Close button placement:** `MpDrawerCloseButton` does **not** self-position — it must live **inside `MpDrawerHeader`** (a flex `space-between` container). As a bare sibling it drops to the top-left.
- **Header title size:** the header recipe sizes text at `md` (14px). Wrap the title in `<span :class="drawerTitleClass">` to bump it to **`lg` (16px)**; weight is inherited from the recipe.
- **Live or staged — decide by how many fields there are.**
  - **Live** (the template above): fields bind the page's own refs, so filtering
    happens as you type. `Apply` only closes; `Reset` clears the refs. Right for
    a handful of fields where each change is cheap and legible.
  - **Staged** (Purchases: [`PurchaseFilterDrawer.vue`](../../app/components/purchase/PurchaseFilterDrawer.vue)):
    the drawer edits a **local draft** and only `Apply` hands it to the page;
    `Cancel` discards. Switch to this once the set grows past a few fields, for
    two reasons. Re-running the list on every keystroke means most of the work
    happens behind an overlay the user can't see past — the result is a
    surprise when the drawer closes rather than feedback. And a live drawer
    makes `Cancel` and `Apply` decorative: neither does anything the other
    doesn't, so there is no way to back out of a half-built filter.
  - **A staged drawer owes the user two things a live one doesn't.** It closes
    over its own settings, so put a **dot on the Filter button** while anything
    is set, and a **Clear filters** action in the [`BlankSlate`](./BlankSlate.md) —
    otherwise a filter that matches nothing leaves an empty screen with no
    visible cause and no way out.
  - **Under staging, `Reset` inside the drawer clears the draft, not the list.**
    Applied state still changes only on `Apply`. Label it for what it does
    (`Clear fields`) if that is likely to surprise — pressing `Reset` and then
    `Cancel` leaves the old filters in force. A blank-slate reset button
    _outside_ the drawer is the exception: there is no drawer open to commit
    from, so it clears applied state directly.
  - **The dot is one way to pay that debt, not the only one.** The Credit Memo
    report carries no indicator on its Filter button (a standing product
    decision) and settles the account in its blank slate instead: the copy names
    every filter in force and offers the reset. Either route is fine; leaving
    both out is not.
- Form fields are wrapped in `MpFormControl` + `MpFormLabel` — see [`Form`](./Form.md).
- **A multi-select field that filters by picking known entities** (customers,
  tags, groups) uses `MpInputTag` instead of a checkbox list or a plain
  `MpSelect`: type to search, click a suggestion, it becomes a removable tag
  inside the field. Set `is-enable-create-new-tag="false"` so only real
  matches become tags (no free text), `is-show-suggestions="true"`, and pass
  `suggestions` as `{ id, label, value }[]`. Bind the current tag list via
  `:data` + `@change` (not `v-model` — there is no `update:data` event):
  ```vue
  <MpFormControl><MpFormLabel>Customer</MpFormLabel>
    <MpInputTag
      :data="customerTagData"
      :suggestions="customerSuggestions"
      suggestion-key="label"
      :is-show-suggestions="true"
      :is-enable-create-new-tag="false"
      @change="customerTagData = $event"
    />
  </MpFormControl>
  ```
  Reference impl: [`report.vue`](../../app/pages/sales/credit-memo/report.vue)'s
  Customer and Grup Customer filter fields.

## Gotchas

- `placement="right"`, `size="sm"` for the filter use case; larger forms can use
  `md`. A panel whose body needs real table width (a transaction history panel,
  say) should use `size="lg"` — don't force wide content into `sm`.
- The drawer fields and the quick filters bind the **same** state (see [`FilterBar`](./FilterBar.md)).
- **Not every field belongs on every tab.** Where the list has tabs over
  different record types, hide the controls that have no referent — Purchases
  drops the money ranges on Delivery and Request, the due-date range on both,
  and the tag picker on Join invoice. A control that can only ever match
  nothing reads as broken, which is worse than its absence.
- **`MpRadio` has no group wrapper in Pixel 3** — there is no `MpRadioGroup`.
  Radios are grouped by sharing one `v-model`; lay them out yourself in a flex
  row. Note that MpRadio was the first radio in this app, and Panda emits recipe
  CSS only for components it statically finds: the controls rendered as
  zero-height invisible boxes until `.nuxt` and `node_modules/.vite` were
  cleared. Expect that on the first use of any Pixel component.
- **That gotcha bites the whole running app, not just the new component.**
  `MpSegmentedControl`'s first use (the picker drawer above) left the dev
  server serving a stylesheet with no recipe CSS at all — the segmented control
  rendered as bare radios, and every checkbox and tab set _already in the app_
  lost its styling too. Nothing is wrong with the code; **restart the dev
  server** and check again before rewriting a component that looks broken.
- **`MpInputTag` does not give back the suggestion you gave it.** Each picked
  tag is emitted as `{ text, id: "tag-<text>", value: <the whole suggestion
object>, isInvalid, isReadOnly }` — so for a suggestion of
  `{ id, label, value }`, `tag.value` is that **entire object**, not the scalar
  in its `value` key, and `tag.label` is `undefined` (the display string lives
  in `tag.text`). Reading `tag.value` directly and matching it against ids
  silently matches nothing, which looks exactly like "the filter returned no
  results" rather than a bug. Always unwrap:

  ```ts
  function tagValue(t: DataInterface): string {
    const v = t.value as unknown;
    if (v && typeof v === "object" && "value" in (v as Record<string, unknown>))
      return String((v as Record<string, unknown>).value);
    return String(v ?? t.text ?? ""); // free-typed tag: value is the string
  }
  const tagLabel = (t: DataInterface) => String(t.text ?? tagValue(t));
  ```

  Verify a tag filter by **applying it and checking the rows that come back** —
  a rendered suggestion list proves only that the dropdown works.

- **`MpFormControl` injects its `id` into every descendant input, overriding an
  `id` set on the input itself.** Two inputs in one control (a min/max range,
  say) therefore end up sharing one `id` — invalid HTML — and `MpFormLabel`'s
  `for` only ever resolves to the first, leaving the second field with no
  accessible name. Give each input **its own nested `MpFormControl`** with a
  unique id, keep the outer control for the group label and
  `MpFormErrorMessage`, and add an explicit `aria-label` per input. Unknown
  attrs like `aria-label` and `inputmode` _do_ reach the real `<input>`, so
  those work as written.
- **Every `MpFormLabel` must be a descendant of `MpFormControl`.** `MpFormLabel`
  reads its required/invalid state through `MpFormControl`'s provide/inject
  context; used outside one it throws `Cannot read properties of undefined
(reading 'value')` during render — and that render error wedges reactivity for
  every later interaction on the page, so the symptom shows up far from the
  cause. Easy to hit with a bare label above a non-field wrapper such as a
  min/max range row.
