import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

const mocks = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { post: mocks.post, get: mocks.get } }));

import { cvAnalysisService, CvAnalysisError, JD_REQUIREMENTS_TIMEOUT_MS } from './cvAnalysis.service';

function axiosErrorWith(status: number, headers: Record<string, string>, data: unknown = {}) {
  const error = new AxiosError('Request failed with status code ' + status);
  error.response = {
    status,
    statusText: '',
    headers: new AxiosHeaders(headers),
    config: { headers: new AxiosHeaders() },
    data,
  };
  return error;
}

describe('cvAnalysisService.getJdRequirements', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.get.mockReset();
  });

  it('sends an abort signal, a timeout and opts out of the shared 429 retry', async () => {
    mocks.post.mockResolvedValue({ data: { mustHave: [], niceToHave: [] } });
    const controller = new AbortController();

    await cvAnalysisService.getJdRequirements(
      { jdText: 'A JD long enough to extract from', jobCategory: 'FE' },
      { signal: controller.signal },
    );

    const [url, body, config] = mocks.post.mock.calls[0];
    expect(url).toBe('/api/v1/interview/practice/jd-requirements');
    expect(body).toEqual({ jdText: 'A JD long enough to extract from', jobCategory: 'FE' });
    expect(config.signal).toBe(controller.signal);
    expect(config.timeout).toBe(JD_REQUIREMENTS_TIMEOUT_MS);
    // createApiClient sleeps for Retry-After and replays 429s; this request must
    // surface the rate limit immediately instead.
    expect(config._rateLimitRetry).toBe(true);
  });

  it('rejects a 429 immediately and carries Retry-After for the countdown', async () => {
    mocks.post.mockRejectedValue(axiosErrorWith(429, { 'retry-after': '45' }));
    vi.useFakeTimers();

    try {
      const error = await cvAnalysisService
        .getJdRequirements({ jdText: 'x'.repeat(300), jobCategory: 'FE' })
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(CvAnalysisError);
      expect((error as CvAnalysisError).code).toBe('rateLimited');
      expect((error as CvAnalysisError).retryAfterSeconds).toBe(45);
      // No timer was advanced — the rejection must not be behind a wait.
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reads retryAfterSeconds from the body when the header is absent', async () => {
    mocks.post.mockRejectedValue(axiosErrorWith(429, {}, { retryAfterSeconds: 12 }));

    const error = await cvAnalysisService
      .getJdRequirements({ jdText: 'x'.repeat(300), jobCategory: 'FE' })
      .catch((caught: unknown) => caught);

    expect((error as CvAnalysisError).retryAfterSeconds).toBe(12);
  });

  it('maps a JD suggestion quote, tolerating a backend that does not send one yet', async () => {
    mocks.post.mockResolvedValue({
      data: {
        mustHave: [{ text: 'React', jdQuote: '3 years of React' }, { text: 'Docker' }],
        niceToHave: [{ text: 'CI/CD', jdQuote: '   ' }],
      },
    });

    const result = await cvAnalysisService.getJdRequirements({
      jdText: 'x'.repeat(300),
      jobCategory: 'FE',
    });

    expect(result.mustHave[0].jdQuote).toBe('3 years of React');
    expect(result.mustHave[1].jdQuote).toBeNull();
    expect(result.niceToHave[0].jdQuote).toBeNull();
  });

  it('maps an aborted request to the canceled code', async () => {
    const canceled = new AxiosError('canceled', 'ERR_CANCELED');
    mocks.post.mockRejectedValue(canceled);

    const error = await cvAnalysisService
      .getJdRequirements({ jdText: 'x'.repeat(300), jobCategory: 'FE' })
      .catch((caught: unknown) => caught);

    expect((error as CvAnalysisError).code).toBe('canceled');
  });

  it('maps a client timeout to the timeout code', async () => {
    const timeout = new AxiosError('timeout of 20000ms exceeded', 'ECONNABORTED');
    mocks.post.mockRejectedValue(timeout);

    const error = await cvAnalysisService
      .getJdRequirements({ jdText: 'x'.repeat(300), jobCategory: 'FE' })
      .catch((caught: unknown) => caught);

    expect((error as CvAnalysisError).code).toBe('timeout');
  });

  it('never sends both jdText and jdId', async () => {
    mocks.post.mockResolvedValue({ data: { mustHave: [], niceToHave: [] } });

    await cvAnalysisService.getJdRequirements({
      jdId: 'jd-1',
      jdText: 'Pasted JD content',
      jobCategory: 'BE',
    });

    expect(mocks.post.mock.calls[0][1]).toEqual({
      jdText: 'Pasted JD content',
      jobCategory: 'BE',
    });
  });
});

describe('cvAnalysisService.readParsedText', () => {
  beforeEach(() => mocks.get.mockReset());

  it('returns the text on 200', async () => {
    mocks.get.mockResolvedValue({
      status: 200,
      data: { parsedText: 'JD body', parsedStatus: 'completed' },
    });

    await expect(cvAnalysisService.readParsedText('file-1')).resolves.toEqual({
      status: 'completed',
      parsedText: 'JD body',
    });
  });

  it('reports pending on 202 so the client can poll instead of failing', async () => {
    mocks.get.mockResolvedValue({ status: 202, data: { parsedStatus: 'pending' } });

    await expect(cvAnalysisService.readParsedText('file-1')).resolves.toEqual({
      status: 'pending',
    });
    // 409 must reach the handler instead of throwing inside axios.
    expect(mocks.get.mock.calls[0][1].validateStatus(409)).toBe(true);
  });

  it('reports failed on 409 so the client stops polling', async () => {
    mocks.get.mockResolvedValue({ status: 409, data: { parsedStatus: 'failed' } });

    await expect(cvAnalysisService.readParsedText('file-1')).resolves.toEqual({ status: 'failed' });
  });

  it('getParsedText throws typed errors for the non-completed states', async () => {
    mocks.get.mockResolvedValue({ status: 202, data: { parsedStatus: 'pending' } });
    await expect(cvAnalysisService.getParsedText('file-1')).rejects.toMatchObject({
      code: 'parsePending',
    });

    mocks.get.mockResolvedValue({ status: 409, data: { parsedStatus: 'failed' } });
    await expect(cvAnalysisService.getParsedText('file-1')).rejects.toMatchObject({
      code: 'parseFailed',
    });
  });
});
