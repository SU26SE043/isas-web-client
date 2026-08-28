export type AnalyticsScoreSample = {
  interviewScore?: number | null;
  screeningScore?: number | null;
};

export type AnalyticsScoreSummary = {
  interviewMedianScore: number | null;
  screeningMedianScore: number | null;
  pendingScoreCount: number;
};

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

export function summarizeAnalyticsScores(
  samples: AnalyticsScoreSample[],
): AnalyticsScoreSummary {
  const interviewScores = samples
    .map((sample) => sample.interviewScore)
    .filter((score): score is number => score != null);
  const screeningScores = samples
    .map((sample) => sample.screeningScore)
    .filter((score): score is number => score != null);
  const pendingScoreCount = samples.filter(
    (sample) => sample.interviewScore == null && sample.screeningScore == null,
  ).length;

  return {
    interviewMedianScore: median(interviewScores),
    screeningMedianScore: median(screeningScores),
    pendingScoreCount,
  };
}
