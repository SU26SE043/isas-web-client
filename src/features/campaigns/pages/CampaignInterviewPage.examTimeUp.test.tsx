/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { useB2cPracticeInterviewStore } from '@/features/practice/stores/b2cPracticeInterviewStore';
import { resetExamRoomBeginsForTests } from '@/features/practice/hooks/enterExamRoom';
import { practiceTranslations } from '@/features/practice/languages/translations';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import { myCampaignDetailQueryKey } from '../hooks/useMyCampaignDetail';

/**
 * ATT1-F5 — hết giờ, khoá KHE NỐI ở mức TRANG: CampaignInterviewPage → B2cPracticeInterviewRoom → useB2cPracticeRoom
 * → useExamTimeUp → thẻ ghi âm THẬT (AnswerRecorderCard + MediaRecorder giả) → service (mock). Đồng hồ giả.
 * Chữ so khớp TUYỆT ĐỐI với bản dịch tiếng Việt thật (không so chuỗi con).
 *
 * Mốc giờ: render lúc T = 0; đếm ngược 3-2-1 xong lúc ~3,8 s ⇒ T = 4 s đang trả lời; begin hẹn deadline 30 s
 * theo giờ server (máy lệch +10 phút) ⇒ đồng hồ cả buổi về 0 ĐÚNG lúc T = 30 s.
 */

const VI = practiceTranslations.vi;
const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';
const SERVER_MS = Date.parse('2026-10-02T03:00:00.000Z');
const MACHINE_MS = SERVER_MS + 10 * 60_000;
const EXAM_SECONDS = 30;
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
  antiCheatEnabled: [] as boolean[],
}));

vi.mock('@/features/practice/services/b2cPracticeSession.service', () => svc);
vi.mock('@/shared/languages', async () => {
  const { practiceTranslations: dictionary } = await import('@/features/practice/languages/translations');
  const vi: Record<string, string> = dictionary.vi;
  return { useLanguage: () => ({ t: (key: string) => vi[key] ?? key, language: 'vi' }) };
});
vi.mock('@/shared/mock', () => ({ usesMockData: () => false, mockDelay: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));
vi.mock('../utils/campaignInterviewSession', () => ({ readCampaignInterviewSession: () => state.stored }));
vi.mock('../hooks/useCampaignFullscreen', () => ({
  useCampaignFullscreen: () => ({ isFullscreen: state.isFullscreen, hasExited: !state.isFullscreen, fullscreenSupported: true, enterFullscreen: vi.fn() }),
}));
vi.mock('../hooks/useCampaignViolationQueue', () => ({
  useCampaignViolationQueue: () => ({ currentViolation: state.currentViolation, pendingCount: 0, enqueue: vi.fn(), resolveCurrent: vi.fn() }),
}));
vi.mock('../hooks/useCampaignAntiCheat', () => ({
  useCampaignAntiCheat: (options: { enabled: boolean }) => {
    state.antiCheatEnabled.push(options.enabled);
    return { reportFullscreenExit: vi.fn() };
  },
}));
vi.mock('../hooks/useCampaignFaceCheck', () => ({ useCampaignFaceCheck: () => ({ checkNow: vi.fn() }) }));
vi.mock('../components/CampaignViolationDialog', () => ({
  CampaignViolationDialog: (props: { violation: unknown }) => (props.violation ? <div data-testid="violation-dialog" /> : null),
}));

const media = { state: 'ready' as const, stream: null, videoRef: { current: null }, setVideoElement: vi.fn(), startMedia: vi.fn().mockResolvedValue(null), stopMedia: vi.fn() };
const legacyRecorder = { recordingStatus: 'idle' as const, audioFile: null, durationSec: 0, errorKey: null, startRecording: vi.fn(), stopRecording: vi.fn(), stopRecordingAndDiscard: vi.fn(), pauseRecording: vi.fn(), resumeRecording: vi.fn(), clearRecording: vi.fn(), setUploading: vi.fn(), setSubmitted: vi.fn(), setStopped: vi.fn(), setIdle: vi.fn() };
const speech = { isBusy: false, isLoadingSpeech: false, isPlaying: false, needsManualPlay: false, stopPlayback: vi.fn(), pausePlayback: vi.fn(), resumePlayback: vi.fn().mockResolvedValue(undefined), playManual: vi.fn() };
vi.mock('@/features/practice/hooks/useInterviewMedia', () => ({ useInterviewMedia: () => media }));
vi.mock('@/features/practice/hooks/usePracticeAnswerRecorder', () => ({ usePracticeAnswerRecorder: () => legacyRecorder }));
vi.mock('@/features/practice/hooks/useQuestionSpeech', () => ({ useQuestionSpeech: () => speech }));
vi.mock('@/features/practice/hooks/useB2cRoomCoaching', () => ({ useB2cRoomCoaching: () => ({ cameraAlwaysOn: false }) }));
vi.mock('@/features/practice/components/AIInterviewerPanel', () => ({ AIInterviewerPanel: () => null }));
vi.mock('@/features/practice/components/CandidateCameraPanel', () => ({ CandidateCameraPanel: () => null }));
vi.mock('@/features/practice/components/B2cInterviewControls', () => ({ B2cInterviewControls: () => null }));
vi.mock('@/features/practice/components/room/FullscreenExitBanner', () => ({ FullscreenExitBanner: () => null }));
// Hộp thoại Kết thúc thật dùng Base UI (portal + animation); stub giữ ĐÚNG hai khe cần khoá: cờ mở + nút xác nhận.
vi.mock('@/features/practice/components/B2cPracticeRoomDialogs', () => ({
  B2cPracticeRoomDialogs: (props: { room: { finishOpen: boolean }; onConfirmFinish: () => void }) => (
    <div data-testid="finish-dialog" data-open={String(props.room.finishOpen)}>
      <button type="button" onClick={props.onConfirmFinish}>stub-confirm-finish</button>
    </div>
  ),
}));

const { CampaignInterviewPage } = await import('./CampaignInterviewPage');

const Q1 = { id: 'q-1', orderNo: 1, content: 'Câu gốc 1', timeLimitSec: 120, kind: 'Seed' };
const Q1_FU = { id: 'q-1-fu', orderNo: 2, content: 'Câu đào sâu 1.1', timeLimitSec: 120, kind: 'FollowUp' };
const Q2 = { id: 'q-2', orderNo: 3, content: 'Câu gốc 2', timeLimitSec: 120, kind: 'Seed' };
const Q3 = { id: 'q-3', orderNo: 4, content: 'Câu gốc 3', timeLimitSec: 120, kind: 'Seed' };
const Q2_FU = { id: 'q-2-fu', orderNo: 5, content: 'Câu đào sâu 2.1', timeLimitSec: 120, kind: 'FollowUp' };

function beginResponse() {
  return { sessionId: SESSION_ID, beganAt: iso(SERVER_MS), deadline: iso(SERVER_MS + EXAM_SECONDS * 1000), serverNow: iso(SERVER_MS), durationMinutes: 5 };
}
function sessionResponse() {
  // Câu 1 và câu đào sâu 1.1 đã trả lời ⇒ phòng mở ở câu 2.
  return {
    id: SESSION_ID, status: 'InProgress', questions: [Q1, Q1_FU, Q2, Q3], result: null, serverNow: iso(SERVER_MS),
    questionsLocked: false, durationMinutes: 5, beganAt: iso(SERVER_MS),
    answers: [{ answerId: 'a-1', questionId: 'q-1', status: 'Scored' }, { answerId: 'a-1fu', questionId: 'q-1-fu', status: 'Scored' }],
  };
}
// Server còn đề câu đào sâu cho câu 2 — phòng KHÔNG được chuyển sang câu đó sau khi hết giờ.
const answerQ2: { answerId: string; questionId: string; status: string; transcript: null; nextAction: string; nextQuestion: typeof Q2_FU | null; interviewComplete: boolean } = {
  answerId: 'a-2', questionId: 'q-2', status: 'Scoring', transcript: null, nextAction: 'follow_up', nextQuestion: Q2_FU, interviewComplete: false,
};
function conflict(code: string) {
  return new AxiosError('409', '409', undefined, undefined, { status: 409, statusText: 'Conflict', data: { code, error: 'x' }, headers: {}, config: { headers: new AxiosHeaders() } });
}
function serverError() {
  return new AxiosError('500', '500', undefined, undefined, { status: 500, statusText: 'Error', data: { error: 'boom' }, headers: {}, config: { headers: new AxiosHeaders() } });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

class FakeMediaRecorder {
  static isTypeSupported = () => true;
  static instances: FakeMediaRecorder[] = [];
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  stopCalls = 0;
  constructor() { FakeMediaRecorder.instances.push(this); }
  start() { this.state = 'recording'; }
  pause() { if (this.state === 'recording') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'recording'; }
  stop() {
    this.stopCalls += 1;
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['voice'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const calls: string[] = [];
const getUserMedia = vi.fn();
let queryClient: QueryClient;
const originalUrl = { createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL };

function renderPage() {
  return render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/candidate/campaigns/${CAMPAIGN_ID}/interview/${SESSION_ID}`]}>
          <Routes>
            <Route path="/candidate/campaigns/:campaignId/interview/:sessionId" element={<CampaignInterviewPage />} />
            <Route path="/candidate/campaigns/:id" element={<p>trang-chien-dich</p>} />
            <Route path="/candidate/campaigns" element={<p>danh-sach-chien-dich</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}
async function flush(ms = 0) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}
/** Vào phòng + chạy hết đếm ngược 3-2-1 ⇒ T = 4 s, đang ở pha trả lời câu 2. */
async function enterRoom() {
  renderPage();
  await flush();
  await flush(4_000);
}
async function startRecording() {
  fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.start'] }));
  await flush();
  expect(FakeMediaRecorder.instances.at(-1)?.state).toBe('recording');
}
const timeUpScreen = () => screen.queryByTestId('exam-time-up-screen');
const statusText = () => screen.getByTestId('exam-time-up-status-text').textContent;
const summaryText = () => screen.getByTestId('exam-time-up-summary').textContent;
const backButton = () => within(screen.getByTestId('exam-time-up-screen')).getByRole('button', { name: 'Về trang chiến dịch' });
const submitCount = () => svc.submitPracticeSession.mock.calls.length;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MACHINE_MS);
  resetExamRoomBeginsForTests();
  useB2cPracticeInterviewStore.getState().reset();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  state.stored = {
    mode: 'b2b-campaign', campaignId: CAMPAIGN_ID, sessionId: SESSION_ID, antiCheatEnabled: true,
    deadlineAt: iso(MACHINE_MS + 3 * 3_600_000), questions: [Q1, Q1_FU, Q2, Q3].map((q) => ({ ...q, content: '' })),
  };
  state.currentViolation = null;
  state.isFullscreen = true;
  state.antiCheatEnabled = [];
  calls.length = 0;
  FakeMediaRecorder.instances = [];
  Object.values(svc).forEach((fn) => fn.mockReset());
  [media, legacyRecorder, speech].forEach((mock) => Object.values(mock).forEach((value) => {
    if (vi.isMockFunction(value)) value.mockClear();
  }));
  svc.beginPracticeSession.mockImplementation(async () => { calls.push('begin'); return beginResponse(); });
  svc.getPracticeSession.mockImplementation(async () => sessionResponse());
  svc.getQuestionSpeech.mockResolvedValue(new Blob());
  svc.submitPracticeAnswer.mockImplementation(async (input: { questionId: string }) => {
    calls.push(`upload:${input.questionId}`);
    return { ...answerQ2, questionId: input.questionId };
  });
  svc.submitPracticeSession.mockImplementation(async () => { calls.push('submit'); });
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
  const track = { enabled: true, readyState: 'live', stop: vi.fn(), onended: null };
  getUserMedia.mockReset().mockResolvedValue({ getAudioTracks: () => [track], getTracks: () => [track] });
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
  URL.createObjectURL = vi.fn(() => 'blob:answer');
  URL.revokeObjectURL = vi.fn();
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  URL.createObjectURL = originalUrl.createObjectURL;
  URL.revokeObjectURL = originalUrl.revokeObjectURL;
});

describe('CampaignInterviewPage — hết giờ cả buổi (ATT1-F5)', () => {
  it('về 0 khi ĐANG GHI ⇒ dừng ghi, nộp đoạn đang ghi RỒI MỚI nộp bài; màn "đang lưu" → "đã nộp", 2/3 câu chính', async () => {
    const upload = deferred<typeof answerQ2>();
    svc.submitPracticeAnswer.mockImplementation((input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      return upload.promise;
    });
    await enterRoom();
    await startRecording();
    const mediaRecorder = FakeMediaRecorder.instances.at(-1)!;

    await flush(25_999); // T = 29,999 s — còn 1 giây
    expect(timeUpScreen()).toBeNull();
    expect(mediaRecorder.state).toBe('recording');

    await flush(1); // T = 30 s — về 0
    expect(mediaRecorder.state).toBe('inactive');
    expect(calls).toEqual(['begin', 'upload:q-2']);
    const sent = svc.submitPracticeAnswer.mock.calls[0]![0] as { sessionId: string; questionId: string; file: File; durationSec: number };
    expect(sent.sessionId).toBe(SESSION_ID);
    expect(sent.file).toBeInstanceOf(File);
    expect(sent.durationSec).toBe(26);
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Đã hết giờ làm bài');
    expect(statusText()).toBe('Đang lưu câu trả lời cuối …');
    expect(backButton()).toBeDisabled();

    await flush(3_000);
    expect(submitCount()).toBe(0); // vẫn chờ upload

    await act(async () => { upload.resolve(answerQ2); });
    await flush();
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(svc.submitPracticeSession).toHaveBeenCalledWith(SESSION_ID);
    expect(statusText()).toBe('Đã nộp bài');
    expect(summaryText()).toBe('Đã trả lời 2/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
    expect(backButton()).toBeEnabled();
    // Không chuyển câu, không nhận câu đào sâu server trả về, không tắt cam/mic trước khi upload xong.
    const store = useB2cPracticeInterviewStore.getState();
    expect(store.currentQuestionId).toBe('q-2');
    expect(store.questions.map((q) => q.id)).toEqual(['q-1', 'q-1-fu', 'q-2', 'q-3']);
    expect(media.stopMedia).toHaveBeenCalled();
  });

  it('tải lại phòng sau khi một câu bị nộp thay bằng file lặng ⇒ "Đã trả lời 1/3 câu chính", KHÔNG đếm dư', async () => {
    // Hết giờ câu 2 ở lượt trước ⇒ server giữ bản ghi im lặng: status 'Skipped' + rejectReason 'no_speech'
    // (bài im lặng VẪN CÓ audio nên durationSec của nó khác 0). Trước đây hydrate coi MỌI bản ghi là đã
    // trả lời ⇒ màn hết giờ báo 2/3 dù ứng viên chỉ thật sự trả lời câu 1.
    svc.getPracticeSession.mockImplementation(async () => ({
      ...sessionResponse(),
      answers: [
        { answerId: 'a-1', questionId: 'q-1', status: 'Scored' },
        { answerId: 'a-1fu', questionId: 'q-1-fu', status: 'Scored' },
        { answerId: 'a-2', questionId: 'q-2', status: 'Skipped', rejectReason: 'no_speech', durationSec: 11 },
      ],
    }));
    await enterRoom();
    // Bản ghi im lặng vẫn còn ⇒ phòng mở ở câu 3, KHÔNG hỏi lại câu 2 (nộp lại là ghi đè bài đã có).
    expect(useB2cPracticeInterviewStore.getState().currentQuestionId).toBe('q-3');

    await flush(26_000); // T = 30 s
    await flush();

    expect(calls).toEqual(['begin', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(summaryText()).toBe('Đã trả lời 1/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
    const store = useB2cPracticeInterviewStore.getState();
    expect(store.questionStates['q-2']).toBe('unanswered');
    expect(store.answersByQuestionId['q-2']).toMatchObject({ answerId: 'a-2', rejectReason: 'no_speech' });
    expect(svc.submitPracticeAnswer).not.toHaveBeenCalled();
  });

  it('về 0 khi KHÔNG ghi ⇒ nộp bài NGAY, không nộp câu trống; đồng hồ tick tiếp 2 phút vẫn ĐÚNG 1 submit; thôi giám sát', async () => {
    await enterRoom();
    expect(state.antiCheatEnabled.at(-1)).toBe(true);

    await flush(26_000); // T = 30 s
    await flush();
    expect(calls).toEqual(['begin', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(summaryText()).toBe('Đã trả lời 1/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
    expect(state.antiCheatEnabled.at(-1)).toBe(false);

    await flush(120_000);
    expect(submitCount()).toBe(1);
    expect(svc.submitPracticeAnswer).not.toHaveBeenCalled();
    // Luồng hết giờ TỪNG CÂU không chạy: câu 2 không bị đánh dấu "bỏ trống", không chuyển câu.
    const store = useB2cPracticeInterviewStore.getState();
    expect(store.questionStates['q-2']).not.toBe('unanswered');
    expect(store.currentQuestionId).toBe('q-2');
    expect(screen.queryByText(VI['practice.errors.submitAnswerFailed'])).toBeNull();
  });

  it('về 0 khi đoạn đang ghi CHƯA tới 1 giây ⇒ KHÔNG đứng chờ hết trần 25 s, nộp bài ngay', async () => {
    // Đoạn dưới 1 giây bị thẻ ghi âm coi là rỗng (không có file để nộp). Phòng phải báo ngay là
    // "không có gì để nộp" — `submitEmptyAnswer` + `handleAutoSubmitEmptyResult` cùng gọi
    // `settleFinalUpload()` — chứ không để ứng viên nhìn "Đang lưu câu trả lời cuối …" đủ 25 giây.
    await enterRoom(); // T = 4 s
    await flush(25_600); // T = 29,6 s
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.start'] }));
    await flush();
    expect(FakeMediaRecorder.instances.at(-1)?.state).toBe('recording');

    await flush(400); // T = 30 s — mới ghi được 0,4 giây
    expect(FakeMediaRecorder.instances.at(-1)?.state).toBe('inactive');
    expect(calls).toEqual(['begin', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(svc.submitPracticeAnswer).not.toHaveBeenCalled(); // không nộp đoạn rỗng, cũng không nộp câu trống

    await flush(26_000); // qua trần 25 giây — không nộp bài lần 2
    expect(submitCount()).toBe(1);
  });

  it('trần chờ upload 25 giây: 24,9 s vẫn chờ, 25 s thôi chờ và nộp bài (đúng 1 lần)', async () => {
    svc.submitPracticeAnswer.mockImplementation((input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      return new Promise(() => undefined); // upload treo
    });
    await enterRoom();
    await startRecording();
    await flush(26_000); // về 0
    expect(calls).toEqual(['begin', 'upload:q-2']);

    await flush(24_900);
    expect(submitCount()).toBe(0);
    expect(statusText()).toBe('Đang lưu câu trả lời cuối …');

    await flush(100);
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');

    await flush(60_000);
    expect(submitCount()).toBe(1);
  });

  it('upload người dùng vừa bấm nộp đang bay lúc về 0 ⇒ chờ nó xong rồi mới nộp bài; trả về "hết câu" cũng KHÔNG tự nộp lần 2', async () => {
    const upload = deferred<typeof answerQ2>();
    svc.submitPracticeAnswer.mockImplementation((input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      return upload.promise;
    });
    await enterRoom();
    await startRecording();
    await flush(24_000); // T = 28 s
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.stop'] }));
    await flush();
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.submit'] }));
    await flush(2_000); // T = 30 s — về 0 khi upload còn bay
    expect(calls).toEqual(['begin', 'upload:q-2']);
    expect(statusText()).toBe('Đang lưu câu trả lời cuối …');

    await flush(3_000);
    expect(submitCount()).toBe(0);
    await act(async () => { upload.resolve({ ...answerQ2, nextQuestion: null, nextAction: 'end', interviewComplete: true }); });
    await flush();
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(summaryText()).toBe('Đã trả lời 2/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
    expect(screen.queryByText('danh-sach-chien-dich')).toBeNull(); // không rời phòng ngầm
  });

  it('câu cuối vừa xong đang tự nộp bài (interviewComplete) thì về 0 ⇒ dùng CHUNG request nộp bài, không gọi submit lần 2', async () => {
    const sessionSubmit = deferred<void>();
    svc.submitPracticeSession.mockImplementation(() => { calls.push('submit'); return sessionSubmit.promise; });
    svc.submitPracticeAnswer.mockImplementation(async (input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      return { ...answerQ2, nextQuestion: null, nextAction: 'end', interviewComplete: true };
    });
    await enterRoom();
    await startRecording();
    await flush(24_000);
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.stop'] }));
    await flush();
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.submit'] }));
    await flush();
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']); // phòng tự nộp bài như cũ

    await flush(2_000); // về 0 khi submit đó còn bay
    expect(statusText()).toBe('Đang lưu câu trả lời cuối …');
    await act(async () => { sessionSubmit.resolve(); });
    await flush();
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(screen.queryByText('danh-sach-chien-dich')).toBeNull();
  });

  it('upload câu cuối bị 409 SESSION_TIME_UP ⇒ bỏ câu đó, nộp bài ngay (không nộp lại, không begin)', async () => {
    svc.submitPracticeAnswer.mockImplementation(async (input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      await new Promise((resolve) => { window.setTimeout(resolve, 2_000); });
      throw conflict('SESSION_TIME_UP');
    });
    await enterRoom();
    await startRecording();
    await flush(26_000);

    await flush(1_999);
    expect(submitCount()).toBe(0);
    await flush(1);
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    expect(summaryText()).toBe('Đã trả lời 1/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
  });

  it('upload bị 409 SESSION_TIME_UP khi đồng hồ còn giờ ⇒ vào luồng hết giờ: nộp bài, không nộp lại đoạn ghi âm, khoá ghi âm', async () => {
    svc.submitPracticeAnswer.mockImplementation(async (input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      throw conflict('SESSION_TIME_UP');
    });
    await enterRoom();
    await startRecording();
    await flush(2_000);
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.stop'] }));
    await flush();
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.submit'] }));
    await flush();

    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
    expect(statusText()).toBe('Đã nộp bài');
    // Đồng hồ còn ~24 giây nhưng mọi nút của thẻ ghi âm đã khoá (không ghi lại / nộp lại được).
    const recorderButtons = screen.getAllByRole('button', { hidden: true })
      .filter((button) => [VI['practice.audioRecorder.submit'], VI['practice.audioRecorder.retake'], VI['practice.audioRecorder.start']].includes(button.textContent?.trim() ?? ''));
    expect(recorderButtons.length).toBeGreaterThan(0);
    recorderButtons.forEach((button) => expect(button).toBeDisabled());

    await flush(30_000); // đồng hồ về 0 sau đó — không submit lần 2, không upload lại
    expect(calls).toEqual(['begin', 'upload:q-2', 'submit']);
  });

  it('upload bị 409 SESSION_NOT_BEGUN ⇒ begin rồi thử lại ĐÚNG 1 lần (thành công ⇒ chuyển câu như thường)', async () => {
    svc.submitPracticeAnswer
      .mockImplementationOnce(async (input: { questionId: string }) => { calls.push(`upload:${input.questionId}`); throw conflict('SESSION_NOT_BEGUN'); })
      .mockImplementationOnce(async (input: { questionId: string }) => { calls.push(`upload:${input.questionId}`); return answerQ2; });
    await enterRoom();
    await startRecording();
    await flush(2_000);
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.stop'] }));
    await flush();
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.submit'] }));
    await flush();

    expect(calls).toEqual(['begin', 'upload:q-2', 'begin', 'upload:q-2']);
    expect(svc.beginPracticeSession).toHaveBeenLastCalledWith(SESSION_ID);
    expect(useB2cPracticeInterviewStore.getState().currentQuestionId).toBe('q-2-fu');
    expect(timeUpScreen()).toBeNull();
  });

  it('SESSION_NOT_BEGUN cả lần thử lại ⇒ dừng (không lần 3), báo câu riêng của mã lỗi — không phải câu 409 chung', async () => {
    svc.submitPracticeAnswer.mockImplementation(async (input: { questionId: string }) => {
      calls.push(`upload:${input.questionId}`);
      throw conflict('SESSION_NOT_BEGUN');
    });
    await enterRoom();
    await startRecording();
    await flush(2_000);
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.stop'] }));
    await flush();
    fireEvent.click(screen.getByRole('button', { name: VI['practice.audioRecorder.submit'] }));
    await flush(5_000);

    expect(calls).toEqual(['begin', 'upload:q-2', 'begin', 'upload:q-2']);
    expect(screen.getAllByText('Bài thi chưa được mở nên chưa nhận câu trả lời. Hãy tải lại trang để vào phòng thi lại.').length).toBeGreaterThan(0);
    expect(screen.queryByText(VI['practice.errors.conflict'])).toBeNull();
  });

  it('nộp bài lỗi ⇒ màn vẫn hiện, dòng "Hệ thống sẽ tự nộp bài trong ít phút" — KHÔNG có chữ "thất bại", không nộp lại', async () => {
    svc.submitPracticeSession.mockImplementation(async () => { calls.push('submit'); throw serverError(); });
    await enterRoom();
    await flush(26_000);
    await flush();

    expect(statusText()).toBe('Hệ thống sẽ tự nộp bài trong ít phút');
    const screenText = timeUpScreen()!.textContent ?? '';
    expect(screenText).not.toMatch(/thất bại|không thể/i);
    expect(screenText).not.toContain(VI['practice.errors.submitSessionFailed']);
    expect(summaryText()).toBe('Đã trả lời 1/3 câu chính. Câu chưa trả lời được tính 0 điểm.');
    expect(backButton()).toBeEnabled();

    await flush(60_000);
    expect(submitCount()).toBe(1);
    expect(timeUpScreen()).toBeInTheDocument();
  });

  it('màn hết giờ nằm TRÊN overlay "bật toàn màn hình" (ẩn nó) và KHÔNG đóng được (Escape, bấm nền, không nút đóng)', async () => {
    state.isFullscreen = false;
    renderPage();
    await flush(29_999);
    expect(screen.getByText('campaigns.fullscreen.title')).toBeInTheDocument();
    expect(timeUpScreen()).toBeNull();

    await flush(1); // T = 30 s
    expect(timeUpScreen()).toBeInTheDocument();
    expect(timeUpScreen()).toHaveClass('fixed', 'inset-0', 'z-[130]');
    expect(screen.queryByText('campaigns.fullscreen.title')).toBeNull();
    expect(submitCount()).toBe(1);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.mouseDown(timeUpScreen()!);
    fireEvent.click(timeUpScreen()!);
    await flush(5_000);
    expect(timeUpScreen()).toBeInTheDocument();
    expect(within(timeUpScreen()!).getAllByRole('button').map((button) => button.textContent)).toEqual(['Về trang chiến dịch']);
  });

  it('hết giờ khi đang có overlay vi phạm ⇒ overlay vi phạm bị gỡ, màn hết giờ hiện', async () => {
    state.currentViolation = { kind: 'tab_switch' };
    renderPage();
    await flush(29_999);
    expect(screen.getByTestId('violation-dialog')).toBeInTheDocument();

    await flush(1);
    expect(screen.queryByTestId('violation-dialog')).toBeNull();
    expect(timeUpScreen()).toBeInTheDocument();
    expect(submitCount()).toBe(1);
  });

  it('sau khi về 0 không thao tác được: nút ghi âm khoá, Thoát không mở hộp thoại, xác nhận Kết thúc không gây submit thứ 2', async () => {
    await enterRoom();
    await flush(26_000);
    await flush();
    expect(submitCount()).toBe(1);

    const room = document.querySelector('[inert]');
    expect(room).not.toBeNull();
    expect(room).toHaveAttribute('aria-hidden', 'true');
    expect(room).toContainElement(screen.getByText('Câu gốc 2', { selector: 'h2' }));

    const record = screen.getByRole('button', { name: VI['practice.audioRecorder.start'], hidden: true });
    expect(record).toBeDisabled();
    fireEvent.click(record);
    await flush();
    expect(getUserMedia).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: VI['practice.exit'], hidden: true }));
    await flush();
    expect(screen.getByTestId('finish-dialog')).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'stub-confirm-finish', hidden: true }));
    await flush(10_000);
    expect(submitCount()).toBe(1);
    expect(timeUpScreen()).toBeInTheDocument();
  });

  it('"Về trang chiến dịch" ⇒ trang chiến dịch đó, cache lượt (danh sách + chi tiết) bị đánh dấu cũ', async () => {
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await enterRoom();
    await flush(26_000);
    await flush();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: MY_CAMPAIGNS_QUERY_KEY });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: myCampaignDetailQueryKey(CAMPAIGN_ID) });

    fireEvent.click(backButton());
    await flush();
    expect(screen.getByText('trang-chien-dich')).toBeInTheDocument();
    expect(timeUpScreen()).toBeNull();
  });

  it('không vào được phòng khi chưa bật toàn màn hình ⇒ overlay toàn màn hình KHÔNG che bảng lỗi', async () => {
    state.isFullscreen = false;
    svc.beginPracticeSession.mockRejectedValue(conflict('SESSION_ENDED'));
    renderPage();
    await flush();

    expect(screen.getByRole('alert')).toHaveTextContent(VI['practice.room.entryError.sessionEnded']);
    expect(screen.queryByText('campaigns.fullscreen.title')).toBeNull();
    expect(timeUpScreen()).toBeNull();
  });

  it('Backend cũ (begin 404) ⇒ hành vi cũ khi hết hạn deadlineAt: KHÔNG màn hết giờ, không tự nộp bài', async () => {
    svc.beginPracticeSession.mockImplementation(async () => { calls.push('begin'); return null; });
    state.stored = { ...state.stored, deadlineAt: iso(MACHINE_MS + 20_000) };
    await enterRoom();
    await flush(30_000);

    expect(timeUpScreen()).toBeNull();
    expect(svc.submitPracticeSession).not.toHaveBeenCalled();
    // Đường cũ: hết giờ từng câu tự nộp câu trống (file lặng, 0 giây) như trước ATT1.
    expect(svc.submitPracticeAnswer).toHaveBeenCalledWith(expect.objectContaining({ questionId: 'q-2', durationSec: 0 }));
  });
});
