---
name: mekari-product-writing
description: >
  Product writing rules for Mekari interfaces: formatting, approved terms and verbs, component copy
  patterns, translation between English, Indonesian and Brazilian Portuguese, and number, currency and
  date formatting. ALWAYS load when any user-facing string is written, changed, or judged — from a
  screenshot, Figma link, PR diff, or plain text — even without the words "audit" or "review", and even
  when the request looks like a coding task. Load it for these too: a one-off wording fix by an engineer,
  designer, or PM rather than a writer; keys in en.json, id.json, or pt.json; translated text that runs
  long and breaks a button or badge; sentence case, punctuation, or article questions; choosing between
  Delete and Remove, Send and Submit, Add and Create; and copy for a modal, toast, tooltip, inline error,
  empty state, badge, or error page. For Mekari Qontak specifically, pair with qontak-product-writing.
---

# Mekari product writing

Product writing rules shared across Mekari interfaces. Everything here applies to any Mekari product.

Working on Mekari Qontak? Load **`qontak-product-writing`** as well. It carries the pillars and features,
Qontak-only terms, the audit workflow, and in-app landing pages, and it defers to this skill for
everything below.

## Pixel first (mandatory)

**Copy and component are one decision.** The period rule, the article rule, and the character budget all
depend on which component renders the string. Never resolve a component from memory — the design system
changes, and a wrong assumption produces confidently wrong copy.

**Call the Pixel MCP before you write or judge copy that touches a component.** All three cases:

| Situation                                                                                           | Call                                                                            | Why                                                                                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Copy introduces a **new UI element** (a tooltip that did not exist, a new empty state, a new modal) | `get-block` first for a whole section, then `get-component` for each `Mp*`      | The block is the composition blueprint. Do not rebuild a section from loose components.             |
| Copy lands in an **existing component** and you need its props, slots, or character behavior        | `get-component`                                                                 | Confirms the real slot (`#description` vs help text), which decides the period rule.                |
| **Reviewing whether something built matches Pixel** — a PR, a prototype, a screenshot               | `get-component` for every `Mp*` in the diff, `get-icon-name` for every `MpIcon` | The only way to tell a real prop from an invented one. Flag hardcoded values that should be tokens. |

`get-docs` for design-system guidance, `get-template` for page scaffolds, `get-icon-name` before any icon
name — never invent one.

**If the Pixel MCP is unavailable**, fall back to the `pixel` skill's reference docs rather than guessing:
`.agents/skills/pixel/SKILL.md` and its `references/`. Source: <https://ai.mekari.design/skills?skill=pixel>

### Which component renders which copy

A pointer, not a spec — resolve the real props via MCP.

| Copy element             | Pixel 3 component                              |
| ------------------------ | ---------------------------------------------- |
| Toast                    | `MpToast` (toast function)                     |
| Modal                    | `MpModal` + `MpModalBody`                      |
| Tooltip                  | `MpTooltip`                                    |
| Inline error             | `MpFormControl` (wraps `MpInput` / `MpSelect`) |
| Form help text / caption | `MpFormHelpText`                               |
| Checkbox description     | `MpCheckbox` `#description` slot               |
| Radio description        | `MpRadio` `#description` slot                  |
| Badge                    | `MpBadge`                                      |
| Section description      | `MpText` under a section header                |

**Modal body text** uses size `label` and color `text.default`. Do not use `body` + `text.secondary`.
Flag for designer confirmation before changing existing modals.

## Person and tone

Address the reader in the second person — "You" / "Anda" / "Você". Never "we" when referring to them.

Direct, professional, calm. Not casual, not robotic.

## Where the rules live

Read the file that matches the question. Each is self-contained.

| Read                                                                 | For                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [references/formatting.md](references/formatting.md)                 | Concision, sentence case, periods per component, exclamation marks, em dash, contractions, articles, inclusive language                                                                                                                                                   |
| [references/translation.md](references/translation.md)               | English first, translating meaning over words, and translated length as a UI constraint                                                                                                                                                                                   |
| [references/numbers-and-time.md](references/numbers-and-time.md)     | Numerals, empty and zero values, math symbols, currency, dates, time, durations, ranges                                                                                                                                                                                   |
| [references/verbs.md](references/verbs.md)                           | Core action verbs in EN/ID/PT-BR, Delete vs Remove, Add vs Create, phrasal verb hyphenation                                                                                                                                                                               |
| [references/product-terms.md](references/product-terms.md)           | Mekari One terminology, navigation labels, standard input labels                                                                                                                                                                                                          |
| [references/component-patterns.md](references/component-patterns.md) | Grouped by inputs, actions, feedback, data display, navigation. Inline error, select, checkbox, toggle, date picker, button, toast, tooltip, modal, drawer, deletion, duplication, blank slate, error states, coachmark, OTP, badge, timeline, tabs, stepper, breadcrumbs |

Answer in English by default. Add Indonesian only when the surface ships it, and Brazilian Portuguese only
after that — never all three at once unless the task is a translation or a trilingual audit.

## This is a default, not a ceiling

When a product decision reads better than a rule here, follow the decision, say which rule it departs
from, and flag that this skill needs updating.

Brazilian Portuguese has not been validated by a native speaker. When generating it, keep it grammatically
correct, natural, and never witty or tonally off, and flag it for validation before shipping.
