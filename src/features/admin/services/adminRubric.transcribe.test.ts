/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { adminRubricService } from './adminRubric.service';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const mocked = vi.mocked(apiClient);

beforeEach(() => vi.clearAllMocks());

describe('adminRubricService.transcribeForPreview', () => {
  it('gửi MULTIPART (không phải JSON mặc định của apiClient) với trường `file`, đúng đường + ngôn ngữ, và parse đủ 4 khoá', async () => {
    // Đo trên dev 2026-09-16: apiClient mặc định Content-Type JSON ⇒ BE trả 415 Unsupported Media Type,
    // dù cùng file gửi bằng curl -F thì 200. Header multipart là điều kiện sống của cả luồng nói.
    mocked.post.mockResolvedValue({ data: { transcript: 'Em sẽ thêm index.', deliveryMetrics: { silenceRatio: 0.12, pauseCount: 3, speechSec: 42 }, transcriptEngine: 'whisper-1', noSpeech: false } });
    const blob = new Blob(['audio'], { type: 'audio/webm' });

    const result = await adminRubricService.transcribeForPreview('BE', 'vi', blob, 'answer.webm');

    expect(mocked.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = mocked.post.mock.calls[0];
    expect(url).toBe('/api/v1/interview/admin/rubrics/BE/preview/transcribe');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBeInstanceOf(Blob);
    expect(config).toMatchObject({ params: { language: 'vi' }, headers: { 'Content-Type': 'multipart/form-data' } });
    expect(result).toEqual({ transcript: 'Em sẽ thêm index.', transcriptEngine: 'whisper-1', noSpeech: false, deliveryMetrics: expect.objectContaining({ silenceRatio: 0.12, pauseCount: 3, speechSec: 42 }) });
  });

  it('không có tiếng nói ⇒ noSpeech=true, metrics null, không ném', async () => {
    mocked.post.mockResolvedValue({ data: { transcript: '', deliveryMetrics: null, transcriptEngine: null, noSpeech: true } });
    const result = await adminRubricService.transcribeForPreview('BE', 'vi', new Blob([]), 'a.webm');
    expect(result).toEqual({ transcript: '', deliveryMetrics: null, transcriptEngine: null, noSpeech: true });
  });
});
