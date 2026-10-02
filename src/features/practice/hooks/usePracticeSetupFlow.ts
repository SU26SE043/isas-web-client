import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { FileRecord, UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { practiceSetupService } from '../services/practiceSetup.service';
import {
  createPracticeSession,
  getPracticeSessionOptions,
} from '../services/b2cPracticeSession.service';
import { mapCreatePracticeSessionError } from '../utils/b2cPracticeSessionErrors';
import {
  buildCreatePracticeSessionRequest,
  canStartPracticeSession,
} from '../utils/buildCreatePracticeSessionRequest';
import type {
  CreatePracticeSessionErrorCode,
  PracticeJobCategory,
  PracticeSetupState,
  PracticeSessionOptions,
  PracticeSeniority,
  PracticeTimeLimitSec,
} from '../types/b2cPracticeSession.types';
import { PRACTICE_JD_TEXT_MAX_CHARS } from '../types/b2cPracticeSession.types';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { usesMockData } from '@/shared/mock';
import { paymentService } from '@/features/payment/services/payment.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { savePracticeWizardDraft, takePracticeWizardDraft } from '../utils/practiceWizardDraft';

export const PRACTICE_SETUP_STEP_COUNT = 8;

export function usePracticeSetupFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, setLanguage, t } = useLanguage();
  const userId = useAuthStore((state) => state.user?.id);
  const resetInterviewFlow = useInterviewFlowStore((s) => s.reset);
  const hydrateFromSession = useB2cPracticeInterviewStore((s) => s.hydrateFromSession);
  const resetInterviewStore = useB2cPracticeInterviewStore((s) => s.reset);

  const [step, setStep] = useState(0);
  const [jobCategory, setJobCategory] = useState<PracticeJobCategory | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');
  const [jdTab, setJdTab] = useState<'file' | 'text'>('file');
  const [timeLimitSec, setTimeLimitSec] = useState<PracticeTimeLimitSec>(120);
  const [questionCount, setQuestionCount] = useState(5);
  // KHÔNG mặc định trình độ. Mặc định 'Junior' im lặng khiến ứng viên senior không bấm đổi
  // bước này vẫn nhận trọn bộ câu hỏi Junior — không lỗi, không cảnh báo, sau khi đã trừ credit.
  const [seniority, setSeniority] = useState<PracticeSeniority | null>(null);
  // Mặc định BẬT đào sâu — giữ nguyên hành vi mà mọi buổi đang có; ứng viên phải chủ động tắt.
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true);
  // null = chưa biết dải server cho phép ⇒ không gửi, để server dùng mặc định của chính nó.
  const [maxDeepPerQuestion, setMaxDeepPerQuestion] = useState<number | null>(null);
  const [focusTrackingEnabled, setFocusTrackingEnabled] = useState(false);
  const [sessionOptions, setSessionOptions] = useState<PracticeSessionOptions | null>(null);
  const [loadingSessionOptions, setLoadingSessionOptions] = useState(false);
  const [sessionOptionsError, setSessionOptionsError] = useState<string | null>(null);

  const [sessionOptionsReloadId, setSessionOptionsReloadId] = useState(0);

  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [jdFiles, setJdFiles] = useState<FileRecord[]>([]);
  const [loadingCv, setLoadingCv] = useState(false);
  const [cvError, setCvError] = useState(false);
  const [loadingJd, setLoadingJd] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [createErrorCode, setCreateErrorCode] = useState<CreatePracticeSessionErrorCode | null>(null);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const restoredForUserRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || restoredForUserRef.current === userId) return;
    restoredForUserRef.current = userId;
    const draft = takePracticeWizardDraft(userId);
    if (!draft) return;
    void queryClient.invalidateQueries({
      queryKey: ['practice', 'rubric', draft.jobCategory, draft.language],
      exact: true,
    });
    setJobCategory(draft.jobCategory);
    setCvId(draft.cvId);
    setJdId(draft.jdId);
    setJdText(draft.jdText);
    setJdTab(draft.jdTab);
    setTimeLimitSec(draft.timeLimitSec);
    setQuestionCount(draft.questionCount);
    setSeniority(draft.seniority);
    setAdaptiveEnabled(draft.adaptiveEnabled);
    setMaxDeepPerQuestion(draft.maxDeepPerQuestion);
    setFocusTrackingEnabled(draft.focusTrackingEnabled);
    setLanguage(draft.language);
    setStep(6);
  }, [queryClient, setLanguage, userId]);

  const setupState: PracticeSetupState = useMemo(
    () => ({
      jobCategory,
      cvId,
      jdId: jdTab === 'file' ? jdId : null,
      jdText: jdTab === 'text' ? jdText : '',
      timeLimitSec,
      questionCount,
      rubricCriterionIds: [],
      language,
      seniority,
      adaptiveEnabled,
      maxDeepPerQuestion,
      focusTrackingEnabled,
    }),
    [adaptiveEnabled, cvId, jdId, jdTab, jdText, jobCategory, language, maxDeepPerQuestion,
      questionCount, seniority, timeLimitSec, focusTrackingEnabled],
  );

  const jdTextTooLong = jdTab === 'text' && jdText.trim().length > PRACTICE_JD_TEXT_MAX_CHARS;
  const canStart =
    canStartPracticeSession(setupState) &&
    Boolean(sessionOptions) &&
    !loadingSessionOptions &&
    !sessionOptionsError &&
    !isCreatingSession &&
    !jdTextTooLong;

  const rubricQuery = useQuery({
    queryKey: ['practice', 'rubric', jobCategory, language],
    queryFn: ({ signal }) => practiceSetupService.getRubricDetails(jobCategory ?? '', signal, language),
    enabled: step === 6 && Boolean(jobCategory),
    retry: false,
    refetchOnMount: 'always',
  });

  const openRubricEditor = useCallback(() => {
    if (!userId || !jobCategory || uploadingCv || loadingCv || loadingJd || isCreatingSession) return;
    const saved = savePracticeWizardDraft(userId, {
      jobCategory, cvId, jdId, jdText, jdTab, timeLimitSec, questionCount,
      seniority, adaptiveEnabled, maxDeepPerQuestion, focusTrackingEnabled, language,
    });
    if (!saved) {
      setDraftError(t('practice.setup.gradingCriteria.storageError'));
      return;
    }
    setDraftError(null);
    const params = new URLSearchParams({ category: jobCategory, language, returnTo: '/candidate/practice/setup' });
    navigate(`/candidate/rubrics?${params.toString()}`);
  }, [adaptiveEnabled, cvId, focusTrackingEnabled, isCreatingSession, jdId, jdTab, jdText,
    jobCategory, language, loadingCv, loadingJd, maxDeepPerQuestion, navigate, questionCount,
    seniority, t, timeLimitSec, uploadingCv, userId]);

  useEffect(() => {
    if (!jobCategory) {
      setSessionOptions(null);
      setSessionOptionsError(null);
      return;
    }

    let cancelled = false;
    setLoadingSessionOptions(true);
    setSessionOptionsError(null);
    void getPracticeSessionOptions(jobCategory, language)
      .then((options) => {
        if (cancelled) return;
        setSessionOptions(options);
        setQuestionCount((current) => {
          const min = options.questionCountMin;
          const max = options.questionCountMax;
          return current >= min && current <= max ? current : options.defaultQuestionCount;
        });
        // Kẹp lại theo dải server, đúng khuôn `questionCount` ngay trên. Đổi ngành/ngôn ngữ có thể
        // đổi dải (gói khác, kill-switch khác), nên giá trị đang giữ có thể vừa thành không hợp lệ —
        // giữ nguyên nó là để ứng viên bấm "Bắt đầu" rồi nhận 400 mà không hiểu vì sao.
        setMaxDeepPerQuestion((current) => {
          const max = options.maxDeepPerQuestionMax;
          if (max <= 0) return null;   // server không cho chọn ⇒ đừng gửi gì
          const min = options.maxDeepPerQuestionMin;
          return current !== null && current >= min && current <= max
            ? current
            : Math.min(options.maxDeepPerQuestion, max);
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSessionOptions(null);
        setSessionOptionsError(error instanceof Error ? error.message : 'session-options-failed');
      })
      .finally(() => {
        if (!cancelled) setLoadingSessionOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobCategory, language, sessionOptionsReloadId]);

  // Không tải được session-options thì `canStart` tắt vĩnh viễn: ứng viên đi hết
  // wizard rồi đứng ở bước chốt với nút "Bắt đầu" xám ngắt, chỉ F5 hoặc đổi
  // ngành mới thoát. Cho phép thử lại tại chỗ.
  const retrySessionOptions = useCallback(() => {
    setSessionOptionsReloadId((value) => value + 1);
  }, []);

  // Lượt tải mới luôn thắng lượt cũ: StrictMode gắn-tháo-gắn và việc đi tới/lùi
  // lại giữa các bước đều bắn nhiều request chồng nhau.
  const cvRequestIdRef = useRef(0);

  const loadCvFiles = useCallback(async () => {
    const requestId = cvRequestIdRef.current + 1;
    cvRequestIdRef.current = requestId;
    setLoadingCv(true);
    setCvError(false);
    try {
      const files = await practiceSetupService.listUploadedCvs();
      if (requestId !== cvRequestIdRef.current) return;
      setCvFiles(files);
    } catch {
      // Thiếu nhánh này thì lỗi mạng thành unhandled rejection và bước chọn CV
      // hiện đúng như khi tài khoản chưa có CV nào.
      if (requestId !== cvRequestIdRef.current) return;
      setCvError(true);
    } finally {
      if (requestId === cvRequestIdRef.current) setLoadingCv(false);
    }
  }, []);

  const loadJdFiles = useCallback(async () => {
    setLoadingJd(true);
    try {
      const files = await cvAnalysisService.listFiles();
      setJdFiles(files.filter((f) => String(f.fileType).toLowerCase() === 'jd'));
    } catch {
      setJdFiles([]);
    } finally {
      setLoadingJd(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1) void loadCvFiles();
    if (step === 2) void loadJdFiles();
  }, [loadCvFiles, loadJdFiles, step]);

  const goToStep = useCallback((next: number) => {
    setStep(Math.max(0, Math.min(PRACTICE_SETUP_STEP_COUNT - 1, next)));
  }, []);

  const handleUploadCv = useCallback(
    async (file: File) => {
      setUploadingCv(true);
      setUploadError(null);
      try {
        const uploaded = await practiceSetupService.uploadCv(file);
        setCvFiles((prev) => [uploaded, ...prev.filter((item) => item.id !== uploaded.id)]);
        setCvId(uploaded.id);
      } catch {
        setUploadError(t('practice.setup.cv.uploadError'));
      } finally {
        setUploadingCv(false);
      }
    },
    [t],
  );

  // Nút "Bắt đầu" chỉ tắt sau khi React vẽ lại; hai cú bấm rơi vào cùng một
  // nhịp thì cả hai đều thấy `canStart` còn bật ⇒ hai buổi luyện, hai lần trừ
  // credit. Chốt bằng ref để chặn ngay trong nhịp đầu.
  const createInFlightRef = useRef(false);

  const handleStart = useCallback(async () => {
    if (!canStart || !jobCategory || createInFlightRef.current) return;
    createInFlightRef.current = true;
    setIsCreatingSession(true);
    setCreateErrorCode(null);
    setCreateErrorMessage(null);
    try {
      const payload = buildCreatePracticeSessionRequest(setupState);
      resetInterviewStore();
      const session = await createPracticeSession(payload);
      if (usesMockData('payment')) {
        await paymentService.reserveTokens(session.id, 800);
      }
      hydrateFromSession(session);
      resetInterviewFlow(session.id);
      // Prep flow handles consent + device check after session creation.
      navigate(`/interview/${session.id}/prepare`, { replace: true });
    } catch (error) {
      const mapped = mapCreatePracticeSessionError(error);
      setCreateErrorCode(mapped.code);
      setCreateErrorMessage(mapped.message);
      setIsCreatingSession(false);
    } finally {
      createInFlightRef.current = false;
    }
  }, [
    canStart,
    hydrateFromSession,
    jobCategory,
    navigate,
    resetInterviewFlow,
    resetInterviewStore,
    setupState,
  ]);

  const selectedCv = useMemo(
    () => cvFiles.find((f) => f.id === cvId) ?? null,
    [cvFiles, cvId],
  );
  const selectedJd = useMemo(
    () => jdFiles.find((f) => f.id === jdId) ?? null,
    [jdFiles, jdId],
  );

  return {
    step,
    goToStep,
    jobCategory,
    setJobCategory,
    cvId,
    setCvId,
    jdId,
    setJdId,
    jdText,
    setJdText,
    jdTab,
    setJdTab,
    timeLimitSec,
    setTimeLimitSec,
    questionCount,
    setQuestionCount,
    rubricCriteria: rubricQuery.data?.criteria ?? [],
    rubricIsCustom: rubricQuery.data?.isCustom ?? false,
    openRubricEditor,
    draftError,
    loadingRubric: rubricQuery.isLoading,
    rubricError: rubricQuery.isError,
    retryRubric: () => void rubricQuery.refetch(),
    seniority,
    setSeniority,
    adaptiveEnabled,
    setAdaptiveEnabled,
    maxDeepPerQuestion,
    setMaxDeepPerQuestion,
    focusTrackingEnabled,
    setFocusTrackingEnabled,
    language,
    sessionOptions,
    loadingSessionOptions,
    sessionOptionsError,
    retrySessionOptions,
    cvFiles,
    jdFiles,
    loadingCv,
    cvError,
    retryCvFiles: loadCvFiles,
    loadingJd,
    uploadingCv,
    uploadError,
    handleUploadCv,
    isCreatingSession,
    createErrorCode,
    createErrorMessage,
    canStart,
    jdTextTooLong,
    selectedCv,
    selectedJd,
    handleStart,
    clearCreateError: () => {
      setCreateErrorCode(null);
      setCreateErrorMessage(null);
    },
  };
}
