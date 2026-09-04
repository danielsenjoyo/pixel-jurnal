# MoneyField

> Part of the Mekari Jurnal page-construction pattern set.
> Reference impl: [`app/components/money/`](../../app/components/money/) (`MoneyText.vue`, `MoneyInput.vue`),
> consumed by [`price-history`](../../app/components/price-history/README.md).

## Purpose

Currency-aware money display and entry. Replaces ad-hoc `Intl.NumberFormat`
calls scattered per page (see the generic one in
[`index-template.vue`](../../app/pages/templates/index-template.vue), which
isn't currency-symbol-aware).

## The one rule that matters

**Never convert currency for comparison, sorting, or applying a value.**
Money in this app is always displayed and acted on in its **original**
currency. The only place a converted figure may appear at all is a
**disclosed, informational-only** estimate (e.g. an IDR hover estimate on a
foreign-currency historical price) — and that estimate must:

- be computed at the rate that applied **at the relevant historical moment**,
  never today's rate,
- never feed into a calculation, sort, filter, or default value,
- be visually distinct from the actual (non-converted) amount, and
- be disclosed in the UI (a header note), not a silent hover-only discovery.

## Components

| Component | Use |
|---|---|
| `MoneyText.vue` | Read-only, currency-aware display. `Rp` with no decimals (`id-ID` locale), `US$` with 2 decimals. Forwards `size`/`weight`/`color` to `MpText`. |
| `MoneyInput.vue` | Editable money field: `MpInputGroup` + `MpInputLeftAddon has-background` (currency symbol) + `MpInput`. Parses/reformats on blur, not on every keystroke. |

Both take a `currency: "IDR" | "USD"` prop — extend the union in
`app/types/price-history.ts` if a new currency is needed; don't special-case
formatting inline at the call site.

## Gotchas

- There is no dedicated Pixel 3 currency-input component — `MpInputGroup` +
  `MpInputLeftAddon` is the sanctioned composition (confirmed via Pixel MCP).
- `MoneyInput` does not apply live thousand-separator masking in this
  prototype — it keeps the field a plain numeric buffer while focused and
  reformats on blur. If a future build wants live masking, verify
  `@mekari/pixel3-mask`'s `vMask`/`defineMaskOptions` via the Pixel MCP first.
