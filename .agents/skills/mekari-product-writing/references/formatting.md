# Formatting rules

### Concision

**Every string fits on a single line where it can.** Say the thing once, in as few words as it takes to be
clear, then stop. This governs **every component in this skill**, not only the ones carrying an explicit
length note: button labels, tooltips, modal body, inline errors, empty states, landing page value props,
FAQ answers.

Length limits are set per component in the table below and they are binding. Concision governs how you
use the space inside them — a string that fits is not automatically finished. The test is the three audit
categories from [audit output format](../../qontak-product-writing/references/audit.md):

- **Concise** — every word is doing work. Cut anything that repeats what is already on screen.
- **Clarity** — shorter must not become vaguer. If cutting a word makes the reader guess, keep the word.
- **Consistent** — the same idea is phrased the same way everywhere in the feature.

When concision and clarity pull against each other, clarity wins. That is an escape hatch, not a default:
reach for it after cutting the padding, not instead of cutting it.

### Length limits

Binding. Where a string exceeds its limit, shorten it or change the component — do not ship the overflow.
Indonesian and Brazilian Portuguese run longer than English, so a string at the English limit will breach
it once translated: see [translation.md](translation.md).

> **Where these come from, and what they are not.** They are inherited from the Mekari copy library and
> the April 2025 Component Guidelines, reconciled in Aug 2026. **Pixel does not publish length limits** —
> `get-component` on `MpBadge` and `MpInput` returns props, slots, and variants, and says nothing about
> how long a string may be. So this table does not compete with Pixel; it is the only source there is.
>
> Treat the numbers as guidance on scanability rather than a rendering limit. `MpInput` is full width by
> default, so how much actually fits is set by the parent container, not the component — the same
> placeholder fits a wide form and overflows a narrow one.
>
> **The rendered screen outranks the table.** If a string truncates, wraps, or crowds its neighbour in the
> prototype, that is the answer regardless of the count. Report the mismatch so the number gets fixed
> upstream in the Mekari guideline rather than patched here.

A limit is a ceiling, not a target. A string that fits is not automatically finished — see
[Concision](#concision).

| Component          | Part                  | Limit                             |
| ------------------ | --------------------- | --------------------------------- |
| Text field         | Label                 | 4 words                           |
| Text field         | Placeholder           | 40 characters                     |
| Text field         | Caption               | 60 characters                     |
| Text field         | Error message         | 60 characters                     |
| Text field         | Static suffix         | 1 word                            |
| Text area          | Label                 | 4 words, 3 preferred              |
| Text area          | Placeholder           | 100 characters                    |
| Text area          | Caption               | 60 characters                     |
| Select             | Label                 | 4 words                           |
| Select             | Placeholder           | 30 characters                     |
| Select             | Caption, error        | 60 characters                     |
| Radio, checkbox    | Title, option label   | 4 words                           |
| Radio, checkbox    | Error message         | 60 characters                     |
| Toggle             | Label                 | 5 words                           |
| Input tag          | Label                 | 4 words                           |
| Input tag          | Placeholder           | 40 characters                     |
| Segmented control  | Label                 | 2 words                           |
| Button             | Label                 | 3 words, 4 maximum                |
| Toast              | Message               | 60 characters                     |
| Modal              | Title                 | 5 words                           |
| Modal              | Description           | 100 characters                    |
| Tooltip            | Label tooltip         | 40 characters                     |
| Tooltip            | Informational tooltip | 150 characters                    |
| Alert banner       | Title                 | 6 words                           |
| Alert banner       | Action link           | 3 words                           |
| In-line alert      | Description           | 2 rows, 2 sentences               |
| In-line alert      | Action link           | 3 words                           |
| Blank slate        | Title                 | 50 characters                     |
| Blank slate        | Description           | 60 characters                     |
| Badge              | Label                 | 2 words                           |
| Table              | Column header         | 3 words                           |
| Tab                | Label                 | 3 words                           |
| Stepper            | Step label            | 3 words                           |
| Breadcrumb         | Label                 | 3 to 4 words                      |
| Popover            | Label                 | 1 to 3 words                      |
| Timeline           | Entry label           | 40 characters, excluding username |
| Progress indicator | Actionable text       | 3 words                           |

The one exception is a label the user typed themselves — a custom tab or field name is theirs, not ours.

### Truncation

**Default is not to truncate.** A label that does not fit is too long — shorten the copy or widen the
component. Cutting text is a last resort, not a layout tool.

**Never truncate copy we wrote.** Tabs, breadcrumbs, buttons, badges, menu labels, headings, and every
other string in the length table are ours to make fit. If one needs an ellipsis, the wording is wrong.

**Truncate only values we do not control** — an object name, a file name, a search term someone typed.
A customer can name their team anything, so the interface has to cope with it.

**When you truncate, the full value must stay reachable.** An ellipsis with the full value on hover, or
the full value on the detail view the row links to. A cut-off name with no way back destroys the thing the
user needs in order to tell one item from another. The mechanics live in `mekari-taste` —
`references/index-view.md` for table cells, `references/detail-view.md` for long free text.

**One exception, where nothing can be reached:** the deletion flow. The object **name** is cut at
**57 characters** in the modal body and the toast, with no hover. A modal is a decision made in the moment
and a toast disappears, so neither can carry a tooltip. The object **type** is never cut, so `Delete team?`
still says what kind of thing is going even when the name is clipped.

> Like the numbers above, 57 is inherited and its origin is not recorded. Treat it as a working number
> rather than a measured one, and let the rendered screen outrank it.

### Title and description must not repeat each other

Wherever a component pairs a title with a description — blank state, modal, in-line alert, banner,
accordion, section header — they do different jobs. The title carries the main idea. The description
carries what follows from it: the impact, the next action, or the way out.

A description that restates its title costs a line and returns nothing. `No ad campaigns yet` above
`Your ad campaign list will appear here.` is two sentences saying one thing.

Test each pair by covering the title. If the description still tells you something you did not already
know, it earns its place.

### Sentence case

Only the first word and proper nouns are capitalized. When auditing, **flag any title case** that is
not a proper noun, product name, feature name, channel name, or plan name.

This applies mid-sentence too — match the exact casing of the menu or nav label when referencing it
in body copy: `Go to Campaigns to create a broadcast message`, not `Go to campaigns...`.

Proper nouns in Qontak — always capitalized, listed in full in [core action verbs](verbs.md):
features (Inbox, Campaign, Voice, Customers, Bot, Deal, Knowledge base, Subscription),
channels (WhatsApp, Instagram, Tokopedia, Email), plans (Broadcast, Sales Suite, Service Suite, Qontak 360).

**Parenthetical tags trailing a name are lowercase:** `Voice of customer report (add-on)`, not `(Add-on)`.
The same word is capitalized when it opens a heading (`Add-ons` section header) — position decides, so
both can be correct on one screen. Capitalize a parenthetical only when it is rendered as an actual
`MpBadge`, where badge terms take an initial capital.

### Periods, per component

| Component                                             | Rule                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast                                                 | No period if single sentence. If 2 sentences: period after the first only, none at the end.                                                                   |
| Caption / `MpFormHelpText`                            | Same as toast.                                                                                                                                                |
| Inline error                                          | Same as toast.                                                                                                                                                |
| Tooltip                                               | Period only if it is a complete sentence. Fragments and labels (`Select payment method`) take none. Two sentences: period after the first **and** at the end. |
| Pixel 3 `#description` slot (`MpCheckbox`, `MpRadio`) | Always ends with a period. Distinct from generic caption/help text.                                                                                           |
| Section description (`MpText` under a section header) | Full sentences with periods. Period required at the end.                                                                                                      |
| Modal body                                            | Full sentences with periods. Period required at the end.                                                                                                      |
| Button, tab, breadcrumb, stepper label, badge         | No period. These are labels, not sentences.                                                                                                                   |
| Drawer title                                          | No period.                                                                                                                                                    |
| Timeline entry                                        | No period. Past tense.                                                                                                                                        |
| Blank slate description                               | **Always ends with a period**, including a single sentence. A 2-sentence description ends with one too. Does not follow the toast rule.                       |

> **Rationale:** single-sentence UI strings act as labels — periods make them feel cluttered. When two
> sentences appear together, the period between them separates them, but the final one stays off to keep
> the UI light. Tooltips, `#description` slots, section descriptions, modal body, and blank slate
> descriptions are exceptions because they are standalone explanatory prose, not labels.

### Characters and word forms

- **No `!`** in any language.
- **No contractions.** Write `will not`, `cannot`, `does not`, `is not`, `you are` — never `won't`,
  `can't`, `doesn't`, `isn't`, `you're`. Code comments are exempt; only rendered copy matters.
- **No em dash (—) as prose punctuation** — not in labels, descriptions, tooltips, banners, modal body,
  empty states, or captions. Replace with a period (split into two sentences), a comma, or rephrase.
  This does **not** ban the em dash as an empty-value placeholder in a table cell, where it stands in for
  a value rather than punctuating a sentence — see [Empty and zero values](numbers-and-time.md).
- **"All [noun]" filter placeholders take the plural**: `All statuses`, not `All status`. `All dates`,
  `All types`, `All channels`, `All categories`.
- **Required field label** — asterisk immediately after the label, no space: `Email*`, never `Email *`.
  Applies across all languages in scope.

### Inclusive language

Avoid jargon that assumes technical knowledge. **Rule of thumb:** if the word would not appear in a
conversation with a non-technical colleague, replace it. When in doubt, describe the experience
("takes too long") rather than the system state ("timeout").

| Avoid (EN)      | Use (EN)                         | ID                       | PT-BR                 |
| --------------- | -------------------------------- | ------------------------ | --------------------- |
| fetch           | load                             | muat                     | carregar              |
| valid / invalid | correct / incorrect, or rephrase | benar / salah            | correto / incorreto   |
| refresh         | reload                           | muat ulang               | recarregar            |
| parse           | read / process                   | baca / proses            | ler / processar       |
| authenticate    | sign in                          | sign in                  | entrar                |
| unauthorized    | no access                        | tidak ada akses          | sem acesso            |
| timeout         | takes too long                   | terlalu lama             | demora muito          |
| null / empty    | blank / no value                 | kosong / tidak ada nilai | em branco / sem valor |

Rows are lowercase; capitalize at the start of a sentence, in a button label, or per the component's
casing rule. `sign in` stays English in ID per Mekari convention. In EN, `sign in` is the verb and
`sign-in` the noun/adjective — see the phrasal verb note in [core action verbs](verbs.md).

### Articles (a, an, the)

| Context                | Use articles?   | Why                                                                                                           |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| Inline error           | Yes             | Full imperative sentence. Articles make it grammatical and natural.                                           |
| Modal body             | Yes             | Full prose. Reads as a complete statement.                                                                    |
| Toast                  | Yes             | Full sentence describing what happened.                                                                       |
| Placeholder text       | No              | Hint text, not a sentence. Articles add length without value; space is limited and users scan.                |
| Button                 | No              | Action label, compact by design. `Save changes`, not `Save the changes`.                                      |
| UI label / field label | No              | Structural text. Articles clutter the scan path.                                                              |
| Tooltip                | Assess per case | Complete sentence → articles naturally. Short label or fragment → omit. Flag if dropping it sounds unnatural. |
| Caption / help text    | Assess per case | Same as tooltip.                                                                                              |

**a/an vs the:**

- **a / an** — the user has not selected or entered anything yet. Most common in inline errors and
  empty-state prompts: `Select a product`, `Enter an agent name`.
- **the** — a specific item the user already selected or is acting on. Most common in modal body and
  confirmations: `The invoice will be sent to your email`, `The subscription will renew on the next billing cycle`.
- When the object name is shown directly, no article and no quotes: `Mekari Solusi added as admin`.
  For deletion specifically see the deletion pattern in `qontak-product-writing/references/pattern-overrides.md`.

**Examples:**

- ✅ `Enter a valid email` — inline error, article needed for grammar
- ✅ `The changes will apply immediately.` — modal body, full sentence
- ✅ `Save changes` — button, article dropped
- ✅ `Search deal name` — placeholder, article and preposition dropped
- ✅ `Select a payment method to continue.` — tooltip, complete sentence
- ✅ `Select payment method` — tooltip, fragment

---
