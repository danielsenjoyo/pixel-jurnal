# Status Badge

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (`STATUS_TYPE` map + table status cell).
> See also [`TablePage`](./TablePage.md).

## Purpose

Render a record's status as an `MpBadge` with a semantic `type`. Used in the
table status column, summary rows, and detail headers.

## Markup

```vue
<MpBadge for="tableStatus" :type="STATUS_TYPE[row.status]">
  {{ STATUS_LABEL[row.status] }}
</MpBadge>
```

```ts
// Map your domain status → MpBadge `type` (the non-deprecated API).
const STATUS_TYPE: Record<Status, BadgeType> = {
  active: "completed", // green
  pending: "warning", // amber
  inactive: "critical", // red
  review: "information", // blue
  draft: "announcement" // neutral/grey
};
```

## Badge types

| `type`         | Reads as           | Use for                              |
| -------------- | ------------------ | ------------------------------------ |
| `completed`    | success / done     | paid, active, approved, completed    |
| `warning`      | needs attention    | pending, due soon, partial           |
| `critical`     | error / blocked    | overdue, inactive, rejected, failed  |
| `information`  | in progress / info | under review, processing, draft sent |
| `announcement` | neutral / default  | draft, new, uncategorised            |

## Rules

- Use **`type`** — `variant` is deprecated.
- Every `MpBadge` needs a **`for`** value (`tableStatus`, `additionalInformation`, …); it scopes the badge's styling context.
- Keep a single domain-status → `type` map (`STATUS_TYPE`) plus a label map (`STATUS_LABEL`); don't inline the mapping at each call site.
- Pick the `type` by **meaning**, not colour — the colour follows from the type.

## Gotchas

- The label text comes from `STATUS_LABEL`, not the raw enum key, so copy stays human-readable and translatable.
