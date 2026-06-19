# Details Page Format

> Composition recipe for a **single-record** screen (view / edit one Invoice,
> Contact, Product, …).
> _Proposed pattern — no reference implementation in the repo yet. It builds only
> on already-established primitives (the shell + [`SummaryBox`](./SummaryBox.md),
> [`StatusBadge`](./StatusBadge.md), [`Form`](./Form.md), [`Tabs`](./Tabs.md),
> [`Modal`](./Modal.md)). Treat the dimensions below as the intended pattern;
> confirm component props with the Pixel MCP before building._

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
| B    | Record KPIs                   | [`SummaryBox`](./SummaryBox.md)                             |
| C    | Detail sections / edit form   | [`Form`](./Form.md)                                         |
| D    | Related records / line items  | [`TablePage`](./TablePage.md) (compact — often no bulk bar) |
| —    | Destructive lifecycle actions | [`Modal`](./Modal.md) confirmation                          |

## Rules (proposed)

- **One `<DefaultPageContent>`**, same as the index page — the shell frame is identical; only the body zones differ.
- The title is the **record's name**; the `#actions` row carries the primary lifecycle action (`Edit`, `Approve`, `Send`) + a secondary "More" menu for the rest.
- **Status belongs in the identity header (Zone A)** via a [`StatusBadge`](./StatusBadge.md), not in the title text.
- **Read vs. edit:** the same section can render a read view or, behind an `isEditing` flag, the [`Form`](./Form.md) version. Keep both in the same component so layout doesn't shift.
- **Related lists are compact tables** — reuse [`TablePage`](./TablePage.md) but usually drop selection/bulk and pagination for short line-item lists.
- Destructive actions (Delete, Void) confirm via a [`Modal`](./Modal.md).
- Same styling/token discipline as everywhere: Panda `css()` with Pixel token shortcuts, no inline `style`.

## Open questions (resolve when first built)

- Two-column vs. stacked detail layout, and the responsive breakpoint.
- Whether the action row sticks while the body scrolls.
- Where unsaved-changes guarding lives (route leave guard vs. modal).

Update this file — and add a reference impl under `app/pages/templates/` — when the
first real details page lands.
