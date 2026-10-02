/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';

/**
 * ATT1-F4 — phòng B2C luyện tập phải Y NGUYÊN: không begin, không đồng hồ cả buổi — kể cả khi GET
 * session (Backend mới) có serverNow / durationMinutes. Đi xuyên trang → phòng → hook → service mock.
 */

const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const SERVER_MS = Date.parse('2026-10-02T03:00:00.000Z');

const svc = vi.hoisted(() => ({
  beginPracticeSession: vi.fn(),
  getPracticeSession: vi.fn(),
  getQuestionSpeech: vi.fn(),
  submitPracticeAnswer: vi.fn(),
  submitPracticeSession: vi.fn(),
}));

vi.mock('../services/b2cPracticeSession.service', () => svc);
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false, mockDelay: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/features/campaigns/utils/campaignInterviewSession', () => ({
  readCampaignInterviewSession: () => null,
  isB2bCampaignSessionId: () => false,
}));

const media = { state: 'ready' as const, stream: null, videoRef: { current: null }, setVideoElement: vi.fn(), startMedia: vi.fn().mockResolvedValue(null), stopMedia: vi.fn() };
const recorder = { recordingStatus: 'idle' as const, audioFile: null, durationSec: 0, errorKey: null, startRecording: vi.fn(), stopRecording: vi.fn(), stopRecordingAndDiscard: vi.fn(), pauseRecording: vi.fn(), resumeRecording: vi.fn(), clearRecording: vi.fn(), setUploading: vi.fn(), setSubmitted: vi.fn(), setStopped: vi.fn(), setIdle: vi.fn() };
const speech = { isBusy: false, isLoadingSpeech: false, isPlaying: false, needsManualPlay: false, stopPlayback: vi.fn(), pausePlayback: vi.fn(), resumePlayback: vi.fn().mockResolvedValue(undefined), playManual: vi.fn() };
vi.mock('../hooks/useInterviewMedia', () => ({ useInterviewMedia: () => media }));
vi.mock('../hooks/usePracticeAnswerRecorder', () => ({ usePracticeAnswerRecorder: () => recorder }));
vi.mock('../hooks/useQuestionSpeech', () => ({ useQuestionSpeech: () => speech }));
vi.mock('../hooks/useB2cRoomCoaching', () => ({ useB2cRoomCoaching: () => ({ cameraAlwaysOn: false }) }));
vi.mock('../components/AIInterviewerPanel', () => ({ AIInterviewerPanel: () => null }));
vi.mock('../components/CandidateCameraPanel', () => ({ CandidateCameraPanel: () => null }));
vi.mock('../components/audio-recorder/AnswerRecorderCard', () => ({ AnswerRecorderCard: () => null }));
vi.mock('../components/B2cInterviewControls', () => ({ B2cInterviewControls: () => null }));
vi.mock('../components/B2cPracticeRoomDialogs', () => ({ B2cPracticeRoomDialogs: () => null }));
vi.mock('../components/room/FullscreenExitBanner', () => ({ FullscreenExitBanner: () => null }));

const { PracticeInterviewPage } = await import('./PracticeInterviewPage');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(SERVER_MS + 10 * 60_000);
  useB2cPracticeInterviewStore.getState().reset();
  Object.values(svc).forEach((fn) => fn.mockReset());
  svc.beginPracticeSession.mockResolvedValue({
    sessionId: SESSION_ID, beganAt: new Date(SERVER_MS).toISOString(), deadline: new Date(SERVER_MS + 1_800_000).toISOString(),
    serverNow: new Date(SERVER_MS).toISOString(), durationMinutes: 30,
  });
  svc.getPracticeSession.mockResolvedValue({
    id: SESSION_ID,
    status: 'InProgress',
    questions: [{ id: 'q-1', orderNo: 1, content: 'Giới thiệu bản thân', timeLimitSec: 120, kind: 'question' }],
    answers: [],
    result: null,
    serverNow: new Date(SERVER_MS).toISOString(),
    durationMinutes: null,
    beganAt: null,
    questionsLocked: false,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PracticeInterviewPage (B2C) — không đổi', () => {
  it('không gọi begin, không có đồng hồ cả buổi, câu hỏi vẫn nạp như cũ', async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={[`/interview/${SESSION_ID}/room`]}>
          <Routes>
            <Route path="/interview/:sessionId/room" element={<PracticeInterviewPage />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });

    expect(svc.getPracticeSession).toHaveBeenCalledWith(SESSION_ID);
    expect(screen.getByText('Giới thiệu bản thân')).toBeInTheDocument();
    expect(svc.beginPracticeSession).not.toHaveBeenCalled();
    expect(screen.queryByTestId('exam-session-clock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('exam-clock-reminder')).not.toBeInTheDocument();
  });
});
