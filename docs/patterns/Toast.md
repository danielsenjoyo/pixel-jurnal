# Toast

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`new.vue`](../../app/pages/purchase/invoices/new.vue) (apply-price confirmation).

## Purpose

A transient, one-line confirmation after a user-initiated action completes
(e.g. "a price was applied", "a filter was saved"). Not for errors that need
the user to act — those belong inline (`MpFormErrorMessage`) or in a
[`Banner`](./Modal.md).

## Markup

```ts
import { toast } from "@mekari/pixel3";

toast.notify({
  id: `apply-price-${Date.now()}`,
  variant: "success",
  title: "Price applied — vendor changed to CV Teknik Mandiri."
});
```

## Rules

- **`title` is the only content prop — there is no description/body field.**
  Keep the message to one sentence. Don't try to pack a multi-fact summary in;
  say the one thing that matters (what changed), not every side effect.
- `variant` is `success | error | greeting` only — no neutral/info variant.
- Give every `toast.notify()` call a unique `id` (a timestamp suffix is
  sufficient for a prototype) so rapid repeat actions don't collide.
- `toast.closeAll()` clears every open toast — useful in tests, rarely needed
  in product code.
- No manual `MpToastManager` mounting has been required in this repo —
  `@mekari/pixel3-nuxt` enables its `toastManager` option by default.
