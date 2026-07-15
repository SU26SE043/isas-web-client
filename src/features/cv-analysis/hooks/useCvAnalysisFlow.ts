import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { profileService } from '@/features/profile/services/profile.service';
import { cvAnalysisService, CvAnalysisError } from '../services/cvAnalysis.service';
import type { CvAnalysisDomain } from '../types/cvDomain.types';
import { isCvAnalysisDomain } from '../types/cvDomain.types';
import { validateCvFile } from '../utils/cvFileValidation';

export const CV_ANALYSIS_ID_KEY = 'cv-analysis:lastId';
export const CV_ANALYSIS_DOMAIN_KEY = 'cv-analysis:domain';

export type CvFlowStep = 1 | 2 | 3 | 4;
export type CvParseErrorCode = 'passwordProtected' | 'corruptFile' | 'parseFailed';

function readStoredDomain(): CvAnalysisDomain | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CV_ANALYSIS_DOMAIN_KEY);
  return isCvAnalysisDomain(raw) ? raw : null;
}

export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [domain, setDomainState] = useState<CvAnalysisDomain | null>(() => readStoredDomain());
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<CvParseErrorCode | null>(null);

  const mapParseError = useCallback((error: unknown): CvParseErrorCode => {
    if (error instanceof CvAnalysisError) return error.code;
    return 'parseFailed';
  }, []);

  const parseErrorMessage = parseError ? t(`cv.error.${parseError}`) : null;

  const selectDomain = useCallback((next: CvAnalysisDomain) => {
    setDomainState(next);
    sessionStorage.setItem(CV_ANALYSIS_DOMAIN_KEY, next);
  }, []);

  const selectFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setFile(null);
        setFileError(null);
        setParseError(null);
        return;
      }

      const validation = validateCvFile(next);
      if (validation === 'invalidType') {
        setFileError(t('cv.invalidType'));
        setFile(null);
        return;
      }
      if (validation === 'invalidSize') {
        setFileError(t('cv.invalidSize'));
        setFile(null);
        return;
      }

      setFileError(null);
      setParseError(null);
      setFile(next);
    },
    [t],
  );

  const goNext = useCallback(() => {
    setStep((current) => (current < 4 ? ((current + 1) as CvFlowStep) : current));
  }, []);

  const goBack = useCallback(() => {
    setParseError(null);
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, []);

  const retryFromUpload = useCallback(() => {
    setParseError(null);
    setParseProgress(0);
    setStep(2);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file || !domain) return;

    setStep(4);
    setParseProgress(10);
    setParseError(null);

    const progressTimer = window.setInterval(() => {
      setParseProgress((value) => Math.min(value + 12, 90));
    }, 400);

    try {
      const { analysisId } = await cvAnalysisService.submitAnalysis({
        file,
        jobDescription: jobDescription.trim() || undefined,
        domain,
        language,
      });
      sessionStorage.setItem(CV_ANALYSIS_ID_KEY, analysisId);
      sessionStorage.setItem(CV_ANALYSIS_DOMAIN_KEY, domain);
      await profileService.markCvUploaded();
      setParseProgress(100);
      navigate('/candidate/cv/analysis/report');
    } catch (error) {
      setParseError(mapParseError(error));
      setParseProgress(0);
    } finally {
      window.clearInterval(progressTimer);
    }
  }, [domain, file, jobDescription, language, mapParseError, navigate]);

  return {
    step,
    domain,
    file,
    jobDescription,
    fileError,
    parseProgress,
    parseError,
    parseErrorMessage,
    setJobDescription,
    selectDomain,
    selectFile,
    goNext,
    goBack,
    retryFromUpload,
    runAnalysis,
  };
}
