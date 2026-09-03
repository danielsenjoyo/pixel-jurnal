# Numbers, currency, dates & time

### Numerals

- Thousand separator is `.` in all three languages: `300`, `33.000`, `1.250.000`. Under 1,000 needs none.
- No leading zero on single-digit numerals in body copy: `1, 2, 3`, not `01, 02, 03`. The `0` prefix
  applies only to dates (`01/05/2024`) and clock times (`05:25`).

### Empty and zero values

Three distinct cases in tables and detail rows. Collapsing any two of them loses information.

| Case                                                                 | Show                                | Example                                                      |
| -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| The value was measured and it is zero                                | `0`                                 | A campaign that delivered no messages shows `0`              |
| No value, in a compact column where zero is not a meaningful reading | Em dash `—`                         | Sender, date, or a count that does not apply to this row     |
| No value, where zero and no-data mean different things to the reader | A word: `Not set`, `Not applicable` | A price row, where "nothing spent" and "not measured" differ |

- **Zero is data.** Never render `0` as a dash. A dash where a zero belongs makes a measured result look unmeasured.
- **Use the em dash, not a hyphen and not an en dash.** One job per dash: the hyphen joins compounds
  (`sign-in`, `top-up`, `time-sensitive`), the en dash marks ranges (`8:00–10:30`), the em dash marks absence.
  A hyphen also reads as a minus sign in a right-aligned numeric column, and as a typo everywhere else.
- **No spaces around the placeholder em dash.** It is the whole cell value, not a separator, so the
  range spacing rules under [Dates & time](#dates--time) do not apply.
- **Prefer a word when the distinction carries weight.** In accounting typography a dash traditionally
  denotes nil, so a finance-literate reader may read `—` as zero. Where that would mislead, spell it out.

### Math symbols

**In prose** — plain ASCII, not typographic variants:

- Addition `+` → `1 + 5 = 6`
- Subtraction `-` (hyphen-minus) → `7 - 2 = 5`
- Multiplication lowercase `x` → `4 x 2 = 8` (not `×`, not uppercase `X`, not `*`)
- Division `/` → `6 / 2 = 3` (not `÷`)

**In formula display** — keep `×` and `÷`. This covers tooltips and captions showing a formula, and
on-screen formula rows where a value is derived from other values on the same screen:

- ✅ `(clicks ÷ impressions × 100)` — metric tooltip
- ✅ `Rp638 max price × 1,05 country multiplier` — derived-value caption
- ✅ A `Max price × Country multiplier = Effective max price` input row

> **Rationale:** users reading a formula expect the notation analytics tools use (Meta Ads Manager,
> Google Analytics). In formula context ASCII `/` reads as a path separator and `x` as a variable.
> In prose the ASCII forms stay correct — "multiply by 2", not "multiply × 2".
> **Do not flag `×` or `÷` inside a formula**; flag them only inside prose sentences.

### Currency

Currency formatting follows the **currency**, not the language — the same amount looks identical
across EN, ID, and PT-BR.

- Symbol sits **directly against the number, no space**: `Rp1.000.000`, not `Rp 1.000.000`.
- Separators follow the currency's own convention:
  - **Rupiah (Rp)** — `.` thousand, `,` decimal → `Rp1.000.000`, `Rp25.750.963,84`
  - **Real (R$)** — `.` thousand, `,` decimal → `R$1.234,56`
  - **US-style** — `,` thousand, `.` decimal → `US$1,234.56`
- **Shared symbols** (`$`, `¥`) carry a 2-letter country prefix, no parentheses: `US$`, `SG$`, `AU$`,
  `CN¥`, `JP¥`. Never bare `$`, `S$`, or `US($)`.
- **Decimals**: none by default for whole amounts (`Rp5.000.000`). Show 2 when the context needs
  precision — accounting, tax lines, invoice line items, base prices, exchange rates.
- **Currency code** (with a space) belongs in tabular or technical contexts where the code disambiguates
  the symbol: `IDR 1.000.000`, `USD 1,234.56`. Prefer the symbol form in body copy.

**Multi-currency in one view:** when a table shows amounts in different currencies side by side,
separator patterns visually mix (`Rp1.000.000` next to `US$1,234.56`). Flag it to the designer — a
column border, spacing, or currency badge helps the reader register the difference.

### Dates & time

**Date formats** (all DMY — day, month, year):

| Format  | 🇺🇸 EN            | 🇮🇩 ID            | 🇧🇷 PT-BR             | When to use                                                                        |
| ------- | ---------------- | ---------------- | -------------------- | ---------------------------------------------------------------------------------- |
| Full    | 17 August 2024   | 17 Agustus 2024  | 17 de agosto de 2024 | Reports, invoices, legally binding documents, business emails                      |
| Medium  | Mon, 17 Aug 2022 | Sen, 17 Agu 2022 | Seg, 17 ago 2022     | Date ranges, duration displays. Month picker: `Aug 2022` / `Agu 2022` / `ago 2022` |
| Numeral | 17/08/2022       | 17/08/2022       | 17/08/2022           | Only when space is critical (table index, tight fields). `DD/MM/YYYY`              |

Use a `0` prefix for single-digit dates: `01`, `02`, … `09`.

**Time** — 24-hour clock, colon separator, `0` prefix on hour and minute:

- Standard: `05:25`, `18:39`
- With seconds (countdowns, precise timestamps): `23:59:41`
- With timezone: `18:39 (GMT+7)` — only for a nationwide or multi-region audience
- Company timezone (settings picker): `GMT±HH:MM City, Country (Continent)` → `GMT+00:00 London, Europe`

**Month & day abbreviations** — 3 characters; when the full name is already 3 chars, keep as-is:

| Full (EN) | 🇺🇸 EN | 🇮🇩 ID | 🇧🇷 PT-BR |
| --------- | ----- | ----- | -------- |
| January   | Jan   | Jan   | jan      |
| February  | Feb   | Feb   | fev      |
| March     | Mar   | Mar   | mar      |
| April     | Apr   | Apr   | abr      |
| May       | May   | Mei   | mai      |
| June      | Jun   | Jun   | jun      |
| July      | Jul   | Jul   | jul      |
| August    | Aug   | Agu   | ago      |
| September | Sep   | Sep   | set      |
| October   | Oct   | Okt   | out      |
| November  | Nov   | Nov   | nov      |
| December  | Dec   | Des   | dez      |
| Monday    | Mon   | Sen   | Seg      |
| Tuesday   | Tue   | Sel   | Ter      |
| Wednesday | Wed   | Rab   | Qua      |
| Thursday  | Thu   | Kam   | Qui      |
| Friday    | Fri   | Jum   | Sex      |
| Saturday  | Sat   | Sab   | Sáb      |
| Sunday    | Sun   | Min   | Dom      |

> PT-BR month abbreviations are lowercase per Brazilian Portuguese convention (`jan`, `fev`).
> Day abbreviations follow the capitalized EN/ID pattern for consistency in tables.

**Duration abbreviations:**

- **Narrow space** (badges, tight cells) — 1-letter suffix, no spacing:
  - EN `2d 8h 3m 4s` · ID `2h 8j 3m 4d` (h=hari, j=jam, m=menit, d=detik) · PT-BR `2d 8h 3m 4s` (dia, hora, minuto, segundo)
- **Wider space** (help text, sentences) — partial abbreviation, with spacing:
  - EN `2 days 8 hours 3 mins 4 secs` · ID `2 hr 8 jm 3 mnt 4 dtk` · PT-BR `2 dias 8 horas 3 min 4 seg`

**Day + date + time:** `[Day], [dd] [Mon] [yyyy] [at/pada/às] [hh:mm]`

- EN `Tue, 1 Nov 2022 at 19:45` · ID `Sel, 1 Nov 2022 pada 19:45` · PT-BR `Ter, 1 Nov 2022 às 19:45`
- If space is tight, replace `at/pada/às` with a comma: `Tue, 1 Nov 2022, 19:45`

**Ranges:**

| Range           | Separator               | Example                           |
| --------------- | ----------------------- | --------------------------------- |
| Time range      | En dash, **no space**   | `8:00–10:30`                      |
| Date range      | En dash, **with space** | `1 Nov 2022 – 1 Nov 2023`         |
| Long-form range | `from ... to ...`       | `From 23 Nov 2022 to 24 Nov 2022` |

Date range works for same date, same year, same month, or mixed. Add the day name via the combination
pattern above when needed.

---
