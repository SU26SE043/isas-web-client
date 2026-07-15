/**
 * Shared data-viz palette for dark monochrome chrome.
 * Prefer CSS vars so theme stays in `colors.css`.
 */

export const CHART_CATEGORICAL = [
  'var(--chart-cat-1)',
  'var(--chart-cat-2)',
  'var(--chart-cat-3)',
  'var(--chart-cat-4)',
  'var(--chart-cat-5)',
  'var(--chart-cat-6)',
  'var(--chart-cat-7)',
] as const;

/** Resolved HEX for canvas/SVG libs that cannot read CSS vars. */
export const CHART_CATEGORICAL_HEX = [
  '#818cf8',
  '#2dd4bf',
  '#fbbf24',
  '#fb7185',
  '#22d3ee',
  '#c084fc',
  '#a3e635',
] as const;

export const CHART_RADAR = {
  stroke: 'var(--chart-radar-stroke)',
  fill: 'var(--chart-radar-fill)',
  fillOpacity: 1, // fill already includes ~25% alpha
  targetStroke: 'var(--chart-radar-target-stroke)',
  targetFill: 'var(--chart-radar-target-fill)',
  targetFillOpacity: 1,
  strokeWidth: 2.5,
} as const;

export const CHART_GRID = {
  stroke: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
} as const;

export const CHART_TOOLTIP_STYLE = {
  background: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: 12,
  boxShadow: 'var(--chart-tooltip-shadow)',
  color: 'var(--text-primary)',
} as const;

export function chartCategoryColor(index: number): string {
  const palette = CHART_CATEGORICAL;
  return palette[((index % palette.length) + palette.length) % palette.length]!;
}

export function chartCategoryHex(index: number): string {
  const palette = CHART_CATEGORICAL_HEX;
  return palette[((index % palette.length) + palette.length) % palette.length]!;
}
