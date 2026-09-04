#!/usr/bin/env bash
#
# Pixel Police — the final compliance gate for pixel-jurnal.
#
# Fails on NEW Pixel token/component violations introduced by a change. It only
# inspects the lines ADDED in the diff against a base ref, so the repo's
# existing exceptions never block a push or a merge — only newly-written
# violations do.
#
# Usage:
#   scripts/pixel-police.sh            # vs. merge-base with origin/main (or main)
#   scripts/pixel-police.sh <base-ref> # vs. an explicit base ref/sha
#
# Escape hatch: append `pixel-police-allow` as a trailing comment on a line that
# is a deliberate, documented exception. Use it sparingly — and document the
# exception in docs/ in the same change.
#
# Rules (sources in docs/):
#   1. Hardcoded color                  -> Pixel token       (docs/tokens.md §1)
#   2. Raw <button|input|select|textarea> -> Mp component     (docs/design.md §7)
#   3. Inline style="" / :style=""      -> css()             (docs/README.md)
#   4. <style> block in an SFC          -> css()             (docs/README.md)
#   5. Hardcoded px spacing/type        -> token shorthand    (docs/design.md §8)
#   6. Non-@mekari/pixel3 import        -> @mekari/pixel3     (docs/design.md §7)
#   7. setNextTheme(true)               -> stay on 2.1        (docs/tokens.md)

set -uo pipefail

BASE_INPUT="${1:-}"

# Resolve a usable base commit. A CI "before" sha can be all-zeros (new branch)
# or unreachable; fall back to the merge-base with origin/main, then main, then
# HEAD~1.
resolve_base() {
  local b="$1"
  if [[ -n "$b" && "$b" != "0000000000000000000000000000000000000000" ]] \
     && git cat-file -e "${b}^{commit}" 2>/dev/null; then
    echo "$b"; return
  fi
  if git rev-parse --verify -q origin/main >/dev/null; then
    git merge-base origin/main HEAD 2>/dev/null && return
  fi
  if git rev-parse --verify -q main >/dev/null; then
    git merge-base main HEAD 2>/dev/null && return
  fi
  git rev-parse HEAD~1 2>/dev/null || git rev-parse HEAD
}

BASE="$(resolve_base "$BASE_INPUT")"
echo "Pixel Police: checking added lines since ${BASE:0:12}"

fail=0

# Only .vue files that changed in the range. `while read` (not mapfile) so this
# runs on macOS's bash 3.2 as well as the CI runner's; process substitution
# keeps `fail` in the current shell.
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  [[ -f "$f" ]] || continue   # skip deletions

  # Added lines only: keep '+' lines, drop the '+++ b/file' header, strip the
  # '+', then drop comment-only lines so prose about a rule never trips it.
  added="$(git diff --unified=0 "$BASE"...HEAD -- "$f" \
    | grep '^+' | grep -v '^+++' | sed 's/^+//' \
    | grep -vE '^[[:space:]]*(//|/\*|\*|<!--)' || true)"
  [[ -z "$added" ]] && continue

  file_msgs=""

  # check <regex> <message> [allow-regex]
  check() {
    local hits
    hits="$(grep -E "$1" <<<"$added" || true)"
    if [[ -n "${3:-}" ]]; then
      hits="$(grep -vE "$3" <<<"$hits" || true)"
    fi
    hits="$(grep -v 'pixel-police-allow' <<<"$hits" || true)"
    if [[ -n "$hits" ]]; then
      file_msgs+="  ✗ $2"$'\n'
      file_msgs+="$(sed 's/^[[:space:]]*/       + /' <<<"$hits" | head -3)"$'\n'
    fi
  }

  # 1. Colors resolve to a Pixel token — hex/rgb/hsl literals are a review block
  #    (docs/design.md §8.4). The one sanctioned literal is the horizontal
  #    scroll-shadow gradient on wide tables, which pairs an rgba fade with
  #    var(--mp-colors-white) and has no token equivalent.
  check '(#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{8}\b|\brgba?\(|\bhsla?\()' \
        'Hardcoded color — use a Pixel token: var(--mp-colors-*) or a css() shorthand (bg: "gray.25")' \
        'linear-gradient\(to (right|left), var\(--mp-colors-white\)'

  # 2. Raw HTML controls must be Pixel components. Two documented exceptions:
  #    the sortable table header button (docs/patterns/TablePage.md) and the
  #    own search-clear button (docs/patterns/FilterBar.md) — MpInput's native
  #    is-clearable emits `undefined` and can't be used.
  check '<(button|input|select|textarea)[ >]' \
        'Raw HTML control — use MpButton / MpInput / MpSelect / MpTextarea (sort header + search clear are the only documented exceptions)' \
        'sortHeaderClass|data-search-clear'

  # 3. No inline CSS (docs/README.md → Conventions; docs/design.md §8.1). The
  #    <colgroup> column widths are the one exception — table-layout: fixed
  #    needs authoritative per-<col> widths (docs/patterns/TablePage.md).
  check '[[:space:]]:?style="' \
        'Inline style — use css(); only <col> widths in a colgroup may be inline' \
        '<col[ /]'

  # 4. Page/component styling is css() only — a <style> block in an SFC is off
  #    the pattern (the app shell in app/components/sidebar is the legacy one).
  check '<style[ >]' \
        'A <style> block in an SFC — styling is css() only (docs/README.md → Conventions)'

  # 5. Spacing and type always resolve to a token. Layout sizes taken straight
  #    from Figma (width/height/top) may stay px, per docs/design.md §8.3.
  check '(padding|margin|gap|font-size|fontSize|line-height|lineHeight|border-radius|borderRadius)[A-Za-z-]*:[[:space:]]*"?[0-9]+px' \
        'Hardcoded px spacing/type — use a token or css() shorthand (gap: 4, p: 4, var(--mp-spacing-*))'

  # 6. One component library.
  # `[^3]` also covers the bare `@mekari/pixel'` — anything but pixel3 is out.
  check "from ['\"]@mekari/pixel[^3]" \
        'Non-Pixel3 import — components come from @mekari/pixel3 only (docs/design.md §7)'

  # 7. Jurnal is pinned to Pixel 3 token mode 2.1.
  check 'setNextTheme\([[:space:]]*true' \
        'Token mode 2.4 enabled — Jurnal runs mode 2.1 (app/app.vue → setNextTheme(false))'

  if [[ -n "$file_msgs" ]]; then
    echo ""
    echo "🚨 $f"
    printf '%s' "$file_msgs"
    fail=1
  fi
done < <(git diff --name-only "$BASE"...HEAD -- '*.vue')

echo ""
if [[ $fail -eq 0 ]]; then
  echo "✅ Pixel Police: no new token/component violations in changed .vue files."
else
  echo "❌ Pixel Police: new violations above must be fixed before merge."
  echo "   Only newly-added lines are checked — pre-existing code is not flagged."
  echo "   Deliberate exception? Add a trailing 'pixel-police-allow' comment and"
  echo "   document it in docs/ in the same change."
fi
exit $fail
