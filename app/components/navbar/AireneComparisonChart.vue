<template>
  <Pixel.div class="airene-comparison-chart" :class="chartShellClass">
    <Pixel.div :class="chartHeaderClass">
      <MpText size="label" color="gray.900" :class="css({ fontWeight: 'semiBold' })">
        {{ chart.title }}
      </MpText>

      <Pixel.div :class="chartLegendClass">
        <Pixel.div :class="chartLegendItemClass">
          <Pixel.div :class="augustMarkerClass" />
          <MpText size="label" color="gray.600" :class="chartLegendTextClass">August</MpText>
        </Pixel.div>
        <Pixel.div :class="chartLegendItemClass">
          <Pixel.div :class="septemberMarkerClass" />
          <MpText size="label" color="gray.600" :class="chartLegendTextClass">September</MpText>
        </Pixel.div>
      </Pixel.div>
    </Pixel.div>

    <svg
      class="airene-comparison-svg"
      role="img"
      :aria-label="chart.title"
      :viewBox="`0 0 ${chartViewBoxWidth} ${chartViewBoxHeight}`"
    >
      <g v-for="gridLine in chartGridLines" :key="gridLine">
        <line
          class="airene-comparison-grid"
          :x1="getGridX(gridLine)"
          :x2="getGridX(gridLine)"
          :y1="0"
          :y2="chartViewBoxHeight"
        />
      </g>

      <g v-for="(group, index) in comparisonGroups" :key="group.metric">
        <text
          class="airene-comparison-label"
          :x="0"
          :y="getMetricLabelY(index)"
          dominant-baseline="middle"
        >
          {{ group.metric }}
        </text>

        <rect
          class="airene-comparison-track"
          :x="chartPlotX"
          :y="getBeforeBarY(index)"
          :width="chartPlotWidth"
          :height="chartBarHeight"
          :rx="chartBarRadius"
        />
        <rect
          class="airene-comparison-bar airene-comparison-bar-august"
          :x="chartPlotX"
          :y="getBeforeBarY(index)"
          :width="getBarWidth(group.before.value)"
          :height="chartBarHeight"
          :rx="chartBarRadius"
        />
        <text
          class="airene-comparison-value airene-comparison-value-august"
          :x="chartValueX"
          :y="getBarTextY(getBeforeBarY(index))"
          dominant-baseline="middle"
        >
          {{ group.before.displayValue }}
        </text>

        <rect
          class="airene-comparison-track"
          :x="chartPlotX"
          :y="getAfterBarY(index)"
          :width="chartPlotWidth"
          :height="chartBarHeight"
          :rx="chartBarRadius"
        />
        <rect
          class="airene-comparison-bar airene-comparison-bar-september"
          :x="chartPlotX"
          :y="getAfterBarY(index)"
          :width="getBarWidth(group.after.value)"
          :height="chartBarHeight"
          :rx="chartBarRadius"
        />
        <text
          class="airene-comparison-value airene-comparison-value-september"
          :x="chartValueX"
          :y="getBarTextY(getAfterBarY(index))"
          dominant-baseline="middle"
        >
          {{ group.after.displayValue }}
        </text>
      </g>
    </svg>
  </Pixel.div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, Pixel, MpText } from "@mekari/pixel3";
import type { AireneChart } from "~/data/airene-answers";

const props = defineProps<{
  chart: AireneChart;
}>();

type ChartItem = AireneChart["items"][number];

interface ComparisonGroup {
  metric: string;
  before: ChartItem;
  after: ChartItem;
}

const comparisonGroups = computed<ComparisonGroup[]>(() => {
  const groups = new Map<string, { before?: ChartItem; after?: ChartItem }>();

  for (const item of props.chart.items) {
    const metric = getMetricLabel(item.label);
    const group = groups.get(metric) ?? {};

    if (isSeptember(item.label)) group.after = item;
    else group.before = item;

    groups.set(metric, group);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.before && group.after)
    .map(([metric, group]) => ({
      metric,
      before: group.before as ChartItem,
      after: group.after as ChartItem
    }));
});

const chartMaxValue = computed(() =>
  Math.max(...comparisonGroups.value.flatMap((group) => [group.before.value, group.after.value]), 0)
);

const chartViewBoxWidth = 640;
const chartPlotX = 108;
const chartPlotWidth = 360;
const chartValueX = 492;
const chartBarHeight = 8;
const chartBarGap = 14;
const chartBarRadius = 4;
const chartGroupHeight = 74;
const chartTopOffset = 12;
const chartGridLines = [0, 0.25, 0.5, 0.75, 1];

const chartViewBoxHeight = computed(() =>
  Math.max(118, chartTopOffset + comparisonGroups.value.length * chartGroupHeight)
);

function isSeptember(label: string) {
  return /\b(September|Sep)\b/i.test(label);
}

function getMetricLabel(label: string) {
  return label
    .replace(/\b(August|Agustus|Aug|September|Sep)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^GP$/i, "Gross Profit");
}

function getBeforeBarY(index: number) {
  return chartTopOffset + index * chartGroupHeight;
}

function getAfterBarY(index: number) {
  return getBeforeBarY(index) + chartBarHeight + chartBarGap;
}

function getMetricLabelY(index: number) {
  return getBeforeBarY(index) + chartBarHeight + chartBarGap / 2;
}

function getBarTextY(barY: number) {
  return barY + chartBarHeight / 2;
}

function getBarWidth(value: number) {
  if (chartMaxValue.value <= 0) return 0;

  return (value / chartMaxValue.value) * chartPlotWidth;
}

function getGridX(position: number) {
  return chartPlotX + chartPlotWidth * position;
}

const chartShellClass = css({
  marginTop: "4",
  display: "flex",
  flexDirection: "column",
  gap: "3"
});

const chartHeaderClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4"
});

const chartLegendClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3"
});

const chartLegendItemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5"
});

const chartLegendTextClass = css({
  fontWeight: "normal"
});

const augustMarkerClass = css({
  width: "2",
  height: "2",
  borderRadius: "var(--border-radius-full)",
  backgroundColor: "var(--airene-chart-cat05)"
});

const septemberMarkerClass = css({
  width: "2",
  height: "2",
  borderRadius: "var(--border-radius-full)",
  backgroundColor: "var(--airene-chart-cat01-bold)"
});
</script>
