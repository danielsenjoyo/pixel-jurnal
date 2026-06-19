# Form

> Part of the Mekari Jurnal page-construction pattern set.
> In-repo usage so far: the [`Drawer`](./Drawer.md) filter form in [`index-template.vue`](../../app/pages/templates/index-template.vue).
> Shell rule: [`design.md` §7 → Form fields](../design.md).
> _A full create/edit form page has no dedicated reference impl yet — this documents the prescribed pattern._

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
  <MpFormHelperText>Shown on invoices.</MpFormHelperText>
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
- Before adding a Pixel form component you haven't used here, confirm its props with the Pixel MCP / `pixel-docs-jurnal` skill — don't guess.
