# Finding schema — the reviewer's output contract

Every issue Pixel Police raises is a **Finding**. Report findings as a list,
most-severe first.

| Field              | Values / rule                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | short slug, e.g. `token-hardcoded-color`                                                                                                                                        |
| `title`            | one short line — the claim alone, no rationale                                                                                                                                  |
| `dimension`        | `pixel-component` · `pixel-token` · `pattern` · `consistency` · `state-coverage` · `ux-flow` · `copy` · `a11y` · `prd-coverage` · `undocumented-behavior`                       |
| `category`         | `design-guideline-violation` · `missing-requirement` · `undocumented-behavior` · `ux-flow-violation` · `ambiguous-requirement` · `missing-edge-case` · `needs-product-decision` |
| `classification`   | `confirmed-gap` · `potential-gap` · `cannot-verify` · `intentional-exception-candidate`                                                                                         |
| `severity`         | `high` · `medium` · `low`                                                                                                                                                       |
| `evidence`         | what you observed — `file:line`, or the screenshot region, or the PRD quoted **verbatim** and contiguous so it's Ctrl+F-able; else `null`                                       |
| `guideline`        | the rule it breaks **plus its source** (`docs/design.md §8.4`, `docs/patterns/TablePage.md`, MCP `get-component`, `references/rules.md`, `scripts/pixel-review-principles.md`)  |
| `fix`              | the concrete on-system replacement — component, prop, token, or copy                                                                                                            |
| `decisionQuestion` | when it's a judgement call: the question for the human                                                                                                                          |
| `suggestedOwner`   | `Product Manager` · `Product Designer` · `Engineer` · `Joint decision`                                                                                                          |

## Rules

- **Cite real evidence.** Every finding points at a real line, a real rule in
  `docs/`, or a real MCP lookup. Never invent a requirement, component or token.
- **Absence is not proof.** If something couldn't be seen (a state you can't
  reach, a screenshot that crops it), mark `cannot-verify` — don't assert it's
  missing.
- **Guidelines are defaults, not laws.** When the design deviates deliberately,
  raise it as `intentional-exception-candidate` with a `decisionQuestion`
  instead of declaring it wrong.
- **Every finding is actionable.** A concrete `fix` for a hard rule, or a
  `decisionQuestion` plus `suggestedOwner` for a judgement call.
- **Don't pad to a number.** A short list of well-evidenced findings beats a
  long list of thin ones — but never skip a whole dimension because another one
  looked fine.
- **Separate the tiers.** Say plainly which findings the gate caught
  mechanically and which are your own reading; the human weighs them
  differently.

## Compact report shape

```
HIGH · pixel-token · confirmed-gap
  Hardcoded gradient on the add-ons card
  evidence  app/components/home/HomeAddOns.vue:55
  guideline docs/design.md §8.4 — colours resolve to a --mp-* token
  fix       replace with var(--mp-colors-blue-*) stops, or document the brand
            gradient in docs/tokens.md §10 and mark the line pixel-police-allow

MEDIUM · a11y · potential-gap
  …
```
