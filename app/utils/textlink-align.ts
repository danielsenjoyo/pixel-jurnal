import { css } from "@mekari/pixel3";

// Alignment classes for MpTextlink.
//
// MpTextlink renders a <button>, and the Pixel recipe gives that button 2px of
// inline padding. Everything a link is normally stacked against — the field
// label above it, the description beneath it, the column header over it, the
// figure it sits under — is plain text with no such padding. So the link's
// glyphs land 2px inside every edge its neighbours sit on. In one place that
// is invisible; repeated down a table column or across a page of meta fields
// it reads as a wobble.
//
// The padding cannot be removed from the call site. It is declared
// `!important` inside `@layer pixel_recipes`, and for `!important` declarations
// the layer cascade runs in REVERSE — so `pixel_recipes` outranks a Panda
// utility in the later `@layer pixel_utilities` (see the layer order pinned at
// the top of `app/assets/css/global.css`). A plain inline style loses to any
// `!important` too. Both `pl: "0!"` and `element.style.paddingLeft` were tried
// and both failed SILENTLY: the class lands on the element and the computed
// padding stays 2px.
//
// So the padding stays and the box moves instead. A negative inline margin has
// no competing declaration, so it simply applies. Cancelling on both sides
// means the outer edges of the box land exactly where the text edges would sit
// with no padding at all — which is why one class serves left-aligned links
// (vendor, product, record numbers) and right-aligned ones ("View journal
// entry" under a right-aligned total) alike. The 2px still does its real job
// of keeping the focus ring off the glyphs.
//
// Lives in one module rather than per page because all eight purchase detail
// pages need it identically, and a 2px fix duplicated eight times is a 2px fix
// that will drift. See docs/patterns/TablePage.md.

/** Cancels MpTextlink's 2px inline padding so a bare link's text edges line up
 *  with the plain text around it. For links that are NOT inside a table cell. */
export const textlinkAlignClass = css({ ml: "-2px", mr: "-2px" });

/** The same cancel, plus the wrap rules a link needs inside a table cell.
 *
 *  Replaces `wrapInlineClass` on MpTextlink only — that class is also used on
 *  MpTag, which is not a button, carries its own deliberate padding, and would
 *  be pulled out of line by the negative margin. */
export const textlinkCellClass = css({
  whiteSpace: "normal!",
  wordBreak: "break-word",
  maxWidth: "full",
  display: "inline-block",
  textAlign: "left",
  ml: "-2px",
  mr: "-2px",
});
