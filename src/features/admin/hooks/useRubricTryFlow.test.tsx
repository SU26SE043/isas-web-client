// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { adminRubricService } from '../services/adminRubric.service';
import type { AdminDeliveryMetrics, AdminRubricPreviewRequest, AdminRubricPreviewRun } from '../types/adminApi.types';
import { useRubricTryFlow } from './useRubricTryFlow';

const metrics: AdminDeliveryMetrics = { metricsVersion: 2, audioSec: 48, speechSec: 42, wordCount: 110, speechRateWpm: 157, longestPauseSec: 1.8, pauseCount: 3, silenceRatio: 0.12, fillerCount: 1, fillerPer100Words: 0.9, fillerBreakdown: {} };
const file = new File(['audio'], 'answer.webm', { type: 'audio/webm' });

function setup() {
  const mutate = vi.fn();
  const preview = { mutate, isPending: false, data: undefined, error: null, isError: false } as unknown as UseMutationResult<AdminRubricPreviewRun, unknown, AdminRubricPreviewRequest>;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const hook = renderHook(() => useRubricTryFlow({ category: 'BE', language: 'vi', preview }), { wrapper });
  return { hook, mutate };
}
afterEach(() => vi.restoreAllMocks());

describe('useRubricTryFlow', () => {
  it('nói → chép lời đổ vào ô sửa + giữ số đo; chấm gửi includeAiSamples=false + deliveryMetrics; sửa bản chép ⇒ transcriptEdited', async () => {
    vi.spyOn(adminRubricService, 'transcribeForPreview').mockResolvedValue({ transcript: 'Em sẽ thêm index.', deliveryMetrics: metrics, transcriptEngine: 'whisper-1', noSpeech: false });
    const { hook, mutate } = setup();
    expect(hook.result.current.canGrade).toBe(false);          // chưa có bản chép thì không có đường nào chấm
    act(() => hook.result.current.transcribe.mutate(file));
    await waitFor(() => expect(hook.result.current.transcribedText).toBe('Em sẽ thêm index.'));
    expect(hook.result.current.answerText).toBe('Em sẽ thêm index.');
    expect(hook.result.current.hasAudioMetrics).toBe(true);
    expect(hook.result.current.canGrade).toBe(true);
    act(() => hook.result.current.setAnswerText('Em sẽ thêm index cho cột hay lọc.'));
    expect(hook.result.current.transcriptEdited).toBe(true);
    act(() => hook.result.current.grade({ sampleQuestionId: 'q-1', seniority: 'Junior' }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ sampleQuestionId: 'q-1', seniority: 'Junior', customAnswer: 'Em sẽ thêm index cho cột hay lọc.', includeAiSamples: false, deliveryMetrics: metrics });
  });

  it('dán bài ⇒ KHÔNG gửi deliveryMetrics kể cả khi trước đó đã chép lời (bản ghi không còn nói về bài này)', async () => {
    vi.spyOn(adminRubricService, 'transcribeForPreview').mockResolvedValue({ transcript: 'bài nói', deliveryMetrics: metrics, transcriptEngine: 'whisper-1', noSpeech: false });
    const { hook, mutate } = setup();
    act(() => hook.result.current.transcribe.mutate(file));
    await waitFor(() => expect(hook.result.current.hasAudioMetrics).toBe(true));
    act(() => hook.result.current.switchMode('paste'));
    expect(hook.result.current.answerText).toBe('');             // đổi chế độ = bỏ bài cũ
    expect(hook.result.current.hasAudioMetrics).toBe(false);
    act(() => hook.result.current.setAnswerText('bài dán'));
    act(() => hook.result.current.grade({ question: 'Q?' }));
    expect(mutate.mock.calls[0][0]).toEqual({ question: 'Q?', customAnswer: 'bài dán', includeAiSamples: false });
    expect('deliveryMetrics' in mutate.mock.calls[0][0]).toBe(false);
  });

  it('bản ghi không có tiếng nói ⇒ noSpeech, không cho chấm; bật checkbox ⇒ includeAiSamples=true', async () => {
    vi.spyOn(adminRubricService, 'transcribeForPreview').mockResolvedValue({ transcript: '', deliveryMetrics: null, transcriptEngine: null, noSpeech: true });
    const { hook, mutate } = setup();
    act(() => hook.result.current.transcribe.mutate(file));
    await waitFor(() => expect(hook.result.current.noSpeech).toBe(true));
    act(() => hook.result.current.setAnswerText('gõ tay vào ô'));
    expect(hook.result.current.canGrade).toBe(false);
    act(() => hook.result.current.resetAnswer());
    expect(hook.result.current.noSpeech).toBe(false);
    act(() => { hook.result.current.switchMode('paste'); });
    act(() => { hook.result.current.setAnswerText('bài dán'); hook.result.current.setIncludeAiSamples(true); });
    act(() => hook.result.current.grade({ question: 'Q?' }));
    expect(mutate.mock.calls[0][0]).toMatchObject({ includeAiSamples: true });
  });

  it('gọi đúng service với nghề/ngôn ngữ và tên file', async () => {
    const spy = vi.spyOn(adminRubricService, 'transcribeForPreview').mockResolvedValue({ transcript: 'x', deliveryMetrics: null, transcriptEngine: 'whisper-1', noSpeech: false });
    const { hook } = setup();
    act(() => hook.result.current.transcribe.mutate(file));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('BE', 'vi', file, 'answer.webm'));
  });
});
