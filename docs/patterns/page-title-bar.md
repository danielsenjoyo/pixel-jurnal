# Page Title Bar

> Part of the Mekari Jurnal page-construction pattern set.
> Owner component: [`app/components/template/DefaultPageContent.vue`](../../app/components/template/DefaultPageContent.vue).
> Shell rules: [`design.md` §4](../design.md). See also [`Tabs`](./Tabs.md), [`index-page-format`](./index-page-format.md).

## Purpose

The title band is the top region of every page — page heading on the left, the
action row on the right, with an optional page-level tab strip directly beneath.
It is supplied by `DefaultPageContent` so individual pages never re-implement it.

## When to use

Every routed page renders **exactly one** `<DefaultPageContent>`. The title bar is
not optional — it is the frame the white `PageStage` hangs from.

## Markup

```vue
<DefaultPageContent title="Products" subtitle="Manage your goods & services">
  <template #actions>
    <MpPopover placement="bottom-end" use-portal is-adaptive-width>
      <template #default>
        <MpPopoverTrigger>
          <MpButton variant="secondary" right-icon="caret-down">Export</MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent><MpPopoverList>…</MpPopoverList></MpPopoverContent>
      </template>
    </MpPopover>
    <MpButton variant="primary">Create new</MpButton>
  </template>

  <!-- page body -->
</DefaultPageContent>
```

## Props & slots

| API            | Type     | Notes                                                                                                                                  |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `string` | Falls back to `activePageTitle` from the menu so stub pages stay short.                                                                |
| `subtitle`     | `string` | Optional `body-small / gray.600` line under the heading.                                                                               |
| `breadcrumb`   | `string` | Optional link label above the title (e.g. `"Purchases"`) — for a details page one level under a list page. Omit on a list page itself. |
| `breadcrumbTo` | `string` | Route the breadcrumb navigates to (e.g. `"/purchase"`).                                                                                |
| `#title-badge` | slot     | Renders inline right after the title text — a details page's [`StatusBadge`](./StatusBadge.md) goes here, not in the body.             |
| `#actions`     | slot     | Right-aligned action row (see rules).                                                                                                  |
| `#tabs`        | slot     | Page-level tab strip — see [`Tabs`](./Tabs.md).                                                                                        |
| _default_      | slot     | The page body, rendered inside the white `PageStage`.                                                                                  |

`breadcrumb`/`breadcrumbTo` and `#title-badge` make the title band taller than
the standard height when used — it's a `min-height`, not a fixed `height`, so
this never clips. See [`details-page-format`](./details-page-format.md) for
the details-page recipe that uses them.

## Rules

- **Heading:** H1, 24/32 SemiBold, letter-spacing `-0.48px`. Owned by the component — don't restyle it per page.
- **Height:** `72px` (`--layout-page-title-height`) as a `min-height` — every page renders at exactly that height, but a details page's `breadcrumb`/`#title-badge` can grow it taller. The band is transparent over the gray shell.
- **Action row (Figma `1:16062`):** up to three items, **label-only (no leading icons)**:
  1. Optional "More" dropdown — `MpButton variant="secondary"` + `right-icon="caret-down"` wrapping an `MpPopover`.
  2. Optional secondary action — plain `MpButton variant="secondary"` with a verb label (`Export`).
  3. Primary action — `MpButton variant="primary"` with a verb label (`Create new`).
- **Verb labels in production.** "Primary action" / "Secondary action" are placeholders only.
- Pages must **not** render the header or sidebar — `layouts/default.vue` injects those.

## Gotchas

- The primary button intentionally carries **no icon** — the row reads as label-only.
- `gap` between actions is `--spacing-xs` (8px); it comes from `actionsClass`, not per-page overrides.
