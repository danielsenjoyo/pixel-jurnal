# Home page format

The Home (Beranda) landing page — [`app/pages/index.vue`](../../app/pages/index.vue).
Ported from `jurnal-frontend-app` (`src/pages/onboarding/home/`), the production
Vue 2 implementation.

Home is the only page in this prototype that is **not** a records screen. If
you're building a list, detail, or form screen, you want
[`page-recipes.md`](./page-recipes.md) instead — nothing here applies.

## Zone composition

```
┌──────────────────────────────────────────────────────────┐
│ PageStage (white, flush to the top — no PageTitle band)  │
│  ┌────────────── 776px column, centred ───────────────┐  │
│  │ 1. Activities        greeting + shortcut grid      │  │
│  │ 2. Highlights        promo carousel (dismissible)  │  │
│  │ 3. Add-ons           blue gradient card, 4 teasers │  │
│  │ 4. Live training     2 schedule cards              │  │
│  │ 5. Optimize business product carousel, 3 per slide │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

Sections are `app/components/home/Home*.vue`, one file each. All content —
copy, routes, icons, external URLs — lives in
[`app/data/home.ts`](../../app/data/home.ts); the components hold layout and
interaction only.

## Rules

**No PageTitle band.** Home is the documented exception to "every page renders
exactly one PageTitle followed by exactly one PageStage" (`design.md` §1). Its
first section already opens with the greeting and "What activity do you want to
do?" — a band reading "Home" above that says the same thing twice. The stage
itself is unchanged: same white surface, top/left border, top-left radius.

**One 776px column.** Every section is built to that width and centres inside
it — the same measure production uses. The column reserves an 80px gutter on
each side (`width: calc(100% - 160px)`) because the carousels hang their
prev/next arrows 44px outside it; without the gutter the left arrow is clipped
by the stage edge near 1024px.

**Carousel arrows sit outside the slide.** `left: -44px` / `right: -44px` on a
`position: relative` shell around `MpCarousel`. An arrow overlapping the card
edge reads as part of the card. Arrows wrap in both directions, matching the
carousel's own `is-loop`.

**Toasts go `bottom-center`.** The shell's navbar is fixed and paints over the
viewport's top edge, so a top-anchored toast renders underneath it. This
applies to any toast added anywhere in the app, not just Home.

**Grid remainders get centred.** Seven shortcut tiles over three columns leave
the last one alone on its row; it's pinned to the middle column
(`gridColumn: "2 / 3"`) so it sits under the grid rather than hanging off the
left edge.

## What the port leaves out

Production drives Home off feature flags, package tier, and per-user access
(`user_app_access`, `showMigrationLayout`, `ent_plus_package`, paywalls). This
prototype has no backend, so:

- Every section and every item is always visible — no access or tier gating.
- The three banners that exist purely to report live backend state —
  multi-currency activation, anomaly detection, data-migration progress — are
  absent, as are the access-limited / unauthorized-report / new-owner modals.
- Add-on cards open the Mekari Marketplace instead of a per-feature paywall.
- The highlight dismissal is in-memory; production persists it to
  localStorage. The toast promises the section returns on next sign-in, which
  is what a reload does here.
- Two highlight CTAs (data migration, referral program) have no page in this
  prototype and point at Applications.

Production renders a PNG illustration per shortcut tile, highlight slide, and
product card. This prototype ships no illustration assets, so tiles reuse the
Pixel icon their destination module uses in the sidebar, and product cards use
the Pixel brand icons (`pay-brand`, `capital-brand`, `klikpajak-brand`, …).

## Copy

English and Indonesian, verbatim from the production `i18n.json` files, in the
`label` / `labelId` shape `menu.ts` uses. Components read it through
`useLanguage().tField(item, "label")`, which picks the `Id` sibling when the
locale is `id`.
