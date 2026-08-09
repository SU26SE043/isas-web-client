import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export const PRACTICE_SETUP_STEP_COUNT = 7;

export function usePracticeSetupFlow() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
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
  const [rubricCriterionIds, setRubricCriterionIds] = useState<string[]>([]);
  const [seniority, setSeniority] = useState<PracticeSeniority>('Junior');
  const [sessionOptions, setSessionOptions] = useState<PracticeSessionOptions | null>(null);
  const [loadingSessionOptions, setLoadingSessionOptions] = useState(false);
  const [sessionOptionsError, setSessionOptionsError] = useState<string | null>(null);

  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [jdFiles, setJdFiles] = useState<FileRecord[]>([]);
  const [loadingCv, setLoadingCv] = useState(false);
  const [loadingJd, setLoadingJd] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [createErrorCode, setCreateErrorCode] = useState<CreatePracticeSessionErrorCode | null>(null);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  const setupState: PracticeSetupState = useMemo(
    () => ({
      jobCategory,
      cvId,
      jdId: jdTab === 'file' ? jdId : null,
      jdText: jdTab === 'text' ? jdText : '',
      timeLimitSec,
      questionCount,
      rubricCriterionIds,
      language,
      seniority,
    }),
    [cvId, jdId, jdTab, jdText, jobCategory, language, questionCount, rubricCriterionIds, seniority, timeLimitSec],
  );

  const jdTextTooLong = jdTab === 'text' && jdText.trim().length > PRACTICE_JD_TEXT_MAX_CHARS;
  const canStart =
    canStartPracticeSession(setupState) &&
    rubricCriterionIds.length > 0 &&
    Boolean(sessionOptions) &&
    !loadingSessionOptions &&
    !sessionOptionsError &&
    !isCreatingSession &&
    !jdTextTooLong;

  const rubricQuery = useQuery({
    queryKey: ['practice', 'rubric', jobCategory],
    queryFn: ({ signal }) => practiceSetupService.getRubric(jobCategory ?? '', signal),
    enabled: step === 5 && Boolean(jobCategory),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const validRubricIds = useMemo(
    () => new Set((rubricQuery.data ?? []).filter((item) => item.id && item.name.trim()).map((item) => item.id)),
    [rubricQuery.data],
  );

  const validSelectedRubricIds = useMemo(
    () => rubricCriterionIds.filter((id) => validRubricIds.has(id)),
    [rubricCriterionIds, validRubricIds],
  );

  useEffect(() => {
    setRubricCriterionIds([]);
  }, [jobCategory]);

  useEffect(() => {
    if (!rubricQuery.data) return;

    if (validSelectedRubricIds.length !== rubricCriterionIds.length) {
      setRubricCriterionIds(validSelectedRubricIds);
    }
  }, [rubricQuery.data, rubricCriterionIds.length, validSelectedRubricIds]);

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
  }, [jobCategory, language]);

  const loadCvFiles = useCallback(async () => {
    setLoadingCv(true);
    try {
      const files = await practiceSetupService.listUploadedCvs();
      setCvFiles(files);
    } finally {
      setLoadingCv(false);
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
        const uploaded = await practiceSetupService.uploadCv(file, language);
        setCvFiles((prev) => [uploaded, ...prev.filter((item) => item.id !== uploaded.id)]);
        setCvId(uploaded.id);
      } catch {
        setUploadError(t('practice.setup.cv.uploadError'));
      } finally {
        setUploadingCv(false);
      }
    },
    [language, t],
  );

  const handleStart = useCallback(async () => {
    if (!canStart || !jobCategory) return;
    setIsCreatingSession(true);
    setCreateErrorCode(null);
    setCreateErrorMessage(null);
    try {
      const payload = buildCreatePracticeSessionRequest(setupState);
      resetInterviewStore();
      const session = await createPracticeSession(payload);
      hydrateFromSession(session);
      resetInterviewFlow(session.id);
      // Prep flow handles consent + device check after session creation.
      navigate(`/interview/${session.id}/prepare`, { replace: true });
    } catch (error) {
      const mapped = mapCreatePracticeSessionError(error);
      setCreateErrorCode(mapped.code);
      setCreateErrorMessage(mapped.message);
      setIsCreatingSession(false);
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
    rubricCriterionIds: validSelectedRubricIds,
    setRubricCriterionIds,
    rubricCriteria: rubricQuery.data ?? [],
    loadingRubric: rubricQuery.isLoading,
    rubricError: rubricQuery.isError,
    retryRubric: () => void rubricQuery.refetch(),
    seniority,
    setSeniority,
    language,
    sessionOptions,
    loadingSessionOptions,
    sessionOptionsError,
    cvFiles,
    jdFiles,
    loadingCv,
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
