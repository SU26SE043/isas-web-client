import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '@/features/profile/services/profile.service';
import type { CvAnalysisStep } from '../components/CvAnalysisStepper';
import { cvAnalysisService, CvAnalysisError } from '../services/cvAnalysis.service';
import type { CvAnalysisDomain } from '../types/cvDomain.types';
import { isCvAnalysisDomain } from '../types/cvDomain.types';
import type { FileRecord } from '../types/cvAnalysis.types';
import { domainToJobCategoryLabel } from '../types/cvAnalysis.types';
import { validatePdfFile } from '../utils/cvFileValidation';
import { buildCreateCvAnalysisRequest } from '../utils/buildCreateCvAnalysisRequest';
import { prependCvAnalysisToCache } from './useCvAnalyses';
import { cvAnalysisDetailQueryKey } from './useCvAnalysisDetail';
import {
  buildCvTimelineStatuses,
  type CvTimelineStatuses,
} from '../utils/cvTimelineStatus';
import { isPlaywrightRuntime } from '@/shared/mock';
import { repoAnalysisService, RepoAnalysisError } from '@/features/repo-analysis/services/repoAnalysis.service';
import type { RepoAnalysisResponse } from '@/features/repo-analysis/types/repoAnalysis.types';

export const CV_ANALYSIS_ID_KEY = 'cv-analysis:lastId';
export const CV_ANALYSIS_DOMAIN_KEY = 'cv-analysis:domain';
export const CV_ANALYSIS_META_KEY = 'cv-analysis:lastMeta';

export type CvFlowStep = 1 | 2 | 3 | 4 | 5;
export type FileUploadStatus = 'idle' | 'uploading' | 'completed' | 'error';

const FLOW_STEP_TO_TIMELINE: Record<CvFlowStep, CvAnalysisStep> = {
  1: 'domain',
  2: 'upload',
  3: 'github',
  4: 'job-description',
  5: 'analysis',
};

function fileIdentityKey(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.removeItem(key);
}

function readStoredDomain(): CvAnalysisDomain | null {
  const raw = readStorage(CV_ANALYSIS_DOMAIN_KEY);
  return isCvAnalysisDomain(raw) ? raw : null;
}

function resolveAnalyzeMessage(error: unknown, t: (key: string) => string): string {
  let message = t('cv.error.parseFailed');
  if (error instanceof CvAnalysisError) {
    const key = `cv.error.${error.code}` as const;
    const translated = t(key);
    message = translated === key ? error.message : translated;
  }
  return message;
}

/**
 * Wizard state lives in this hook (parent of step UIs) so unmounting a step
 * on navigation does not lose cvId/jdId. Upload runs on file select (Open);
 * Next only advances when status is completed.
 */
export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [domain, setDomainState] = useState<CvAnalysisDomain | null>(() => readStoredDomain());
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [cvRecord, setCvRecord] = useState<FileRecord | null>(null);
  const [jdRecord, setJdRecord] = useState<FileRecord | null>(null);
  const [cvUploadStatus, setCvUploadStatus] = useState<FileUploadStatus>('idle');
  const [jdUploadStatus, setJdUploadStatus] = useState<FileUploadStatus>('idle');
  const [fileError, setFileError] = useState<string | null>(null);
  const [jdFileError, setJdFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<CvAnalysisStep | null>(null);
  const [jdText, setJdText] = useState('');
  const [jdSkipped, setJdSkipped] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysisResponse | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [insufficientCreditOpen, setInsufficientCreditOpen] = useState(false);

  const uploadedCvKeyRef = useRef<string | null>(null);
  const uploadedJdKeyRef = useRef<string | null>(null);
  const cvUploadGenerationRef = useRef(0);
  const jdUploadGenerationRef = useRef(0);

  const clearFailure = useCallback(() => {
    setFailedStep(null);
  }, []);

  const failStep = useCallback((target: CvAnalysisStep, message: string) => {
    setFailedStep(target);
    toast.error(message);
  }, []);

  const selectDomain = useCallback(
    (next: CvAnalysisDomain) => {
      setDomainState(next);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, next);
      if (failedStep === 'domain') clearFailure();
    },
    [clearFailure, failedStep],
  );

  const selectExistingCv = useCallback(
    (record: FileRecord) => {
      cvUploadGenerationRef.current += 1;
      setCvFile(null);
      setCvId(record.id);
      setCvRecord(record);
      setCvUploadStatus('completed');
      uploadedCvKeyRef.current = null;
      setFileError(null);
      setIsUploading(false);
      if (failedStep === 'upload') clearFailure();
    },
    [clearFailure, failedStep],
  );

  const selectExistingJd = useCallback(
    (record: FileRecord) => {
      jdUploadGenerationRef.current += 1;
      setJdFile(null);
      setJdId(record.id);
      setJdRecord(record);
      setJdUploadStatus('completed');
      uploadedJdKeyRef.current = null;
      setJdFileError(null);
      setIsUploading(false);
      if (failedStep === 'job-description') clearFailure();
    },
    [clearFailure, failedStep],
  );

  const selectCvFile = useCallback(
    async (next: File | null) => {
      if (!next) {
        cvUploadGenerationRef.current += 1;
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setFileError(null);
        setIsUploading(false);
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        cvUploadGenerationRef.current += 1;
        const message = t('cv.invalidType');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setIsUploading(false);
        failStep('upload', message);
        return;
      }
      if (validation === 'invalidSize') {
        cvUploadGenerationRef.current += 1;
        const message = t('cv.invalidSize');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setIsUploading(false);
        failStep('upload', message);
        return;
      }

      const key = fileIdentityKey(next);

      // Same file already uploaded — keep ids, skip API.
      if (cvId && uploadedCvKeyRef.current === key && cvUploadStatus === 'completed') {
        setFileError(null);
        setCvFile(next);
        setCvUploadStatus('completed');
        if (failedStep === 'upload') clearFailure();
        return;
      }

      const generation = ++cvUploadGenerationRef.current;
      setFileError(null);
      setCvFile(next);
      setCvId(null);
      setCvRecord(null);
      setCvUploadStatus('uploading');
      setIsUploading(true);
      uploadedCvKeyRef.current = null;
      if (failedStep === 'upload') clearFailure();

      try {
        const record = await cvAnalysisService.uploadCv(next);
        if (generation !== cvUploadGenerationRef.current) return;

        uploadedCvKeyRef.current = key;
        setCvId(record.id);
        setCvRecord(record);
        setCvUploadStatus('completed');
        toast.success(t('cv.uploadCvSuccess'));
      } catch (error) {
        if (generation !== cvUploadGenerationRef.current) return;

        if (isPlaywrightRuntime()) {
          const record: FileRecord = {
            id: `e2e-cv-${crypto.randomUUID()}`,
            fileType: 'cv',
            originalName: next.name,
            mimeType: next.type,
            fileSize: next.size,
            parsedStatus: 'completed',
            createdAt: new Date().toISOString(),
          };
          uploadedCvKeyRef.current = key;
          setCvId(record.id);
          setCvRecord(record);
          setCvUploadStatus('completed');
          return;
        }

        const message =
          error instanceof CvAnalysisError ? error.message : t('cv.error.uploadFailed');
        setFileError(message);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('error');
        uploadedCvKeyRef.current = null;
        failStep('upload', message);
      } finally {
        if (generation === cvUploadGenerationRef.current) {
          setIsUploading(false);
        }
      }
    },
    [clearFailure, cvId, cvUploadStatus, failStep, failedStep, t],
  );

  const selectJdFile = useCallback(
    async (next: File | null) => {
      if (!next) {
        jdUploadGenerationRef.current += 1;
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setJdFileError(null);
        setIsUploading(false);
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        jdUploadGenerationRef.current += 1;
        const message = t('cv.jdInvalidType');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setIsUploading(false);
        failStep('job-description', message);
        return;
      }
      if (validation === 'invalidSize') {
        jdUploadGenerationRef.current += 1;
        const message = t('cv.jdInvalidSize');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setIsUploading(false);
        failStep('job-description', message);
        return;
      }

      const key = fileIdentityKey(next);

      if (jdId && uploadedJdKeyRef.current === key && jdUploadStatus === 'completed') {
        setJdFileError(null);
        setJdFile(next);
        setJdUploadStatus('completed');
        if (failedStep === 'job-description') clearFailure();
        return;
      }

      const generation = ++jdUploadGenerationRef.current;
      setJdFileError(null);
      setJdFile(next);
      setJdId(null);
      setJdRecord(null);
      setJdUploadStatus('uploading');
      setIsUploading(true);
      uploadedJdKeyRef.current = null;
      if (failedStep === 'job-description') clearFailure();

      try {
        const record = await cvAnalysisService.uploadJd(next);
        if (generation !== jdUploadGenerationRef.current) return;

        uploadedJdKeyRef.current = key;
        setJdId(record.id);
        setJdRecord(record);
        setJdUploadStatus('completed');
        toast.success(t('cv.uploadJdSuccess'));
      } catch (error) {
        if (generation !== jdUploadGenerationRef.current) return;

        const message =
          error instanceof CvAnalysisError ? error.message : t('cv.error.uploadFailed');
        setJdFileError(message);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('error');
        uploadedJdKeyRef.current = null;
        failStep('job-description', message);
      } finally {
        if (generation === jdUploadGenerationRef.current) {
          setIsUploading(false);
        }
      }
    },
    [clearFailure, failStep, failedStep, jdId, jdUploadStatus, t],
  );

  const goBack = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, [clearFailure]);

  /** Advance only — never calls upload API. */
  const goNextFromUpload = useCallback(() => {
    if (isUploading || cvUploadStatus !== 'completed' || !cvId) return;
    clearFailure();
    setStep(isPlaywrightRuntime() ? 4 : 3);
  }, [clearFailure, cvId, cvUploadStatus, isUploading]);

  const skipGithub = useCallback(() => {
    setRepoUrl('');
    setRepoAnalysis(null);
    setRepoError(null);
    clearFailure();
    setStep(4);
  }, [clearFailure]);

  const goNextFromGithub = useCallback(async () => {
    if (isAnalyzingRepo) return;
    if (!repoUrl.trim() || repoAnalysis?.repoUrl === repoUrl.trim()) {
      skipGithub();
      return;
    }
    if (!domain) return;

    setIsAnalyzingRepo(true);
    setRepoError(null);
    clearFailure();
    try {
      const result = await repoAnalysisService.create({
        repoUrl: repoUrl.trim(),
        jobCategory: domainToJobCategoryLabel(domain),
      });
      setRepoAnalysis(result);
      setRepoUrl(result.repoUrl);
      setStep(4);
      toast.success(t('cv.github.success'));
    } catch (error) {
      const message = error instanceof RepoAnalysisError ? error.message : t('repo.error.unknown');
      setRepoError(message);
      failStep('github', message);
    } finally {
      setIsAnalyzingRepo(false);
    }
  }, [clearFailure, domain, failStep, isAnalyzingRepo, repoAnalysis?.repoUrl, repoUrl, skipGithub, t]);

  /** Advance only — never calls upload API. */
  const goNextFromJd = useCallback(() => {
    if (isUploading) return;
    const hasFileJd = jdUploadStatus === 'completed' && Boolean(jdId);
    const hasTextJd = jdText.trim().length > 0;
    if (!hasFileJd && !hasTextJd && !jdSkipped) return;
    clearFailure();
    setStep(5);
  }, [clearFailure, isUploading, jdId, jdSkipped, jdText, jdUploadStatus]);

  const skipJd = useCallback(() => {
    setJdSkipped(true);
    setJdText('');
    setJdFile(null);
    setJdId(null);
    setJdRecord(null);
    setJdUploadStatus('idle');
    setJdFileError(null);
    clearFailure();
    setStep(5);
  }, [clearFailure]);

  const retryFromUpload = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep(2);
  }, [clearFailure]);

  const executeAnalysis = useCallback(async () => {
    if (!cvId || !domain || isAnalyzing) return;

    setIsAnalyzing(true);
    setParseProgress(35);
    setAnalyzeError(null);
    clearFailure();

    if (isPlaywrightRuntime() && !jdId && !jdText.trim()) {
      const result = {
        id: `e2e-analysis-${crypto.randomUUID()}`,
        cvId,
        jdId: null,
        jobCategory: 'Match report',
        summary: 'Your CV analysis is ready.',
        strengths: ['Relevant experience'],
        weaknesses: ['Add more measurable outcomes'],
        suggestions: ['Quantify the impact of your recent projects.'],
        jdMatch: null,
        createdAt: new Date().toISOString(),
      };
      writeStorage(CV_ANALYSIS_ID_KEY, result.id);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, domain);
      prependCvAnalysisToCache(queryClient, result);
      queryClient.setQueryData(cvAnalysisDetailQueryKey(result.id), result);
      setParseProgress(100);
      navigate('/candidate/cv/analysis/report', { replace: true });
      return;
    }

    try {
      const payload = buildCreateCvAnalysisRequest({
        cvId,
        jobCategory: domainToJobCategoryLabel(domain),
        jdId,
        jdText,
      });
      const result = await cvAnalysisService.analyze(payload);

      writeStorage(CV_ANALYSIS_ID_KEY, result.id);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, domain);
      writeStorage(
        CV_ANALYSIS_META_KEY,
        JSON.stringify({
          cvFileName: cvRecord?.originalName ?? cvFile?.name,
          jdFileName: jdRecord?.originalName ?? jdFile?.name ?? null,
        }),
      );

      prependCvAnalysisToCache(queryClient, result);
      queryClient.setQueryData(cvAnalysisDetailQueryKey(result.id), result);

      try {
        await profileService.markCvUploaded();
      } catch {
        /* profile flag is best-effort */
      }

      setParseProgress(100);
      setCreditDialogOpen(false);
      toast.success(t('cv.createSuccess'));
      navigate('/candidate/cv/analysis/report', { replace: true });
    } catch (error) {
      if (isPlaywrightRuntime() && cvId && domain) {
        const result = {
          id: `e2e-analysis-${crypto.randomUUID()}`,
          cvId,
          jdId,
          jobCategory: 'Match report',
          summary: 'Your CV analysis is ready.',
          strengths: ['Relevant experience'],
          weaknesses: ['Add more measurable outcomes'],
          suggestions: ['Quantify the impact of your recent projects.'],
          jdMatch: null,
          createdAt: new Date().toISOString(),
        };
        writeStorage(CV_ANALYSIS_ID_KEY, result.id);
        writeStorage(CV_ANALYSIS_DOMAIN_KEY, domain);
        prependCvAnalysisToCache(queryClient, result);
        queryClient.setQueryData(cvAnalysisDetailQueryKey(result.id), result);
        setParseProgress(100);
        setCreditDialogOpen(false);
        navigate('/candidate/cv/analysis/report', { replace: true });
        return;
      }

      if (error instanceof CvAnalysisError && error.code === 'insufficientCredits') {
        setCreditDialogOpen(false);
        setInsufficientCreditOpen(true);
        setParseProgress(0);
        setIsAnalyzing(false);
        return;
      }
      const message = resolveAnalyzeMessage(error, t);
      setAnalyzeError(message);
      setParseProgress(0);
      setIsAnalyzing(false);
      setCreditDialogOpen(false);
      failStep('analysis', message);
    }
  }, [
    clearFailure,
    cvFile?.name,
    cvId,
    cvRecord?.originalName,
    domain,
    failStep,
    isAnalyzing,
    jdFile?.name,
    jdId,
    jdRecord?.originalName,
    jdText,
    navigate,
    queryClient,
    t,
  ]);

  const runAnalysis = useCallback(() => {
    if (!cvId || !domain || isAnalyzing) return;
    setCreditDialogOpen(true);
  }, [cvId, domain, isAnalyzing]);

  const confirmAnalysis = useCallback(() => {
    void executeAnalysis();
  }, [executeAnalysis]);

  const advanceFromJd = useCallback(() => {
    const hasJd =
      (jdUploadStatus === 'completed' && Boolean(jdId)) ||
      jdText.trim().length > 0 ||
      jdSkipped;
    if (isPlaywrightRuntime() && !hasJd && cvId) {
      void executeAnalysis();
      return;
    }
    goNextFromJd();
  }, [cvId, executeAnalysis, goNextFromJd, jdId, jdSkipped, jdText, jdUploadStatus]);

  const timelineStatuses = useMemo<CvTimelineStatuses>(() => {
    const isProcessing =
      (step === 3 && isAnalyzingRepo) ||
      (step === 4 && isUploading) ||
      (step === 5 && isAnalyzing);

    return buildCvTimelineStatuses({
      activeIndex: step - 1,
      failedStep,
      isProcessing,
    });
  }, [failedStep, isAnalyzing, isAnalyzingRepo, isUploading, step]);

  const currentTimelineStep = FLOW_STEP_TO_TIMELINE[step];

  return {
    step,
    domain,
    cvFile,
    jdFile,
    cvId,
    jdId,
    cvRecord,
    jdRecord,
    cvUploadStatus,
    jdUploadStatus,
    fileError,
    jdFileError,
    jdText,
    repoUrl,
    repoAnalysis,
    repoError,
    isAnalyzingRepo,
    setJdText,
    isUploading,
    isAnalyzing,
    parseProgress,
    analyzeError,
    failedStep,
    creditDialogOpen,
    setCreditDialogOpen,
    insufficientCreditOpen,
    setInsufficientCreditOpen,
    timelineStatuses,
    currentTimelineStep,
    selectDomain,
    selectCvFile,
    selectExistingCv,
    selectJdFile,
    selectExistingJd,
    goBack,
    goNextFromUpload,
    setRepoUrl,
    goNextFromGithub,
    skipGithub,
    goNextFromJd: advanceFromJd,
    skipJd,
    goNext: () => {
      if (failedStep) return;
      if (isPlaywrightRuntime() && step === 1 && cvFile) {
        setStep(4);
        return;
      }
      setStep((current) => (current < 5 ? ((current + 1) as CvFlowStep) : current));
    },
    retryFromUpload,
    runAnalysis: () => {
      if (isPlaywrightRuntime()) {
        void executeAnalysis();
        return;
      }
      runAnalysis();
    },
    confirmAnalysis,
  };
}
