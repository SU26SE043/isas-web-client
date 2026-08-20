import { describe, expect, it } from 'vitest';
import { CvAnalysisError } from '../services/cvAnalysis.service';
import { cvAnalysisTranslations } from '../languages/translations';
import { isHumanReadableMessage, resolveJdError } from './resolveJdError';

const t = (key: string) => cvAnalysisTranslations.vi[key] ?? key;
const tEn = (key: string) => cvAnalysisTranslations.en[key] ?? key;

describe('resolveJdError — context beats status code (J7)', () => {
  it('does not call a JD extraction 404 "không tìm thấy dữ liệu phân tích"', () => {
    const error = new CvAnalysisError('notFound', 'Request failed with status code 404', 404);

    const extract = resolveJdError(error, 'extractRequirements', t);
    const analyze = resolveJdError(error, 'analyze', t);

    expect(extract.message).toBe(t('cv.jdError.extractRequirements.notFound'));
    expect(extract.message).not.toBe(t('cv.error.notFound'));
    expect(analyze.message).toBe(t('cv.jdError.analyze.notFound'));
    expect(extract.message).not.toBe(analyze.message);
  });

  it('maps the same code differently for upload, extraction and analysis', () => {
    const error = new CvAnalysisError('serverError', 'Request failed with status code 500', 500);
    const messages = new Set(
      (['uploadJd', 'extractRequirements', 'analyze'] as const).map(
        (context) => resolveJdError(error, context, t).message,
      ),
    );

    expect(messages.size).toBe(3);
  });

  it('translates for both languages', () => {
    const error = new CvAnalysisError('aiBusy', 'Request failed with status code 502', 502);

    expect(resolveJdError(error, 'extractRequirements', t).message).toMatch(/AI đang bận/);
    expect(resolveJdError(error, 'extractRequirements', tEn).message).toMatch(/AI is busy/);
  });
});

describe('resolveJdError — raw transport strings never reach the UI (P1)', () => {
  it.each([
    'Request failed with status code 404',
    'Network Error',
    'timeout of 20000ms exceeded',
    'ERR_BAD_REQUEST',
    'JD_TEXT_TOO_LONG',
    '{"traceId":"abc"}',
    'https://api.example.com/v1/interview',
  ])('never renders %s', (raw) => {
    const error = new CvAnalysisError('uploadFailed', raw, undefined, { serverMessage: raw });
    const resolved = resolveJdError(error, 'uploadJd', t);

    expect(resolved.message).not.toBe(raw);
    expect(resolved.message).toBe(t('cv.jdError.uploadJd.fallback'));
    expect(resolved.fromServer).toBe(false);
  });

  it('falls back for a plain Error', () => {
    const resolved = resolveJdError(new Error('boom'), 'extractRequirements', t);

    expect(resolved.message).toBe(t('cv.jdError.extractRequirements.fallback'));
    expect(resolved.code).toBe('unknown');
  });

  it('ignores the axios message even when the server said nothing', () => {
    const error = new CvAnalysisError(
      'uploadFailed',
      'Request failed with status code 413',
      413,
    );
    expect(resolveJdError(error, 'uploadJd', t).message).toBe(t('cv.jdError.uploadJd.fallback'));
  });
});

describe('resolveJdError — server sentences', () => {
  it('shows a human backend sentence when no context translation exists', () => {
    const error = new CvAnalysisError('uploadFailed', 'whatever', 400, {
      serverMessage: 'Tệp JD vượt quá 10 MB cho phép.',
    });
    const resolved = resolveJdError(error, 'uploadJd', t);

    expect(resolved.message).toBe('Tệp JD vượt quá 10 MB cho phép.');
    expect(resolved.fromServer).toBe(true);
  });

  it('prefers the translated context copy over the server sentence', () => {
    const error = new CvAnalysisError('notFound', 'x', 404, {
      serverMessage: 'The analysis record was not found.',
    });

    expect(resolveJdError(error, 'extractRequirements', t).message).toBe(
      t('cv.jdError.extractRequirements.notFound'),
    );
  });

  it('classifies technical strings', () => {
    expect(isHumanReadableMessage('Tệp JD vượt quá 10 MB cho phép.')).toBe(true);
    expect(isHumanReadableMessage('Request failed with status code 500')).toBe(false);
    expect(isHumanReadableMessage('REQUIREMENT_LIMIT_EXCEEDED')).toBe(false);
    expect(isHumanReadableMessage('short')).toBe(false);
    expect(isHumanReadableMessage(undefined)).toBe(false);
  });
});

describe('resolveJdError — retry metadata', () => {
  it('passes Retry-After through for the countdown', () => {
    const error = new CvAnalysisError('rateLimited', 'x', 429, { retryAfterSeconds: 45 });
    const resolved = resolveJdError(error, 'extractRequirements', t);

    expect(resolved.retryAfterSeconds).toBe(45);
    expect(resolved.retryable).toBe(true);
    expect(resolved.status).toBe(429);
  });

  it('marks user-fixable failures as not retryable', () => {
    expect(
      resolveJdError(new CvAnalysisError('badRequest', 'x', 400), 'extractRequirements', t)
        .retryable,
    ).toBe(false);
    expect(
      resolveJdError(new CvAnalysisError('aiBusy', 'x', 502), 'extractRequirements', t).retryable,
    ).toBe(true);
  });
});
