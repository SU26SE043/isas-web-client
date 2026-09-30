import { describe, expect, it } from 'vitest';
import { normalizeWeightsToDecimal, redistributeAfterAdd, redistributeAfterRemove } from './rubricWeights';

describe('rubric weight redistribution', () => {
  it('adds an equal row and preserves the existing proportions', () => {
    const result = redistributeAfterAdd([15, 10, 10, 10, 20, 20, 15]);
    expect(result).toHaveLength(8);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100);
    expect(result[7]).toBe(12.5);
    expect(result.slice(0, 7)).toEqual([13.1, 8.8, 8.8, 8.8, 17.4, 17.5, 13.1]);
  });

  it('redistributes a removed row and rounds the displayed total to 100.0', () => {
    const result = redistributeAfterRemove([15, 10, 10, 10, 20, 20]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100);
  });

  it('shares evenly when the remaining total is zero', () => {
    const result = redistributeAfterRemove([0, 0, 0]);
    expect(result).toEqual([33.4, 33.3, 33.3]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100);
  });

  it('normalizes a manually edited total only for the save payload', () => {
    const result = normalizeWeightsToDecimal([54, 54]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(result[0]).toBeCloseTo(0.5);
  });
});
