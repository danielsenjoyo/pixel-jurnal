# Details Page Format

> Composition recipe for a **single-record** screen (view / edit one Invoice,
> Contact, Product, …).
> Reference implementation: [`app/pages/purchase/invoices/[id].vue`](../../app/pages/purchase/invoices/%5Bid%5D.vue)
> (Purchase Invoice draft/approval review — read-only). Builds on the shell +
> [`SummaryBox`](./SummaryBox.md), [`StatusBadge`](./StatusBadge.md),
> [`Form`](./Form.md), [`Tabs`](./Tabs.md), [`Modal`](./Modal.md).

## When to use

A page focused on **one record**: its header/identity, key facts, related lists,
and edit/lifecycle actions. For browsing many records use
[`index-page-format`](./index-page-format.md) instead.

## Zone order

A details page is a single `<DefaultPageContent>` whose default slot stacks:

```
┌─ DefaultPageContent ──────────────────────────────────────────────┐
│  title (record name)  ........  #actions (Edit · status actions)   │  ← page-title-bar
│  #tabs  (Overview · Activity · Documents …)        optional         │  ← Tabs
├─ PageStage (white card) ───────────────────────────────────────────┤
│  [A] Identity / status header  (StatusBadge + key meta)            │
│  [B] Summary boxes (record KPIs)                    optional        │  ← SummaryBox
│  [C] Detail sections  (read view  ── OR ──  Form edit view)        │  ← Form
│  [D] Related list(s)  (mini table / line items)                    │  ← TablePage (compact)
└─────────────────────────────────────────────────────────────────────┘
```

## Zone → pattern map

| Zone | Piece                         | Pattern                                                     |
| ---- | ----------------------------- | ----------------------------------------------------------- |
| —    | Title + record actions        | [`page-title-bar`](./page-title-bar.md)                     |
| —    | Section tabs                  | [`Tabs`](./Tabs.md)                                         |
| A    | Identity / status header      | [`StatusBadge`](./StatusBadge.md) + meta rows               |
| A.1  | Line-level reference affordance | A per-row trigger (e.g. "See past prices") opening a [`Drawer`](./Drawer.md) scoped to that row — or, when there's nothing to reference, a plain under-value text note. Lives inside zone C/D's row, not the identity header. |
| B    | Record KPIs                   | [`SummaryBox`](./SummaryBox.md)                             |
| C    | Detail sections / edit form   | [`Form`](./Form.md)                                         |
| D    | Related records / line items  | [`TablePage`](./TablePage.md) (compact — often no bulk bar) |
| —    | Destructive lifecycle actions | [`Modal`](./Modal.md) confirmation                          |

## Rules

- **One `<DefaultPageContent>`**, same as the index page — the shell frame is identical; only the body zones differ.
- The title is the **record's name**; the `#actions` row carries the primary lifecycle action (`Edit`, `Approve`, `Send`) + a secondary "More" menu for the rest.
- **Status belongs in the identity header (Zone A)** via a [`StatusBadge`](./StatusBadge.md), not in the title text.
- **Read vs. edit:** the same section can render a read view or, behind an `isEditing` flag, the [`Form`](./Form.md) version. Keep both in the same component so layout doesn't shift.
- **Related lists are compact tables** — reuse [`TablePage`](./TablePage.md) but usually drop selection/bulk and pagination for short line-item lists.
- Destructive actions (Delete, Void) confirm via a [`Modal`](./Modal.md).
- Same styling/token discipline as everywhere: Panda `css()` with Pixel token shortcuts, no inline `style`.

## Resolved (from the first real build)

- **Layout**: a 4-up meta grid (`repeat(auto-fit, minmax(160px, 1fr))`) for zone A,
  not two-column — reads well at the widths this app actually renders at.
- **Action row**: not sticky. Simplest default; revisit if a details page grows
  long enough that the primary lifecycle action scrolls out of reach.
- **Unsaved-changes guarding**: not exercised — the reference impl is a
  strictly read-only details page (no mutation path at all). A future
  edit-capable details page still needs to decide route-leave-guard vs. modal.
