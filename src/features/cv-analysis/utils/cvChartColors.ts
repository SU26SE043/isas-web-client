import { CHART_CATEGORICAL, CHART_GRID, CHART_RADAR } from '@/shared/charts/chartColors';

/** Semantic / multi-hue palette for CV analysis charts (dark monochrome chrome). */
export const CV_CHART_COLORS = {
  match: 'var(--isas-info)',
  matchTrack: 'color-mix(in srgb, var(--isas-silver-200) 18%, transparent)',
  success: 'var(--isas-success)',
  warning: 'var(--isas-warning)',
  error: 'var(--isas-error)',
  info: 'var(--isas-info)',
  radarFill: CHART_RADAR.fill,
  radarStroke: CHART_RADAR.stroke,
  radarTargetFill: CHART_RADAR.targetFill,
  radarTargetStroke: CHART_RADAR.targetStroke,
  grid: CHART_GRID.stroke,
  axis: CHART_GRID.axis,
  barTracks: [...CHART_CATEGORICAL],
} as const;

export function scoreToneColor(score: number): string {
  if (score >= 80) return CV_CHART_COLORS.success;
  if (score >= 60) return CV_CHART_COLORS.warning;
  return CV_CHART_COLORS.error;
}

export function scoreToneClass(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
}
