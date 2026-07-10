import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import { validateCvFile } from '../utils/cvFileValidation';

export type CvFlowStep = 1 | 2 | 3;

export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);

  const selectFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setFile(null);
        setFileError(null);
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
      setFile(next);
    },
    [t],
  );

  const goNext = useCallback(() => {
    setStep((current) => (current < 3 ? ((current + 1) as CvFlowStep) : current));
  }, []);

  const goBack = useCallback(() => {
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file) return;

    setStep(3);
    setParseProgress(10);

    const progressTimer = window.setInterval(() => {
      setParseProgress((value) => Math.min(value + 12, 90));
    }, 400);

    try {
      await cvAnalysisService.submitAnalysis({
        file,
        jobDescription: jobDescription.trim() || undefined,
        language,
      });
      setParseProgress(100);
      navigate('/candidate/cv/analysis/report');
    } finally {
      window.clearInterval(progressTimer);
    }
  }, [file, jobDescription, language, navigate]);

  return {
    step,
    file,
    jobDescription,
    fileError,
    parseProgress,
    setJobDescription,
    selectFile,
    goNext,
    goBack,
    runAnalysis,
  };
}
