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
});
