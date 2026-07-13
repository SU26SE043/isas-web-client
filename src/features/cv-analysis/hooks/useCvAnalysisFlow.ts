import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { profileService } from '@/features/profile/services/profile.service';
import { cvAnalysisService, CvAnalysisError } from '../services/cvAnalysis.service';
import { validateCvFile } from '../utils/cvFileValidation';

export const CV_ANALYSIS_ID_KEY = 'cv-analysis:lastId';

export type CvFlowStep = 1 | 2 | 3;
export type CvParseErrorCode = 'passwordProtected' | 'corruptFile' | 'parseFailed';

export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<CvParseErrorCode | null>(null);

  const mapParseError = useCallback(
    (error: unknown): CvParseErrorCode => {
      if (error instanceof CvAnalysisError) return error.code;
      return 'parseFailed';
    },
    [],
  );

  const parseErrorMessage = parseError
    ? t(`cv.error.${parseError}`)
    : null;

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
    setStep((current) => (current < 3 ? ((current + 1) as CvFlowStep) : current));
  }, []);

  const goBack = useCallback(() => {
    setParseError(null);
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, []);

  const retryFromUpload = useCallback(() => {
    setParseError(null);
    setParseProgress(0);
    setStep(1);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file) return;

    setStep(3);
    setParseProgress(10);
    setParseError(null);

    const progressTimer = window.setInterval(() => {
      setParseProgress((value) => Math.min(value + 12, 90));
    }, 400);

    try {
      const { analysisId } = await cvAnalysisService.submitAnalysis({
        file,
        jobDescription: jobDescription.trim() || undefined,
        language,
      });
      sessionStorage.setItem(CV_ANALYSIS_ID_KEY, analysisId);
      await profileService.markCvUploaded();
      setParseProgress(100);
      navigate('/candidate/cv/analysis/report');
    } catch (error) {
      setParseError(mapParseError(error));
      setParseProgress(0);
    } finally {
      window.clearInterval(progressTimer);
    }
  }, [file, jobDescription, language, mapParseError, navigate]);

  return {
    step,
    file,
    jobDescription,
    fileError,
    parseProgress,
    parseError,
    parseErrorMessage,
    setJobDescription,
    selectFile,
    goNext,
    goBack,
    retryFromUpload,
    runAnalysis,
  };
}
