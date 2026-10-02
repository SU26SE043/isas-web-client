/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { useB2cPracticeInterviewStore } from '@/features/practice/stores/b2cPracticeInterviewStore';
import { resetExamRoomBeginsForTests } from '@/features/practice/hooks/enterExamRoom';
import type { PracticeSessionResponse } from '@/features/practice/types/b2cPracticeSession.types';

/**
 * ATT1-F4 — khoá KHE NỐI trang B2B → phòng → hook → enterExamRoom → service (chỉ service bị mock).
 * Bài học F1/F2: test đơn vị xanh mà dây nối sai vẫn lọt. Ở đây giờ MÁY lệch +10 phút so với server:
 * đồng hồ đúng chỉ khi offset được tính và cộng đúng dấu ở đúng chỗ.
 */

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';
const SERVER_MS = Date.parse('2026-10-02T03:00:00.000Z');
const MACHINE_MS = SERVER_MS + 10 * 60_000;
const iso = (ms: number) => new Date(ms).toISOString();

const svc = vi.hoisted(() => ({
  beginPracticeSession: vi.fn(),
  getPracticeSession: vi.fn(),
  getQuestionSpeech: vi.fn(),
  submitPracticeAnswer: vi.fn(),
  submitPracticeSession: vi.fn(),
}));
const state = vi.hoisted(() => ({
  stored: null as null | Record<string, unknown>,
  currentViolation: null as null | { kind: string },
  isFullscreen: true,
}));

vi.mock('@/features/practice/services/b2cPracticeSession.service', () => svc);
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false, mockDelay: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));
vi.mock('../utils/campaignInterviewSession', () => ({ readCampaignInterviewSession: () => state.stored }));
vi.mock('../hooks/useCampaignFullscreen', () => ({
  useCampaignFullscreen: () => ({ isFullscreen: state.isFullscreen, hasExited: !state.isFullscreen, fullscreenSupported: true, enterFullscreen: vi.fn() }),
}));
vi.mock('../hooks/useCampaignViolationQueue', () => ({
  useCampaignViolationQueue: () => ({ currentViolation: state.currentViolation, pendingCount: 0, enqueue: vi.fn(), resolveCurrent: vi.fn() }),
}));
vi.mock('../hooks/useCampaignAntiCheat', () => ({ useCampaignAntiCheat: () => ({ reportFullscreenExit: vi.fn() }) }));
vi.mock('../hooks/useCampaignFaceCheck', () => ({ useCampaignFaceCheck: () => ({ checkNow: vi.fn() }) }));
// Dialog thật dùng Base UI (portal + animation); stub giữ ĐÚNG prop cần khoá: dòng "vẫn chạy" nhận gì.
vi.mock('../components/CampaignViolationDialog', () => ({
  CampaignViolationDialog: (props: { violation: unknown; examClockRunning?: boolean }) =>
    props.violation ? <div data-testid="violation-dialog" data-clock-running={String(Boolean(props.examClockRunning))} /> : null,
}));

const media = { state: 'ready' as const, stream: null, videoRef: { current: null }, setVideoElement: vi.fn(), startMedia: vi.fn().mockResolvedValue(null), stopMedia: vi.fn() };
const recorder = { recordingStatus: 'idle' as const, audioFile: null, durationSec: 0, errorKey: null, startRecording: vi.fn(), stopRecording: vi.fn(), stopRecordingAndDiscard: vi.fn(), pauseRecording: vi.fn(), resumeRecording: vi.fn(), clearRecording: vi.fn(), setUploading: vi.fn(), setSubmitted: vi.fn(), setStopped: vi.fn(), setIdle: vi.fn() };
const speech = { isBusy: false, isLoadingSpeech: false, isPlaying: false, needsManualPlay: false, stopPlayback: vi.fn(), pausePlayback: vi.fn(), resumePlayback: vi.fn().mockResolvedValue(undefined), playManual: vi.fn() };
vi.mock('@/features/practice/hooks/useInterviewMedia', () => ({ useInterviewMedia: () => media }));
vi.mock('@/features/practice/hooks/usePracticeAnswerRecorder', () => ({ usePracticeAnswerRecorder: () => recorder }));
vi.mock('@/features/practice/hooks/useQuestionSpeech', () => ({ useQuestionSpeech: () => speech }));
vi.mock('@/features/practice/hooks/useB2cRoomCoaching', () => ({ useB2cRoomCoaching: () => ({ cameraAlwaysOn: false }) }));
vi.mock('@/features/practice/components/AIInterviewerPanel', () => ({ AIInterviewerPanel: () => null }));
vi.mock('@/features/practice/components/CandidateCameraPanel', () => ({ CandidateCameraPanel: () => null }));
vi.mock('@/features/practice/components/audio-recorder/AnswerRecorderCard', () => ({ AnswerRecorderCard: () => null }));
vi.mock('@/features/practice/components/B2cInterviewControls', () => ({ B2cInterviewControls: () => null }));
vi.mock('@/features/practice/components/B2cPracticeRoomDialogs', () => ({ B2cPracticeRoomDialogs: () => null }));
vi.mock('@/features/practice/components/room/FullscreenExitBanner', () => ({ FullscreenExitBanner: () => null }));

const { CampaignInterviewPage } = await import('./CampaignInterviewPage');

const QUESTION = { id: 'q-1', orderNo: 1, content: 'Hãy mô tả cách bạn thiết kế API', timeLimitSec: 120, kind: 'question' };

function beginResponse(minutes = 30) {
  return { sessionId: SESSION_ID, beganAt: iso(SERVER_MS), deadline: iso(SERVER_MS + minutes * 60_000), serverNow: iso(SERVER_MS), durationMinutes: minutes };
}
function sessionResponse(overrides: Record<string, unknown> = {}) {
  return { id: SESSION_ID, status: 'InProgress', questions: [QUESTION], answers: [], result: null, serverNow: iso(SERVER_MS), questionsLocked: false, durationMinutes: 30, beganAt: iso(SERVER_MS), ...overrides };
}
function conflict(code: string) {
  return new AxiosError('409', '409', undefined, undefined, { status: 409, statusText: 'Conflict', data: { code, error: 'x' }, headers: {}, config: { headers: new AxiosHeaders() } });
}

let queryClient: QueryClient;
function renderPage() {
  return render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/candidate/campaigns/${CAMPAIGN_ID}/interview/${SESSION_ID}`]}>
          <Routes>
            <Route path="/candidate/campaigns/:campaignId/interview/:sessionId" element={<CampaignInterviewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}
async function flush(ms = 0) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}
const clockValue = () => screen.queryByTestId('exam-session-clock-value')?.textContent ?? null;
const questionTimer = () => within(screen.getByLabelText('practice.room.progressLabel', { selector: 'section' })).getByText(/^\d\d:\d\d$/).textContent;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MACHINE_MS);
  resetExamRoomBeginsForTests();
  useB2cPracticeInterviewStore.getState().reset();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Hạn cứng chiến dịch (deadlineAt của start) — CHỈ 90 giây theo giờ máy, cố ý khác giờ thi.
  // Marker như sau ATT1 [C7]: start trả câu đủ id/orderNo/timeLimitSec nhưng content = "".
  state.stored = {
    mode: 'b2b-campaign', campaignId: CAMPAIGN_ID, sessionId: SESSION_ID, antiCheatEnabled: true,
    deadlineAt: iso(MACHINE_MS + 90_000), questions: [{ id: QUESTION.id, orderNo: 1, content: '', timeLimitSec: 120 }],
  };
  state.currentViolation = null;
  state.isFullscreen = true;
  Object.values(svc).forEach((fn) => fn.mockReset());
  // Mock media/recorder/speech sống qua các test (object cấp module) ⇒ xoá lịch sử gọi, nếu không
  // `toHaveBeenCalled` của test sau đúng nhờ lời gọi của test trước.
  [media, recorder, speech].forEach((mock) => Object.values(mock).forEach((value) => {
    if (vi.isMockFunction(value)) value.mockClear();
  }));
  svc.beginPracticeSession.mockResolvedValue(beginResponse());
  svc.getPracticeSession.mockResolvedValue(sessionResponse());
  svc.getQuestionSpeech.mockResolvedValue(new Blob());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CampaignInterviewPage — vào phòng + đồng hồ theo giờ server', () => {
  it('begin ĐÚNG 1 lần (StrictMode), invalidate + refetch khoá phiên, GET SAU begin', async () => {
    const prepFetch = vi.fn().mockResolvedValue({ sessionId: SESSION_ID, questions: [] });
    await queryClient.prefetchQuery({ queryKey: ['practice', 'session', SESSION_ID], queryFn: prepFetch });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    renderPage();
    await flush();

    expect(svc.beginPracticeSession).toHaveBeenCalledTimes(1);
    expect(svc.beginPracticeSession).toHaveBeenCalledWith(SESSION_ID);
    expect(invalidate).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['practice', 'session', SESSION_ID] }));
    expect(prepFetch).toHaveBeenCalledTimes(2); // bản cache bị che đề của trang chuẩn bị được tải lại
    const beginOrder = svc.beginPracticeSession.mock.invocationCallOrder[0]!;
    expect(svc.getPracticeSession.mock.invocationCallOrder.every((order) => order > beginOrder)).toBe(true);
    expect(screen.getByText(QUESTION.content)).toBeInTheDocument();
  });

  it('câu hỏi không được nạp trước khi begin trả về', async () => {
    let resolveBegin!: (value: unknown) => void;
    svc.beginPracticeSession.mockReturnValue(new Promise((r) => { resolveBegin = r; }));

    renderPage();
    await flush(5_000);

    expect(svc.getPracticeSession).not.toHaveBeenCalled();
    expect(screen.queryByText(QUESTION.content)).not.toBeInTheDocument();
    expect(clockValue()).toBeNull();

    resolveBegin(beginResponse());
    await flush();
    expect(svc.getPracticeSession).toHaveBeenCalled();
    expect(screen.getByText(QUESTION.content)).toBeInTheDocument();
  });

  it('giờ máy lệch +10 phút ⇒ header vẫn 30:00 theo server, rồi giảm từng giây', async () => {
    renderPage();
    await flush();
    expect(clockValue()).toBe('30:00');

    await flush(61_000);
    expect(clockValue()).toBe('28:59');
  });

  it('offset begin và GET lệch 2 phút ⇒ header theo GET (response MỚI NHẤT có serverNow)', async () => {
    // Cùng giờ máy MACHINE_MS: begin báo server 03:00, GET (đến sau) báo 03:02 — giờ máy vừa bị chỉnh.
    // Theo GET: còn 30 − 2 = 28 phút; theo begin cũ sẽ là 30:00.
    svc.getPracticeSession.mockResolvedValue(sessionResponse({ serverNow: iso(SERVER_MS + 2 * 60_000) }));
    renderPage();
    await flush();

    expect(clockValue()).toBe('28:00');
  });

  it('vào lại phòng qua SPA ("Tiếp tục") khi store b2c còn câu của buổi ⇒ VẪN begin đúng 1 lần, header có đồng hồ', async () => {
    // Điều hướng SPA không reset store b2c ⇒ store còn nguyên câu của lần vào trước.
    useB2cPracticeInterviewStore.getState().hydrateFromSession(sessionResponse() as unknown as PracticeSessionResponse);
    expect(useB2cPracticeInterviewStore.getState().sessionId).toBe(SESSION_ID);
    expect(useB2cPracticeInterviewStore.getState().questions).toHaveLength(1);

    renderPage();
    await flush();

    expect(svc.beginPracticeSession).toHaveBeenCalledTimes(1);
    expect(svc.beginPracticeSession).toHaveBeenCalledWith(SESSION_ID);
    expect(clockValue()).toBe('30:00');
  });

  it('begin có kết quả ⇒ KHÔNG dùng deadlineAt của start (90 giây) để chặn đồng hồ câu', async () => {
    renderPage();
    await flush();
    expect(questionTimer()).toBe('02:00');
  });

  it('overlay vi phạm bật ⇒ đồng hồ cả buổi VẪN giảm, dialog nhận cờ "vẫn chạy"', async () => {
    state.currentViolation = { kind: 'tab_switch' };
    renderPage();
    await flush();
    expect(clockValue()).toBe('30:00');
    expect(screen.getByTestId('violation-dialog')).toHaveAttribute('data-clock-running', 'true');

    await flush(10_000);
    expect(clockValue()).toBe('29:50');
    expect(questionTimer()).toBe('02:00'); // đồng hồ CÂU vẫn dừng như cũ
  });

  it('thoát toàn màn hình (overlay chặn) ⇒ đồng hồ cả buổi vẫn giảm, overlay có dòng "vẫn chạy"', async () => {
    state.isFullscreen = false;
    renderPage();
    await flush();
    expect(screen.getByTestId('exam-clock-still-running')).toHaveTextContent('practice.examClock.stillRunning');

    await flush(30_000);
    expect(clockValue()).toBe('29:30');
  });

  it('begin 404 ⇒ overlay KHÔNG có dòng "vẫn chạy" (không có đồng hồ cả buổi)', async () => {
    state.isFullscreen = false;
    state.currentViolation = { kind: 'tab_switch' };
    svc.beginPracticeSession.mockResolvedValue(null);
    renderPage();
    await flush();
    expect(screen.queryByTestId('exam-clock-still-running')).not.toBeInTheDocument();
    expect(screen.getByTestId('violation-dialog')).toHaveAttribute('data-clock-running', 'false');
  });

  it('mốc 5 phút / 1 phút đổi màu + dòng nhắc tự nộp', async () => {
    svc.beginPracticeSession.mockResolvedValue({ ...beginResponse(), deadline: iso(SERVER_MS + 301_000) });
    renderPage();
    await flush();
    const clock = () => screen.getByTestId('exam-session-clock');
    expect(clock()).toHaveAttribute('data-severity', 'normal');
    expect(screen.queryByTestId('exam-clock-reminder')).not.toBeInTheDocument();

    await flush(1_000);
    expect(clockValue()).toBe('05:00');
    expect(clock()).toHaveAttribute('data-severity', 'warning');
    expect(screen.getByTestId('exam-clock-reminder').textContent).toBe('practice.examClock.reminder');

    await flush(240_000);
    expect(clockValue()).toBe('01:00');
    expect(clock()).toHaveAttribute('data-severity', 'critical');
    expect(screen.getByTestId('exam-clock-reminder').textContent).toBe('practice.examClock.reminderCritical');

    await flush(25_000);
    expect(clockValue()).toBe('00:35');
    expect(screen.getByTestId('exam-clock-reminder').textContent).toBe('practice.examClock.reminderCritical');
  });

  it('begin 404 (Backend cũ) ⇒ không đồng hồ header, đồng hồ câu chặn theo deadlineAt cũ của start', async () => {
    svc.beginPracticeSession.mockResolvedValue(null);
    svc.getPracticeSession.mockResolvedValue(sessionResponse({ serverNow: undefined, questionsLocked: undefined, durationMinutes: undefined, beganAt: undefined }));
    renderPage();
    await flush();

    expect(clockValue()).toBeNull();
    expect(questionTimer()).toBe('01:30');
  });

  it('marker start content "" + begin OK + GET có đề ⇒ phòng hiện ĐÚNG nội dung GET', async () => {
    renderPage();
    await flush();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(QUESTION.content);
  });

  it('begin OK nhưng GET lỗi ⇒ KHÔNG rơi về marker content "" (bảng lỗi, không hiện đề rỗng)', async () => {
    svc.getPracticeSession.mockRejectedValue(new Error('network'));
    renderPage();
    await flush();

    expect(screen.getByRole('alert')).toHaveTextContent('practice.room.entryError.failed');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('begin 404 (Backend cũ) + GET lỗi ⇒ hành vi cũ: đề lấy từ marker (có content)', async () => {
    state.stored = { ...state.stored, questions: [{ id: QUESTION.id, orderNo: 1, content: 'Đề cũ từ marker', timeLimitSec: 120 }] };
    svc.beginPracticeSession.mockResolvedValue(null);
    svc.getPracticeSession.mockRejectedValue(new Error('network'));
    renderPage();
    await flush();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Đề cũ từ marker');
    expect(clockValue()).toBeNull();
  });

  it('begin 404 + GET lỗi + marker start content "" ⇒ bảng lỗi, KHÔNG hiện đề rỗng từ marker', async () => {
    svc.beginPracticeSession.mockResolvedValue(null);
    svc.getPracticeSession.mockRejectedValue(new Error('network'));
    renderPage();
    await flush();

    expect(screen.getByRole('alert')).toHaveTextContent('practice.room.entryError.failed');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('đề vẫn khoá sau begin ⇒ begin lại 1 lần rồi báo lỗi tải phòng + tắt camera/mic NGAY lúc báo lỗi', async () => {
    let resolveFirstBegin!: (value: unknown) => void;
    svc.beginPracticeSession
      .mockReturnValueOnce(new Promise((r) => { resolveFirstBegin = r; }))
      .mockResolvedValue(beginResponse());
    svc.getPracticeSession.mockResolvedValue(sessionResponse({ questionsLocked: true, questions: [{ ...QUESTION, content: '' }] }));
    renderPage();
    await flush();
    // StrictMode mount → unmount → mount vốn gọi stopMedia (cleanup) ⇒ xoá trước khi begin trả về, để chỉ
    // đếm lời gọi do bảng lỗi tải phòng.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    media.stopMedia.mockClear();

    resolveFirstBegin(beginResponse());
    await flush();

    expect(svc.beginPracticeSession).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('alert')).toHaveTextContent('practice.room.entryError.questionsLocked');
    expect(media.stopMedia).toHaveBeenCalledTimes(1);
  });

  it('409 SESSION_ENDED ⇒ bảng "buổi đã kết thúc", chỉ có nút quay lại', async () => {
    svc.beginPracticeSession.mockRejectedValue(conflict('SESSION_ENDED'));
    renderPage();
    await flush();

    expect(screen.getByRole('alert')).toHaveTextContent('practice.room.entryError.sessionEnded');
    expect(screen.queryByText('practice.room.entryError.reload')).not.toBeInTheDocument();
    expect(svc.getPracticeSession).not.toHaveBeenCalled();
  });
});
