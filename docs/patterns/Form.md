# Form

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl (full create/edit page): [`app/components/purchase/PurchaseTransactionForm.vue`](../../app/components/purchase/PurchaseTransactionForm.vue),
> rendered by `app/pages/purchase/invoice/new.vue` and `.../edit/[id].vue`.
> Drawer-form usage: the [`Drawer`](./Drawer.md) filter form in [`index-template.vue`](../../app/pages/templates/index-template.vue).
> Shell rule: [`design.md` §7 → Form fields](../design.md).

## Purpose

How to compose validated input fields anywhere in the app — inside a drawer, a
modal, or a full create/edit page.

## The one rule that matters

**Every validated field is wrapped in `<MpFormControl>`.** The form control owns
the **label, helper text, and error state** — the field itself never manages
those.

```vue
<MpFormControl :is-invalid="!!errors.name" :is-required="true">
  <MpFormLabel>Name</MpFormLabel>
  <MpInput v-model="form.name" placeholder="e.g. Office supplies" is-full-width />
  <MpFormHelpText>Shown on invoices.</MpFormHelpText>
  <MpFormErrorMessage>{{ errors.name }}</MpFormErrorMessage>
</MpFormControl>
```

## Field stacking

Stack `MpFormControl`s in a flex column with a consistent gap (the drawer uses
`gap: 4`):

```vue
<div :class="formColumnClass"><!-- display:flex; flexDirection:column; gap:4 -->
  <MpFormControl>…</MpFormControl>
  <MpFormControl>…</MpFormControl>
</div>
```

For a two-column form, group pairs in a `display:grid; gridTemplateColumns: 1fr 1fr; gap:4` row,
and let full-width fields span both columns.

## Field choices

| Need                      | Component                 | Notes                                                            |
| ------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Single-line text / number | `MpInput`                 | `is-full-width`; add `type="number"` for numerics.               |
| Choice from a fixed list  | `MpSelect`                | Options are **native `<option>` children** — no `:options` prop. |
| Searchable / async choice | `MpAutocomplete`          | `@change` returns an **option object** — unwrap `.value`.        |
| Multi-line                | `MpTextarea`              | —                                                                |
| Boolean                   | `MpCheckbox` / `MpSwitch` | —                                                                |

## Rules

- A field **without** a wrapping `MpFormControl` (e.g. the header search) needs an explicit `aria-label`.
- Don't put the label in a placeholder — the placeholder is example text, the `MpFormLabel` is the label.
- Buttons in a form footer follow the action-row order: secondary/ghost (Cancel/Reset) on the left or right per container, primary (Save/Apply) as the affirmative — see [`Drawer`](./Drawer.md) and [`Modal`](./Modal.md).
- Styling uses Panda `css()` with Pixel token shortcuts only — no `<style>` blocks, no inline `style`.

## Gotchas

- `MpSelect` always wants an explicit empty `<option value="">…</option>` for the unselected/cleared state.
- `MpInput`'s `is-clearable` clear emits `undefined` on click — fine inside a drawer field, but for a live search use an own clear button (see [`FilterBar`](./FilterBar.md)).
- The help-text part is **`MpFormHelpText`**, not `MpFormHelperText` — easy typo, and TypeScript won't catch it if you also import the (nonexistent) latter from a barrel that re-exports loosely.
- `MpAutocomplete` supports `v-model` directly (`modelValue`/`update:modelValue`) — set matching `label-prop`/`value-prop` (e.g. both `"name"`) to bind the model straight to a plain string instead of unwrapping an option object from a `@change` payload.
- **`MpDatePicker` is verified and is what a real form should use** (`PurchaseTransactionForm.vue`) — not a native `<MpInput type="date">`. Bind with `v-model` plus `value-type="string"` + `format="DD/MM/YYYY"` so the model holds the same display string the field shows, and add `use-portal` inside anything that clips (a grid cell, a drawer, a table). Note `value-type` only accepts `date | string | timestamp` — `"format"` (the vue2-datepicker spelling carried over from the source app) type-errors.
- **Dates: never derive a date string with `Date#toISOString()`** — it converts to UTC first and silently shifts the day in any timezone that isn't UTC. Build the parts from local `getFullYear`/`getMonth`/`getDate`, and parse back the same way (not `new Date(str)`, which parses as UTC midnight). When the field format (`DD/MM/YYYY`) differs from the stored format (`yyyy-mm-dd`), convert with plain string splitting at the save/load boundary — no `Date` round-trip at all.
- Attachments use **`MpUpload`** (`@change` gives a native input event → `event.target.files`), *not* `MpDropzone` — `MpUpload` renders the "Choose file" button + inline placeholder that the Jurnal forms use; `MpDropzone` is the drop-area/avatar/logo variant.
- **Where the save/cancel buttons go is a layout decision, not a default.** On the Jurnal purchase forms they sit at the **bottom-right of the form body**, not in the page title band — the title band holds the transaction-type switcher instead. Check the reference screen before assuming `#actions`.
- An "add row" affordance in an editable line-items table can be **a trailing placeholder row holding only the first field** (picking a product there appends a real row) rather than a separate "Add line" button — that's the Jurnal pattern, and it's what every form in `app/components/purchase/` does.
- **`MpFormHelpText` and `MpFormErrorMessage` only work inside `MpFormControl`.** They read their state from the control's provided context, so used bare (e.g. as a hint under an input in a table cell) they throw at render — `Cannot read properties of undefined (reading 'value')`, thrown from inside the Pixel bundle, which makes it look like a library bug rather than a usage error. Use a plain `MpText size="body-small" color="gray.600"` for a standalone hint.
- Before adding a Pixel form component you haven't used here, confirm its props with the Pixel MCP / `pixel-docs-jurnal` skill — don't guess.
