export function roundWeight(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function roundAndAllocate(values: number[]): number[] {
  if (values.length === 0) return [];

  const rounded = values.map(roundWeight);
  const difference = roundWeight(100 - rounded.reduce((sum, value) => sum + value, 0));
  if (difference !== 0) {
    const largestIndex = values.reduce(
      (bestIndex, value, index) => (value > values[bestIndex] ? index : bestIndex),
      0,
    );
    rounded[largestIndex] = roundWeight(rounded[largestIndex] + difference);
  }
  return rounded;
}

/** Rebalances existing rows around an equal share for a newly added row. */
export function redistributeAfterAdd(existingWeights: number[]): number[] {
  const nextCount = existingWeights.length + 1;
  if (nextCount === 1) return [100];

  const newWeight = 100 / nextCount;
  const existingTotal = existingWeights.reduce((sum, weight) => sum + weight, 0);
  const oldTarget = 100 - newWeight;
  const existing =
    existingTotal > 0
      ? existingWeights.map((weight) => (weight / existingTotal) * oldTarget)
      : existingWeights.map(() => oldTarget / existingWeights.length);

  return roundAndAllocate([...existing, newWeight]);
}

/** Rebalances the rows that remain after one row is removed. */
export function redistributeAfterRemove(remainingWeights: number[]): number[] {
  if (remainingWeights.length === 0) return [];
  const total = remainingWeights.reduce((sum, weight) => sum + weight, 0);
  const normalized =
    total > 0
      ? remainingWeights.map((weight) => (weight / total) * 100)
      : remainingWeights.map(() => 100 / remainingWeights.length);
  return roundAndAllocate(normalized);
}

/** Normalizes arbitrary positive editor values into the server's 0..1 payload range. */
export function normalizeWeightsToDecimal(weights: number[]): number[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return weights.map(() => 0);
  return weights.map((weight) => weight / total);
}
