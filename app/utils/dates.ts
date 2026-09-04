// Date conversion for the app's two date-only string formats.
//
// There are exactly two, and every screen uses both:
//
//   - **`DD/MM/YYYY`** — what a person types, and what `MpDatePicker` binds
//     when it is given `value-type="string"` + `:format="DATE_INPUT_FORMAT"`.
//   - **`YYYY-MM-DD`** — what a record stores (`transactionDateSort`,
//     `dueDateSort`, …). Sorts and compares correctly as a plain string, which
//     is the whole reason it exists.
//
// These six helpers were previously copy-pasted into seven files: the six
// Purchase form components and `purchase-filter.ts`, which had quietly
// diverged. The filter's `dmyToIso` validated the year length and padded the
// month and day; the forms' did neither. So `1/7/2026` became `2026-7-1` in a
// form (which compares wrong against a padded `2026-07-01`) and `""` in the
// filter. The validating, padding behaviour is the definition kept here.
//
// **Never use `Date#toISOString()` for a date-only value.** It converts to UTC
// first, so local midnight becomes the previous day in any timezone ahead of
// UTC (this project's browser runs at UTC+7). `new Date("yyyy-mm-dd")` has the
// mirror-image bug: the spec parses it as UTC midnight, which lands on the
// previous local day for viewers behind UTC. Both directions are handled below
// by reading and writing local calendar fields only — that is what
// `toLocalIsoDate` and `parseLocalIsoDate` are for, and why neither is a
// one-liner around the built-ins.

/** The typed/edited date format for `MpDatePicker` — an input mask, not a
 *  display format, so it is allowed to differ from how a date is *rendered*
 *  (`formatDisplayDate` in `~/data/purchase-transactions` writes `21 Aug 2026`). */
export const DATE_INPUT_FORMAT = "DD/MM/YYYY";

function pad2(value: string | number): string {
  return String(value).padStart(2, "0");
}

/** `Date` → `DD/MM/YYYY`, from local calendar fields. */
export function toDmy(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * `DD/MM/YYYY` → `YYYY-MM-DD`, so a typed date compares against a stored
 * `*Sort` field as a plain string.
 *
 * Returns `""` for anything unparseable — a half-typed date, an empty field, a
 * `null`. Callers read that as "no date" / "no bound", which is why this must
 * never return a partial result: `2026-7-1` would compare as *later* than
 * `2026-12-01` in a string comparison.
 */
export function dmyToIso(dmy: string): string {
  const parts = String(dmy ?? "").split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** The inverse, for seeding a date field from a stored value. `""` when the
 *  input isn't a full date, matching `dmyToIso`. */
export function isoToDmy(iso: string): string {
  const parts = String(iso ?? "")
    .slice(0, 10)
    .split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

/** `Date` → `YYYY-MM-DD` from the date's *local* calendar fields. See the
 *  `toISOString` warning at the top of this file. */
export function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** `YYYY-MM-DD` → a local-midnight `Date`. The components are parsed by hand
 *  rather than handed to `new Date(string)`; see the warning at the top. */
export function parseLocalIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}
