# Modal

> Part of the Mekari Jurnal page-construction pattern set.
> _No dedicated reference impl in the repo yet — this documents the prescribed pattern,
> mirroring the verified [`Drawer`](./Drawer.md) composition (the `MpModal` family behaves the same way)._
> See also [`Form`](./Form.md).

## Purpose

A centred, focused dialog that takes over until the user resolves it. Use it for
confirmations (especially destructive ones) and short single-task forms that
warrant interrupting the page.

## Modal vs. Drawer

| Use a **Modal** when…                                 | Use a [**Drawer**](./Drawer.md) when…                 |
| ----------------------------------------------------- | ----------------------------------------------------- |
| Destructive confirmation ("Delete 3 items?")          | Filtering a list (the canonical drawer use)           |
| Short, focused single task that should block the page | A side form where the page behind should stay visible |
| A decision the user must resolve before continuing    | Browsing/editing alongside the underlying content     |

## Markup

```vue
<MpModal :is-open="isOpen" size="sm" @close="isOpen = false">
  <MpModalOverlay />
  <MpModalContent>
    <MpModalHeader>
      <span :class="modalTitleClass">Delete item?</span>   <!-- fontSize: lg (16px) -->
      <MpModalCloseButton />
    </MpModalHeader>
    <MpModalBody>
      <MpText size="body" color="gray.700">
        This will permanently remove "{{ target.name }}". This can't be undone.
      </MpText>
    </MpModalBody>
    <MpModalFooter>
      <div :class="modalFooterClass"><!-- flex, justify-end, gap:2 -->
        <MpButton variant="secondary" @click="isOpen = false">Cancel</MpButton>
        <MpButton variant="danger" @click="confirmDelete">Delete</MpButton>
      </div>
    </MpModalFooter>
  </MpModalContent>
</MpModal>
```

## Rules

- **Open state:** drive with `:is-open` + `@close` (same family contract as `MpDrawer` — emits `open`/`close`, **no `v-model:is-open`**). `@close` covers the ×, overlay click, and Esc.
- **Close button placement:** `MpModalCloseButton` does **not** self-position — it must live **inside `MpModalHeader`** (a flex `space-between` container), exactly like the drawer's close button.
- **Header title size:** wrap the title in a `lg` (16px) span; the header recipe defaults to `md`.
- **Footer button order:** dismiss (secondary/Cancel) then the affirmative on the right. Destructive affirmatives use `variant="danger"`; everything else `variant="primary"`.
- A confirm modal carries **no leading icons** on its buttons (label-only, like the page action row).
- Form fields inside a modal still follow [`Form`](./Form.md) (`MpFormControl` wrapping).

## Gotchas

- Verify the exact `MpModal*` part names and the `size` scale with the Pixel MCP / `pixel-docs-jurnal` skill before first use — this pattern is extrapolated from the drawer family and not yet exercised in the repo.
- Keep destructive confirmations short: one sentence stating the consequence + whether it's reversible.
