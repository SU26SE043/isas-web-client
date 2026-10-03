import { describe, expect, it } from 'vitest';
import {
  QUESTIONS_PER_SESSION_MAX,
  drawBounds,
  drawFromK,
  kFromDraw,
  normalizeK,
  questionsReceived,
} from './questionDrawCount';

// Mirrors the backend selection branches: all questions, fixed questions, then free slots.
// Deliberately does not call or repeat the implementation's max(fixed, k) expression.
function selectorOracle(k: number | null, fixed: number, total: number): number {
  if (k == null || k >= total) return total;
  const selectedFixed = fixed;
  const availableSlots = k - selectedFixed;
  if (availableSlots <= 0) return selectedFixed;
  return selectedFixed + Math.min(availableSlots, total - selectedFixed);
}

describe('question draw count contract', () => {
  it.each([
    [0, 5, 3, 3, 3],
    [1, 4, 3, 3, 2],
    [1, 4, 4, 4, 3],
    [2, 3, 1, 2, 0],
    [2, 3, 9, 5, 3],
  ])('fixed %i + pool %i with K=%i gives %i received and %i drawn', (fixed, pool, k, received, drawn) => {
    expect(questionsReceived(k, fixed, fixed + pool)).toBe(received);
    expect(drawFromK(k, fixed, fixed + pool)).toBe(drawn);
  });

  it('agrees with the selector for every bank, fixed count, and K in the supported range', () => {
    let cases = 0;
    for (let total = 0; total <= 25; total++) {
      for (let fixed = 0; fixed <= total; fixed++) {
        for (const k of [null, ...Array.from({ length: 26 }, (_, n) => n)]) {
          const received = selectorOracle(k, fixed, total);
          expect(questionsReceived(k, fixed, total)).toBe(received);
          expect(drawFromK(k, fixed, total)).toBe(received - fixed);
          cases++;
        }
      }
    }
    expect(cases).toBe(9477);
  });

  it('round trips each editable draw value to a valid K', () => {
    for (let total = 1; total <= 25; total++) {
      for (let fixed = 0; fixed <= Math.min(total, QUESTIONS_PER_SESSION_MAX); fixed++) {
        const { min, max } = drawBounds(fixed, total);
        for (let draw = min; draw <= max; draw++) {
          const k = kFromDraw(draw, fixed, total);
          expect(k).toBeGreaterThanOrEqual(1);
          expect(k).toBeLessThanOrEqual(QUESTIONS_PER_SESSION_MAX);
          expect(selectorOracle(k, fixed, total)).toBe(fixed + draw);
          expect(drawFromK(k, fixed, total)).toBe(draw);
        }
      }
    }
  });

  it('normalizes once without changing the number received', () => {
    for (let total = 0; total <= 25; total++) {
      for (let fixed = 0; fixed <= total; fixed++) {
        for (let k = 0; k <= 25; k++) {
          const normalized = normalizeK(k, fixed, total);
          expect(normalizeK(normalized, fixed, total)).toBe(normalized);
          if (k >= 1 && k <= QUESTIONS_PER_SESSION_MAX) {
            expect(selectorOracle(normalized, fixed, total)).toBe(selectorOracle(k, fixed, total));
          }
        }
      }
    }
  });

  it('clamps an empty fixed bank to a positive K and the backend maximum', () => {
    expect(QUESTIONS_PER_SESSION_MAX).toBe(20);
    expect(drawBounds(0, 3)).toEqual({ min: 1, max: 3 });
    expect(kFromDraw(0, 0, 3)).toBe(1);
    expect(kFromDraw(25, 0, 25)).toBe(20);
  });
});
