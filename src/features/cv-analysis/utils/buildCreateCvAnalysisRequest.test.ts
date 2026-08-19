import { describe, expect, it } from 'vitest';
import {
  buildCreateCvAnalysisRequest,
  CV_JD_TEXT_MAX_CHARS,
} from './buildCreateCvAnalysisRequest';

describe('buildCreateCvAnalysisRequest', () => {
  it('requires cvId', () => {
    expect(() =>
      buildCreateCvAnalysisRequest({ cvId: '  ', jobCategory: 'FE' }),
    ).toThrow('CV_ID_REQUIRED');
  });

  it('requires jobCategory', () => {
    expect(() =>
      buildCreateCvAnalysisRequest({ cvId: 'cv-1', jobCategory: '  ' }),
    ).toThrow('JOB_CATEGORY_REQUIRED');
  });

  it('lets jdText win over jdId', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      jdId: 'jd-1',
      jdText: '  Build APIs  ',
    });
    expect(request.jdText).toBe('Build APIs');
    expect(request.jdId).toBeUndefined();
  });

  it('uses jdId when jdText is blank', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      jdId: 'jd-2',
      jdText: '   ',
    });
    expect(request.jdText).toBeUndefined();
    expect(request.jdId).toBe('jd-2');
  });

  it('omits jd fields when neither jdText nor jdId is provided', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'BE',
    });
    expect(request.cvId).toBe('cv-1');
    expect(request.jobCategory).toBe('BE');
    expect(request.jdText).toBeUndefined();
    expect(request.jdId).toBeUndefined();
  });

  it('rejects jdText over max length', () => {
    expect(() =>
      buildCreateCvAnalysisRequest({
        cvId: 'cv-1',
        jobCategory: 'FE',
        jdText: 'a'.repeat(CV_JD_TEXT_MAX_CHARS + 1),
      }),
    ).toThrow('JD_TEXT_TOO_LONG');
  });

  it('includes extracted requirement inputs without client ids', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      jdId: 'jd-1',
      mustHave: [{ text: 'React' }],
      niceToHave: [{ text: 'Testing' }],
    });

    expect(request.mustHave).toEqual([{ text: 'React' }]);
    expect(request.niceToHave).toEqual([{ text: 'Testing' }]);
  });

  // I1 — the backend switches into requirement mode on `MustHave is not null`,
  // so an empty array means "score against zero requirements": blank report,
  // 1 credit gone. The workspace omits the keys instead of sending [].
  it('omits both requirement keys when the caller passes none (I1)', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      jdText: 'Build APIs',
    });

    expect('mustHave' in request).toBe(false);
    expect('niceToHave' in request).toBe(false);
  });

  it('still forwards empty arrays verbatim when a caller insists (documents the trap)', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      mustHave: [],
      niceToHave: [],
    });

    expect(request.mustHave).toEqual([]);
    expect(request.niceToHave).toEqual([]);
  });

  it('keeps the keys omitted when every requirement text is blank', () => {
    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      jdText: 'Build APIs',
    });

    expect(request).toEqual({ cvId: 'cv-1', jobCategory: 'FE', jdText: 'Build APIs' });
  });

  it('rejects more than 20 extracted requirements', () => {
    expect(() =>
      buildCreateCvAnalysisRequest({
        cvId: 'cv-1',
        jobCategory: 'FE',
        mustHave: Array.from({ length: 21 }, (_, index) => ({ text: `Requirement ${index}` })),
      }),
    ).toThrow('REQUIREMENT_LIMIT_EXCEEDED');
  });
});
