// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePracticeSetupFlow } from './usePracticeSetupFlow';
import { PracticeSetupSummaryStep } from '../components/wizard/PracticeSetupSummaryStep';
import { savePracticeWizardDraft } from '../utils/practiceWizardDraft';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getRubric: vi.fn(),
  listUploadedCvs: vi.fn(),
  uploadCv: vi.fn(),
  listFiles: vi.fn(),
  createPracticeSession: vi.fn(),
  getPracticeSessionOptions: vi.fn(),
  setLanguage: vi.fn(),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) => selector({ user: { id: 'user-1' } }),
}));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', setLanguage: mocks.setLanguage, t: (key: string) => key }),
}));
vi.mock('../services/practiceSetup.service', () => ({
  practiceSetupService: {
    getRubricDetails: (...args: unknown[]) => mocks.getRubric(...args),
    listUploadedCvs: (...args: unknown[]) => mocks.listUploadedCvs(...args),
    uploadCv: (...args: unknown[]) => mocks.uploadCv(...args),
  },
}));
vi.mock('../services/b2cPracticeSession.service', () => ({
  createPracticeSession: (...args: unknown[]) => mocks.createPracticeSession(...args),
  getPracticeSessionOptions: (...args: unknown[]) => mocks.getPracticeSessionOptions(...args),
}));
vi.mock('@/features/cv-analysis/services/cvAnalysis.service', () => ({
  cvAnalysisService: { listFiles: (...args: unknown[]) => mocks.listFiles(...args) },
}));
vi.mock('@/features/payment/services/payment.service', () => ({
  paymentService: { reserveTokens: vi.fn() },
}));

const CRITERIA = [
  { id: 'c-1', name: 'Kiến thức nền tảng', description: '', weight: 60, maxScore: 10 },
  { id: 'c-2', name: 'Giao tiếp', description: '', weight: 40, maxScore: 10 },
];

const SESSION_OPTIONS = {
  adaptiveEnabled: true,
  maxDeepPerQuestion: 3,
  contentCriteriaCount: 6,
  questionCountMin: 1,
  questionCountMax: 20,
  defaultQuestionCount: 5,
  presets: [],
  preview: [],
  maxDeepPerQuestionMin: 1,
  maxDeepPerQuestionMax: 3,
};

const CV_FILES = [
  {
    id: 'cv-1',
    fileName: 'cv.pdf',
    fileSizeBytes: 1024,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-01T00:00:00.000Z',
    pdfUrl: '',
  },
];
const JD_FILES = [
  {
    id: 'jd-1',
    fileType: 'jd',
    originalName: 'senior-backend-role.pdf',
    mimeType: 'application/pdf',
    fileSize: 2048,
    parsedStatus: 'completed',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function renderFlow() {
  return renderHook(() => usePracticeSetupFlow(), { wrapper });
}

/**
 * Chọn ngành, chờ session-options, rồi ghé bước 7 (index 6) để rubric được tải.
 * Chọn luôn trình độ vì ứng viên đi tới bước tiêu chí là đã qua bước trình độ —
 * bước đó nay bắt buộc chọn (không còn mặc định 'Junior' im lặng).
 */
async function goToCriteriaStep(result: { current: ReturnType<typeof usePracticeSetupFlow> }) {
  act(() => result.current.setJobCategory('BE'));
  await waitFor(() => expect(result.current.sessionOptions).not.toBeNull());
  act(() => result.current.setSeniority('Junior'));
  act(() => result.current.goToStep(6));
  await waitFor(() => expect(result.current.rubricCriteria).toHaveLength(CRITERIA.length));
}

beforeEach(() => {
  mocks.getRubric.mockResolvedValue({ criteria: CRITERIA, isCustom: false });
  mocks.listUploadedCvs.mockResolvedValue(CV_FILES);
  mocks.listFiles.mockResolvedValue(JD_FILES);
  mocks.getPracticeSessionOptions.mockResolvedValue(SESSION_OPTIONS);
  mocks.createPracticeSession.mockResolvedValue({
    id: 'session-1',
    status: 'InProgress',
    questions: [{ id: 'q-1', orderNo: 1, content: 'Câu 1', timeLimitSec: 120, kind: 'question' }],
    answers: [],
    result: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('usePracticeSetupFlow — tiêu chí chấm điểm', () => {
  it('loads the active rubric and does not require criterion checkboxes to start', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);

    expect(result.current.rubricCriteria).toEqual(CRITERIA);
    expect(result.current.rubricIsCustom).toBe(false);
    expect(result.current.canStart).toBe(true);
  });

  it('saves the wizard draft and opens the rubric editor', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    act(() => result.current.openRubricEditor());
    expect(mocks.navigate).toHaveBeenCalledWith(expect.stringContaining('/candidate/rubrics?'));
    expect(sessionStorage.getItem('isas-practice-wizard-draft')).toContain('user-1');
  });

  it('restores every editable choice at step 7 after returning from the rubric editor', async () => {
    const first = renderFlow();
    await goToCriteriaStep(first.result);
    act(() => {
      first.result.current.setCvId('cv-1');
      first.result.current.setJdId('jd-1');
      first.result.current.setJdText('Important JD text');
      first.result.current.setJdTab('text');
      first.result.current.setTimeLimitSec(240);
      first.result.current.setQuestionCount(8);
      first.result.current.setSeniority('Senior');
      first.result.current.setAdaptiveEnabled(false);
      first.result.current.setMaxDeepPerQuestion(2);
      first.result.current.setFocusTrackingEnabled(true);
    });
    act(() => first.result.current.openRubricEditor());
    first.unmount();

    mocks.getRubric.mockResolvedValue({ criteria: CRITERIA, isCustom: true });
    const returned = renderFlow();
    await waitFor(() => expect(returned.result.current.step).toBe(6));
    await waitFor(() => expect(returned.result.current.rubricIsCustom).toBe(true));
    expect(returned.result.current).toMatchObject({
      jobCategory: 'BE', cvId: 'cv-1', jdId: 'jd-1', jdText: 'Important JD text',
      jdTab: 'text', timeLimitSec: 240, questionCount: 8, seniority: 'Senior',
      adaptiveEnabled: false, maxDeepPerQuestion: 2, focusTrackingEnabled: true,
    });
    expect(sessionStorage.getItem('isas-practice-wizard-draft')).toContain('user-1');
    returned.unmount();

    // F5 khi đang ở bước tiêu chí phải giữ lựa chọn đã khôi phục.
    const refreshed = renderFlow();
    await waitFor(() => expect(refreshed.result.current.step).toBe(6));
    expect(refreshed.result.current).toMatchObject({
      jobCategory: 'BE', cvId: 'cv-1', jdId: 'jd-1', jdText: 'Important JD text',
      jdTab: 'text', timeLimitSec: 240, questionCount: 8, seniority: 'Senior',
      adaptiveEnabled: false, maxDeepPerQuestion: 2, focusTrackingEnabled: true,
    });
  });

  it('reloads the rubric when the job category changes', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    mocks.getRubric.mockResolvedValue({ criteria: [
      { id: 'fe-1', name: 'Tư duy UI', description: '', weight: 100, maxScore: 5 },
    ], isCustom: true });
    act(() => result.current.setJobCategory('FE'));
    await waitFor(() => expect(result.current.rubricCriteria.map((criterion) => criterion.id)).toEqual(['fe-1']));
    expect(result.current.rubricIsCustom).toBe(true);
  });
});

describe('usePracticeSetupFlow — tải danh sách CV', () => {
  it('restored CV/JD draft resolves and displays both saved file names at the summary step', async () => {
    savePracticeWizardDraft('user-1', {
      jobCategory: 'BE', cvId: 'cv-1', jdId: 'jd-1', jdText: '', jdTab: 'file',
      timeLimitSec: 120, questionCount: 5, seniority: 'Junior', adaptiveEnabled: true,
      maxDeepPerQuestion: 3, focusTrackingEnabled: false, language: 'vi',
    });
    const { result } = renderFlow();

    await waitFor(() => expect(result.current.step).toBe(6));
    expect(mocks.listUploadedCvs).not.toHaveBeenCalled();
    expect(mocks.listFiles).not.toHaveBeenCalled();

    act(() => result.current.goToStep(7));
    await waitFor(() => {
      expect(result.current.selectedCv?.fileName).toBe('cv.pdf');
      expect(result.current.selectedJd?.originalName).toBe('senior-backend-role.pdf');
    });

    render(<PracticeSetupSummaryStep
      jobCategory={result.current.jobCategory}
      cvFile={result.current.selectedCv}
      jdFile={result.current.selectedJd}
      jdText={result.current.jdText}
      jdTab={result.current.jdTab}
      timeLimitSec={result.current.timeLimitSec}
      seniority={result.current.seniority}
      questionCount={result.current.questionCount}
      adaptiveEnabled={result.current.adaptiveEnabled}
      maxDeepPerQuestion={result.current.maxDeepPerQuestion}
      criteria={result.current.rubricCriteria}
      canStart={result.current.canStart}
      isCreating={false}
      errorCode={null}
      errorMessage={null}
      onBack={() => undefined}
      onEditCriteria={() => undefined}
      onStart={() => undefined}
      onClearError={() => undefined}
    />);
    expect(screen.getByText('cv.pdf')).toBeTruthy();
    expect(screen.getByText('senior-backend-role.pdf')).toBeTruthy();
  });

  it('báo lỗi thay vì hiện danh sách rỗng khi mạng hỏng, và tải lại được', async () => {
    mocks.listUploadedCvs.mockRejectedValueOnce(new Error('network down'));
    const { result } = renderFlow();

    act(() => result.current.goToStep(1));
    await waitFor(() => expect(result.current.cvError).toBe(true));
    expect(result.current.cvFiles).toEqual([]);
    expect(result.current.loadingCv).toBe(false);

    await act(async () => {
      await result.current.retryCvFiles();
    });

    expect(result.current.cvError).toBe(false);
    expect(result.current.cvFiles).toEqual(CV_FILES);
  });
});

describe('usePracticeSetupFlow — lựa chọn số câu hỏi', () => {
  it('cho thử lại khi session-options lỗi thay vì khoá nút bắt đầu vĩnh viễn', async () => {
    mocks.getPracticeSessionOptions.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderFlow();

    act(() => result.current.setJobCategory('BE'));
    await waitFor(() => expect(result.current.sessionOptionsError).not.toBeNull());
    expect(result.current.canStart).toBe(false);

    act(() => result.current.retrySessionOptions());

    await waitFor(() => expect(result.current.sessionOptions).not.toBeNull());
    expect(result.current.sessionOptionsError).toBeNull();
  });
});

describe('usePracticeSetupFlow — trình độ phỏng vấn', () => {
  it('không tự chọn trình độ nào cho ứng viên', () => {
    const { result } = renderFlow();

    // Mặc định im lặng 'Junior' từng khiến ứng viên senior nhận trọn bộ câu hỏi Junior.
    expect(result.current.seniority).toBeNull();
  });

  it('chưa chọn trình độ thì không cho bắt đầu buổi luyện', async () => {
    const { result } = renderFlow();
    act(() => result.current.setJobCategory('BE'));
    await waitFor(() => expect(result.current.sessionOptions).not.toBeNull());
    act(() => result.current.goToStep(6));
    await waitFor(() => expect(result.current.rubricCriteria).toHaveLength(CRITERIA.length));

    expect(result.current.seniority).toBeNull();
    expect(result.current.canStart).toBe(false);

    act(() => result.current.setSeniority('Senior'));

    await waitFor(() => expect(result.current.canStart).toBe(true));
  });

  it('gửi đúng trình độ ứng viên đã chọn, không phải mặc định', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    act(() => result.current.setSeniority('Senior'));
    await waitFor(() => expect(result.current.canStart).toBe(true));

    await act(async () => {
      await result.current.handleStart();
    });

    expect(mocks.createPracticeSession.mock.calls[0][0].seniority).toBe('Senior');
  });

  it('không bao giờ bỏ trống trình độ trong payload — server sẽ tự điền Junior', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    await waitFor(() => expect(result.current.canStart).toBe(true));

    await act(async () => {
      await result.current.handleStart();
    });

    const payload = mocks.createPracticeSession.mock.calls[0][0];
    expect(payload.seniority).toBeDefined();
  });
});

describe('usePracticeSetupFlow — chốt và tạo buổi luyện', () => {
  it('chỉ tạo một buổi luyện khi nút bắt đầu bị bấm hai lần liên tiếp', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    await waitFor(() => expect(result.current.canStart).toBe(true));

    await act(async () => {
      await Promise.all([result.current.handleStart(), result.current.handleStart()]);
    });

    expect(mocks.createPracticeSession).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
  });

  it('gửi đúng lựa chọn của ứng viên lên máy chủ', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    act(() => {
      result.current.setCvId('cv-1');
      result.current.setJdTab('text');
      result.current.setJdText('  Mô tả công việc  ');
      result.current.setTimeLimitSec(240);
      result.current.setQuestionCount(7);
      result.current.setSeniority('Middle');
    });
    await waitFor(() => expect(result.current.canStart).toBe(true));

    await act(async () => {
      await result.current.handleStart();
    });

    expect(mocks.createPracticeSession).toHaveBeenCalledWith({
      jobCategory: 'BE',
      cvId: 'cv-1',
      jdText: 'Mô tả công việc',
      jdId: undefined,
      timeLimitSec: 240,
      questionCount: 7,
      language: 'vi',
      seniority: 'Middle',
      // Mặc định bật đào sâu ⇒ không gửi cờ (server đã bật sẵn, gửi `true` không đổi được gì).
      adaptiveEnabled: undefined,
      // Lấy từ dải server trả về, không phải hằng số phía FE.
      maxDeepPerQuestion: 3,
    });
    // Server KHÔNG có trường này — nó đã được gửi đi vô ích suốt và bị bỏ qua im lặng.
    expect(mocks.createPracticeSession.mock.calls[0][0]).not.toHaveProperty('rubricCriterionIds');
  });

  it('gửi adaptiveEnabled=false và bỏ độ sâu khi chọn buổi tĩnh', async () => {
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    act(() => {
      result.current.setAdaptiveEnabled(false);
    });
    await waitFor(() => expect(result.current.canStart).toBe(true));

    await act(async () => {
      await result.current.handleStart();
    });

    const payload = mocks.createPracticeSession.mock.calls[0][0];
    expect(payload.adaptiveEnabled).toBe(false);
    expect(payload.maxDeepPerQuestion).toBeUndefined();
  });

  // Đổi ngành/ngôn ngữ có thể đổi dải cho phép (gói khác, kill-switch khác). Giữ nguyên một giá trị
  // vừa thành không hợp lệ là để ứng viên bấm "Bắt đầu" rồi nhận 400 mà không hiểu vì sao.
  it('kẹp độ sâu về dải server khi server chỉ cho tối đa 1', async () => {
    mocks.getPracticeSessionOptions.mockResolvedValue({
      ...SESSION_OPTIONS,
      maxDeepPerQuestion: 1,
      maxDeepPerQuestionMax: 1,
    });
    const { result } = renderFlow();
    await goToCriteriaStep(result);

    await waitFor(() => expect(result.current.maxDeepPerQuestion).toBe(1));
  });

  it('không gửi độ sâu khi server không cho chọn', async () => {
    mocks.getPracticeSessionOptions.mockResolvedValue({
      ...SESSION_OPTIONS,
      adaptiveEnabled: false,
      maxDeepPerQuestion: 0,
      maxDeepPerQuestionMin: 0,
      maxDeepPerQuestionMax: 0,
    });
    const { result } = renderFlow();
    await goToCriteriaStep(result);
    await waitFor(() => expect(result.current.maxDeepPerQuestion).toBeNull());

    await act(async () => {
      await result.current.handleStart();
    });
    expect(mocks.createPracticeSession.mock.calls[0][0].maxDeepPerQuestion).toBeUndefined();
  });
});
