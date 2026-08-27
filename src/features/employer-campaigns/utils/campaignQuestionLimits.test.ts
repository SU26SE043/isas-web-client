import { describe, expect, it } from 'vitest';
import {
  defaultGenerateCount,
  effectiveMaxQuestions,
  hasWizardJd,
  isServerQuestionId,
  removePlaceholderQuestion,
  validateGenerateCount,
} from './campaignQuestionLimits';

describe('campaignQuestionLimits', () => {
  it('caps effective max at 20', () => {
    expect(effectiveMaxQuestions(null)).toBe(20);
    expect(effectiveMaxQuestions(15)).toBe(15);
    expect(effectiveMaxQuestions(50)).toBe(20);
  });

  it('defaults generate count to min(max, 10)', () => {
    expect(defaultGenerateCount(null)).toBe(10);
    expect(defaultGenerateCount(8)).toBe(8);
    expect(defaultGenerateCount(5)).toBe(5);
  });

  it('validates generate count rules', () => {
    expect(validateGenerateCount(0, null)).toEqual({ ok: false, code: 'countPositive' });
    expect(validateGenerateCount(1.5, null)).toEqual({ ok: false, code: 'countInteger' });
    expect(validateGenerateCount(21, null)).toEqual({
      ok: false,
      code: 'countMaximum',
      max: 20,
    });
    expect(validateGenerateCount(12, 10)).toEqual({
      ok: false,
      code: 'countCampaignMax',
      max: 10,
    });
    expect(validateGenerateCount(10, 15)).toEqual({ ok: true, count: 10 });
  });

  it('detects server question GUIDs', () => {
    expect(isServerQuestionId('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
    expect(isServerQuestionId('manual-abc')).toBe(false);
    expect(isServerQuestionId('ai-q-0-xyz')).toBe(false);
  });

  it('detects JD availability', () => {
    expect(
      hasWizardJd({
        inputMethod: 'text',
        jdText: '  JD  ',
        serverUploaded: false,
        fileStatus: 'idle',
      }),
    ).toBe(true);
    expect(
      hasWizardJd({
        inputMethod: 'file',
        jdText: '',
        serverUploaded: true,
        fileStatus: 'uploaded',
      }),
    ).toBe(true);
    expect(
      hasWizardJd({
        inputMethod: 'file',
        jdText: '',
        serverUploaded: false,
        fileStatus: 'selected',
      }),
    ).toBe(false);
  });

  it('removes only the temporary question returned after AI generation', () => {
    const result = removePlaceholderQuestion(
      [
        { prompt: 'Temporary question' },
        { prompt: 'What is your React experience?' },
      ],
      'Temporary question',
    );

    expect(result).toEqual({
      questions: [{ prompt: 'What is your React experience?' }],
      removedCount: 1,
    });
  });
});
