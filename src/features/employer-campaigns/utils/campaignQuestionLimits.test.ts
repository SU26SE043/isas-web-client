import { describe, expect, it } from 'vitest';
import {
  defaultGenerateCount,
  hasWizardJd,
  isServerEntityId,
  validateGenerateCount,
} from './campaignQuestionLimits';

describe('campaignQuestionLimits', () => {
  it('defaults generation to 10 without reading the per-session setting', () => {
    expect(defaultGenerateCount()).toBe(10);
  });

  it('validates generate count rules', () => {
    expect(validateGenerateCount(0)).toEqual({ ok: false, code: 'countPositive' });
    expect(validateGenerateCount(1.5)).toEqual({ ok: false, code: 'countInteger' });
    expect(validateGenerateCount(20)).toEqual({ ok: true, count: 20 });
    expect(validateGenerateCount(21)).toEqual({
      ok: false,
      code: 'countMaximum',
      max: 20,
    });
  });

  it('detects server question GUIDs', () => {
    expect(isServerEntityId('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
    expect(isServerEntityId('manual-abc')).toBe(false);
    expect(isServerEntityId('ai-q-0-xyz')).toBe(false);
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

});
