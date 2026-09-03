# Language, translation & output

### Answer in English first

**Default: English only.** Settle the English wording before any other language exists. Add ID only when
it is actually needed, and PT-BR only after that.

|          | When to output it                                                                               |
| -------- | ----------------------------------------------------------------------------------------------- |
| 🇺🇸 EN    | Always. This is the in-app default language and what layouts are built against.                 |
| 🇮🇩 ID    | When asked, when the task is a translation or trilingual audit, or when the repo has `id.json`. |
| 🇧🇷 PT-BR | Same conditions, and only if the repo has `pt.json` or PT-BR was named explicitly.              |

**Do not lay out all three languages by default.** This matters most for term questions. When someone
asks which verb to use, answer with the English term and the reason — do not return the full trilingual
row unless they are translating. A three-language answer to a one-language question buries the point and
invites copy-pasting an ID or PT-BR string into a screen that does not ship in that language.

The trilingual tables in [core action verbs](verbs.md) and [component patterns](component-patterns.md) are a **lookup**, not an
output template. Read the row you need; print the column you were asked for.

### Translate the meaning, not the words

A literal translation that reads stiff is worse than a free one that reads natural. Word-for-word is not
the safe option — it is the option that produces copy no native speaker would say.

- **Test:** would a native speaker say this sentence out loud? If not, rewrite it, even if that means
  dropping a word the English had or adding one it did not.
- Differing sentence structure between languages is expected and fine. So is a different metaphor, a
  different verb, or a shorter phrasing, as long as the user takes away the same meaning and does the
  same next action.
- What must survive the translation: the **action**, the **object**, and whether the outcome is
  **reversible**. Everything else can move.

**Translate literally when the words themselves carry legal or financial weight** — billing terms, tax
lines, invoice fields, consent text, compliance notices, and anything the user has to match against an
external document. When in doubt on these, flag rather than paraphrase.

Terms marked _never translate_ in [core action verbs](verbs.md) stay English in every language.

### Length is a UI constraint, not a language detail

The in-app default is English, so **every layout is sized against the English string.** Indonesian
typically runs longer, sometimes far longer:

| 🇺🇸 EN          | 🇮🇩 ID                     | Growth | Where it hurts      |
| -------------- | ------------------------- | ------ | ------------------- |
| `Show less`    | `Tampilkan lebih sedikit` | +156%  | Button, fixed width |
| `Unassigned`   | `Belum ditugaskan`        | +60%   | Badge, very tight   |
| `Load more`    | `Muat lebih banyak`       | +89%   | Button              |
| `Save changes` | `Simpan perubahan`        | +33%   | Button              |

A translation that overflows a button, truncates a label mid-word, wraps a badge onto two lines, or
widens a table column past its neighbours is a **broken screen**, not just a long string. Treat it as
a UI bug you caused.

**Space, tightest to most forgiving:** badge and chip → button and CTA → tab and nav item → table column
header → placeholder → field label → inline error → tooltip → modal body → blank slate description.
The first four have no room to grow. The last three wrap safely.

### When the translation runs long

In this order:

1. **Look for a shorter natural phrasing.** Drop a redundant word, use the noun form instead of the verb
   phrase, or rely on context the English could not assume. `Tampilkan lebih sedikit` sitting directly
   beside `Tampilkan lebih banyak` can often become `Lebih sedikit` — the pair supplies the verb. Propose
   the shorter form, do not swap it in silently: term pairs change by human decision only ([core action verbs](verbs.md)).
2. **Check whether an approved shorter term already exists** in [core action verbs](verbs.md). Use that.
3. **Flag it.** If no natural short form exists, stop and raise it before shipping. Say which string,
   which component, which screen, the EN and ID lengths, and what visually breaks. Propose one or two
   alternatives and let the designer or writer decide.

**Never** silently truncate, invent an abbreviation the product does not already use, or force an
unnatural contraction to make something fit. A cramped but correct screen can be redesigned later;
wrong copy that fits ships as wrong copy.

Widening the component is a legitimate outcome — flag it to the designer rather than bending the
language around a box that was only ever sized for English.

All formatting rules in `formatting.md` and `numbers-and-time.md` apply to every language in scope, not just English.

**Voice:** second person — "You" / "Anda" / "Você". Never "we" when referring to the user.
**Tone:** direct, professional, calm. Not casual, not robotic.

---
