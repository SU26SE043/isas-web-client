import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '@/features/profile/services/profile.service';
import type { CvAnalysisStep } from '../components/CvAnalysisStepper';
import { cvAnalysisService, CvAnalysisError } from '../services/cvAnalysis.service';
import type { CvAnalysisDomain } from '../types/cvDomain.types';
import { isCvAnalysisDomain } from '../types/cvDomain.types';
import { domainToJobCategoryLabel } from '../types/cvAnalysis.types';
import { validatePdfFile } from '../utils/cvFileValidation';
import {
  buildCvTimelineStatuses,
  type CvTimelineStatuses,
} from '../utils/cvTimelineStatus';

export const CV_ANALYSIS_ID_KEY = 'cv-analysis:lastId';
export const CV_ANALYSIS_DOMAIN_KEY = 'cv-analysis:domain';
export const CV_ANALYSIS_META_KEY = 'cv-analysis:lastMeta';

export type CvFlowStep = 1 | 2 | 3 | 4;

const FLOW_STEP_TO_TIMELINE: Record<CvFlowStep, CvAnalysisStep> = {
  1: 'domain',
  2: 'upload',
  3: 'job-description',
  4: 'analysis',
};

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

export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [domain, setDomainState] = useState<CvAnalysisDomain | null>(() => readStoredDomain());
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jdFileError, setJdFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<CvAnalysisStep | null>(null);

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

  const selectCvFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setCvFile(null);
        setCvId(null);
        setFileError(null);
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        const message = t('cv.invalidType');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        failStep('upload', message);
        return;
      }
      if (validation === 'invalidSize') {
        const message = t('cv.invalidSize');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        failStep('upload', message);
        return;
      }

      setFileError(null);
      setCvFile(next);
      setCvId(null);
      if (failedStep === 'upload') clearFailure();
    },
    [clearFailure, failStep, failedStep, t],
  );

  const selectJdFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setJdFile(null);
        setJdId(null);
        setJdFileError(null);
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        const message = t('cv.jdInvalidType');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        failStep('job-description', message);
        return;
      }
      if (validation === 'invalidSize') {
        const message = t('cv.jdInvalidSize');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        failStep('job-description', message);
        return;
      }

      setJdFileError(null);
      setJdFile(next);
      setJdId(null);
      if (failedStep === 'job-description') clearFailure();
    },
    [clearFailure, failStep, failedStep, t],
  );

  const goBack = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, [clearFailure]);

  const goNextFromUpload = useCallback(async () => {
    if (!cvFile || isUploading) return;
    setIsUploading(true);
    setFileError(null);
    clearFailure();
    try {
      const record = await cvAnalysisService.uploadCv(cvFile);
      setCvId(record.id);
      toast.success(t('cv.uploadCvSuccess'));
      setStep(3);
    } catch (error) {
      const message =
        error instanceof CvAnalysisError ? error.message : t('cv.error.uploadFailed');
      setFileError(message);
      failStep('upload', message);
    } finally {
      setIsUploading(false);
    }
  }, [clearFailure, cvFile, failStep, isUploading, t]);

  const goNextFromJd = useCallback(async () => {
    if (!jdFile || isUploading) return;
    setIsUploading(true);
    setJdFileError(null);
    clearFailure();
    try {
      const record = await cvAnalysisService.uploadJd(jdFile);
      setJdId(record.id);
      toast.success(t('cv.uploadJdSuccess'));
      setStep(4);
    } catch (error) {
      const message =
        error instanceof CvAnalysisError ? error.message : t('cv.error.uploadFailed');
      setJdFileError(message);
      failStep('job-description', message);
    } finally {
      setIsUploading(false);
    }
  }, [clearFailure, failStep, isUploading, jdFile, t]);

  const retryFromUpload = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep(2);
  }, [clearFailure]);

  const runAnalysis = useCallback(async () => {
    if (!cvId || !jdId || !domain || isAnalyzing) return;

    setIsAnalyzing(true);
    setParseProgress(35);
    setAnalyzeError(null);
    clearFailure();

    try {
      const result = await cvAnalysisService.analyze({
        cvId,
        jdId,
        jobCategory: domainToJobCategoryLabel(domain),
      });

      writeStorage(CV_ANALYSIS_ID_KEY, result.id);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, domain);
      writeStorage(
        CV_ANALYSIS_META_KEY,
        JSON.stringify({
          cvFileName: cvFile?.name,
          jdFileName: jdFile?.name ?? null,
        }),
      );

      try {
        await profileService.markCvUploaded();
      } catch {
        /* profile flag is best-effort */
      }

      setParseProgress(100);
      navigate(`/candidate/cv/analysis/report?analysisId=${encodeURIComponent(result.id)}`);
    } catch (error) {
      const message = resolveAnalyzeMessage(error, t);
      setAnalyzeError(message);
      setParseProgress(0);
      setIsAnalyzing(false);
      failStep('analysis', message);
    }
  }, [
    clearFailure,
    cvFile?.name,
    cvId,
    domain,
    failStep,
    isAnalyzing,
    jdFile?.name,
    jdId,
    navigate,
    t,
  ]);

  const timelineStatuses = useMemo<CvTimelineStatuses>(() => {
    const isProcessing =
      (step === 2 && isUploading) || (step === 3 && isUploading) || (step === 4 && isAnalyzing);

    return buildCvTimelineStatuses({
      activeIndex: step - 1,
      failedStep,
      isProcessing,
    });
  }, [failedStep, isAnalyzing, isUploading, step]);

  const currentTimelineStep = FLOW_STEP_TO_TIMELINE[step];

  return {
    step,
    domain,
    cvFile,
    jdFile,
    cvId,
    jdId,
    fileError,
    jdFileError,
    isUploading,
    isAnalyzing,
    parseProgress,
    analyzeError,
    failedStep,
    timelineStatuses,
    currentTimelineStep,
    selectDomain,
    selectCvFile,
    selectJdFile,
    goBack,
    goNextFromUpload,
    goNextFromJd,
    goNext: () => {
      if (failedStep) return;
      setStep((current) => (current < 4 ? ((current + 1) as CvFlowStep) : current));
    },
    retryFromUpload,
    runAnalysis,
  };
}
