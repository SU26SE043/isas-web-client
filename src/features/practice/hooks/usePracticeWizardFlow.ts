import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '@/features/payment/services/payment.service';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { TOKEN_WALLET_QUERY_KEY } from '@/features/payment/hooks/useTokenWallet';
import { queryClient } from '@/shared/query/queryClient';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { practiceSetupService } from '../services/practiceSetup.service';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import type { PracticeDomain, PracticeLevel, PracticeRubricCriterion } from '../types/practiceSetup.types';

export function usePracticeWizardFlow() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const resetFlow = useInterviewFlowStore((state) => state.reset);

  const [step, setStep] = useState(0);
  const [domains, setDomains] = useState<PracticeDomain[]>([]);
  const [levels, setLevels] = useState<PracticeLevel[]>([]);
  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [domainId, setDomainId] = useState('');
  const [level, setLevel] = useState<PracticeLevel | ''>('');
  const [cvFileId, setCvFileId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [rubric, setRubric] = useState<PracticeRubricCriterion[]>([]);

  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingCv, setLoadingCv] = useState(false);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<'insufficient' | 'generic' | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([practiceSetupService.listDomains(), practiceSetupService.listLevels()])
      .then(([nextDomains, nextLevels]) => {
        if (!active) return;
        setDomains(nextDomains);
        setLevels(nextLevels);
      })
      .finally(() => {
        if (active) setLoadingDomains(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadCvFiles = useCallback(async () => {
    setLoadingCv(true);
    try {
      const files = await practiceSetupService.listUploadedCvs();
      setCvFiles(files);
      setCvFileId((current) => current || files[0]?.id || '');
    } finally {
      setLoadingCv(false);
    }
  }, []);

  const loadRubric = useCallback(async () => {
    if (!domainId || !level) return;
    setLoadingRubric(true);
    try {
      const generated = await practiceSetupService.generateRubric({
        domainId,
        level,
        cvFileId: cvFileId || undefined,
      });
      setRubric(generated);
    } finally {
      setLoadingRubric(false);
    }
  }, [cvFileId, domainId, level]);

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep === 2) void loadCvFiles();
      if (nextStep === 4) void loadRubric();
      setStep(nextStep);
    },
    [loadCvFiles, loadRubric],
  );

  const handleUploadCv = async (file: File) => {
    setUploadingCv(true);
    setUploadError(null);
    try {
      const uploaded = await practiceSetupService.uploadCv(file, language);
      setCvFiles((prev) => [uploaded, ...prev.filter((item) => item.id !== uploaded.id)]);
      setCvFileId(uploaded.id);
    } catch {
      setUploadError(t('practice.wizard.cv.uploadError'));
    } finally {
      setUploadingCv(false);
    }
  };

  const handleConfirm = async () => {
    if (!domainId || !level || !cvFileId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { sessionId } = await practiceSetupService.createSession({
        domainId,
        level,
        cvFileId,
        questionCount,
        rubric,
      });
      await paymentService.reserveTokens(sessionId, PRACTICE_RESERVE_ESTIMATE);
      void queryClient.invalidateQueries({ queryKey: TOKEN_WALLET_QUERY_KEY });
      resetFlow(sessionId);
      navigate(`/interview/${sessionId}/prepare`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setSubmitError(message.includes('insufficient') || message.includes('reservation') ? 'insufficient' : 'generic');
      setIsSubmitting(false);
    }
  };

  const selectedDomain = useMemo(
    () => domains.find((item) => item.id === domainId),
    [domainId, domains],
  );
  const selectedCv = useMemo(
    () => cvFiles.find((item) => item.id === cvFileId),
    [cvFileId, cvFiles],
  );

  return {
    step,
    domains,
    levels,
    cvFiles,
    domainId,
    level,
    cvFileId,
    questionCount,
    rubric,
    loadingDomains,
    loadingCv,
    loadingRubric,
    uploadingCv,
    isSubmitting,
    uploadError,
    submitError,
    selectedDomain,
    selectedCv,
    setDomainId,
    setLevel,
    setCvFileId,
    setQuestionCount,
    setRubric,
    goToStep,
    handleUploadCv,
    handleConfirm,
  };
}
