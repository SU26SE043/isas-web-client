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
  const [savingRubric, setSavingRubric] = useState(false);
  const [resettingRubric, setResettingRubric] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rubricError, setRubricError] = useState<string | null>(null);
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
    if (!domainId) return;
    setLoadingRubric(true);
    setRubricError(null);
    try {
      const criteria = await practiceSetupService.getRubric(domainId);
      setRubric(criteria);
    } catch {
      setRubric([]);
      setRubricError(t('practice.wizard.rubric.loadError'));
    } finally {
      setLoadingRubric(false);
    }
  }, [domainId, t]);

  const saveRubric = useCallback(async () => {
    if (!domainId) return false;
    setSavingRubric(true);
    setRubricError(null);
    try {
      const saved = await practiceSetupService.updateRubric(domainId, rubric);
      setRubric(saved);
      return true;
    } catch {
      setRubricError(t('practice.wizard.rubric.saveError'));
      return false;
    } finally {
      setSavingRubric(false);
    }
  }, [domainId, rubric, t]);

  const resetRubric = useCallback(async () => {
    if (!domainId) return;
    setResettingRubric(true);
    setRubricError(null);
    try {
      const criteria = await practiceSetupService.resetRubric(domainId);
      setRubric(criteria);
    } catch {
      setRubricError(t('practice.wizard.rubric.resetError'));
    } finally {
      setResettingRubric(false);
    }
  }, [domainId, t]);

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep === 2) void loadCvFiles();
      if (nextStep === 4) void loadRubric();
      setStep(nextStep);
    },
    [loadCvFiles, loadRubric],
  );

  const handleRubricNext = useCallback(async () => {
    const ok = await saveRubric();
    if (ok) setStep(5);
  }, [saveRubric]);

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

  const domainLabel = useMemo(() => {
    if (!selectedDomain) return domainId;
    return language === 'vi' ? selectedDomain.nameVi : selectedDomain.name;
  }, [domainId, language, selectedDomain]);

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
    savingRubric,
    resettingRubric,
    uploadingCv,
    isSubmitting,
    uploadError,
    rubricError,
    submitError,
    selectedDomain,
    selectedCv,
    domainLabel,
    setDomainId,
    setLevel,
    setCvFileId,
    setQuestionCount,
    setRubric,
    goToStep,
    handleRubricNext,
    resetRubric,
    loadRubric,
    handleUploadCv,
    handleConfirm,
  };
}
