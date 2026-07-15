/** Semantic / multi-hue palette for CV analysis charts (dark monochrome chrome). */
export const CV_CHART_COLORS = {
  match: 'var(--isas-info)',
  matchTrack: 'color-mix(in srgb, var(--isas-silver-200) 18%, transparent)',
  success: 'var(--isas-success)',
  warning: 'var(--isas-warning)',
  error: 'var(--isas-error)',
  info: 'var(--isas-info)',
  radarFill: 'color-mix(in srgb, var(--isas-info) 28%, transparent)',
  radarStroke: 'var(--isas-info)',
  radarTargetFill: 'color-mix(in srgb, var(--isas-warning) 16%, transparent)',
  radarTargetStroke: 'var(--isas-warning)',
  grid: 'color-mix(in srgb, var(--isas-silver-200) 22%, transparent)',
  axis: 'var(--isas-gray-400)',
  barTracks: [
    'var(--isas-info)',
    'var(--isas-success)',
    'var(--isas-warning)',
    '#38bdf8',
    '#34d399',
  ],
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
