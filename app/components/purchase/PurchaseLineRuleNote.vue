<template>
  <!-- Purchase Price Rule note under a line's Discount input. Two lines at
       most, so the line row grows by the same amount as the "See past prices"
       link under Unit price and no more:
         rule applied   → "Rule: <name>" (truncated, full name + tier in the
                          tooltip) / the tier label
         edited by user → "Edited manually" / "Reset to rule" (the link only
                          while a rule still matches — e.g. after a vendor
                          switch the manual value stays, with nothing to
                          reset to)
       Quiet label-small text, not an MpBadge — this annotates a value, it is
       not a status (docs/patterns/StatusBadge.md § Gotchas). -->
  <div :class="noteClass">
    <template v-if="isEdited">
      <MpText size="label-small" color="gray.600">Edited manually</MpText>
      <MpTextlink
        v-if="match"
        as="button"
        variant="primary"
        :class="textlinkCellClass"
        @click="emit('reset')"
      >
        Reset to rule
      </MpTextlink>
    </template>
    <template v-else-if="match">
      <MpTooltip :label="tooltipLabel" placement="top" use-portal>
        <MpText size="label-small" color="gray.600" is-truncated :class="fitClass">
          Rule: {{ match.rule.name }}
        </MpText>
      </MpTooltip>
      <MpText size="label-small" color="gray.600" is-truncated :class="fitClass">{{
        tierLabel
      }}</MpText>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpText, MpTextlink, MpTooltip } from "@mekari/pixel3";
import {
  PURCHASE_RULE_TIER_LABEL,
  type PurchaseRuleMatch
} from "~/composables/usePurchasePriceRule";
import { textlinkCellClass } from "~/utils/textlink-align";

const props = defineProps<{
  /** The rule resolved for this line (see `resolvePurchaseRule`). */
  match: PurchaseRuleMatch | null;
  /** The user changed the discount away from the rule's value. */
  isEdited: boolean;
}>();

const emit = defineEmits<{
  /** Put the rule's discount back on the line. */
  reset: [];
}>();

const tierLabel = computed(() => (props.match ? PURCHASE_RULE_TIER_LABEL[props.match.tier] : ""));
const tooltipLabel = computed(() =>
  props.match ? `${props.match.rule.name} · ${tierLabel.value}` : ""
);

// All css() below uses Pixel 3 token shortcuts only (token mode 2.1).
// The cell inherits white-space:nowrap, so the rule name is truncated rather
// than wrapped (a wrapped name would make the row 3-4 lines tall). `fitClass`
// caps each text at the column width so `is-truncated` has an edge to clip at.
const noteClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.5",
  mt: 1,
  minWidth: "0",
  maxWidth: "full"
});
const fitClass = css({ maxWidth: "full" });
</script>
