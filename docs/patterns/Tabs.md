# Tabs

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`index-template.vue`](../../app/pages/templates/index-template.vue) (both tab kinds);
> band styling: [`DefaultPageContent.vue`](../../app/components/template/DefaultPageContent.vue) (`tabsBandClass`).
> See also [`page-title-bar`](./page-title-bar.md), [`index-page-format`](./index-page-format.md).

## Purpose

Two distinct tab patterns exist. They look similar but live in different places
and carry different default styling — don't mix them up.

| Kind           | Where                                   | Job                                            |
| -------------- | --------------------------------------- | ---------------------------------------------- |
| **Page-level** | `#tabs` slot of `DefaultPageContent`    | Switch between sibling views (route-like).     |
| **Content**    | Inside the white stage, above the table | Filter the records below (e.g. status splits). |

## Page-level tabs (`#tabs`)

Sit on the gray shell, directly above the white stage — they **stick to the stage**.

```vue
<template #tabs>
  <MpTabs v-model="activePageTab" variant-color="blue">
    <MpTabList>
      <MpTab v-for="t in pageTabs" :key="t">{{ t }}</MpTab>
    </MpTabList>
  </MpTabs>
</template>
```

**Rules**

- `tabsBandClass` in `DefaultPageContent` makes them flush:
  - hides the full-width track line (`.mp-tab-list__root::before`),
  - removes the list's `padding-bottom` and 24px `margin-bottom`,
  - re-pins the active indicator (`.mp-tab-selected-border`) to **`bottom:-1px`** so its full **2px** lands flush on the stage's top edge.
- This is the **only** deviation from the library tab styling.

## Content tabs

Library default — keep the track and put the count badge **inside** the tab slot.

```vue
<MpTabs v-model="activeTab" variant-color="blue">
  <MpTabList>
    <MpTab v-for="tab in tabs" :key="tab.label">
      <span :class="tabLabelClass">
        {{ tab.label }}
        <MpBadge v-if="tab.count" for="additionalInformation" type="announcement">
          {{ tab.count }}
        </MpBadge>
      </span>
    </MpTab>
  </MpTabList>
</MpTabs>
```

**Rules**

- Count badge goes inside the `MpTab` slot, wrapped with the label in an inline-flex span (`tabLabelClass`, `gap: 2`).
- Use `type` (not the deprecated `variant`) on `MpBadge`; it needs a `for` value.

## Gotchas

- `v-model` is **index-based** (`ref(0)`), not the tab label.
- `variant-color="blue"` on both kinds.
- **Add `is-manual` the moment anything but a click sets the tab.** Without it
  `MpTabs` keeps its own index and the `v-model` is effectively one-way
  (component → parent): clicks update your ref, but assigning to that ref
  changes nothing. There is no warning and no error — the tab just stays where
  it was. Every `v-model` example in the Pixel tab docs passes `is-manual` for
  this reason.

  It bites wherever a tab is chosen for the user: a `?tab=` deep link, a
  "View warehouse info" link that jumps to a sibling tab, a details-page
  breadcrumb that has to land on a specific list. `app/pages/products/index.vue`
  and `app/pages/products/detail/[id].vue` both do, so both pass it.

  Setting the ref **before mount doesn't help either** — the component settles
  on its own index as it mounts and emits that back over the model. With
  `is-manual` the ref is authoritative and the initial value is honoured;
  without it, apply the change in `onMounted` and it still loses.
