import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import { invalidateLearningRoadmaps } from './useLearningRoadmaps';
import { fetchInterviewHistory } from '../services/history.service';
import { learningService } from '../services/learning.service';
import type { InterviewHistoryItem } from '../types/history.types';
import type { PracticeDomain } from '../types/practiceSetup.types';
import {
  ROADMAP_DOMAINS,
  ROADMAP_REPORT_PREVIEW_LIMIT,
  type RoadmapTargetLevel,
} from '../mocks/practiceSetup.fixtures';

export function useRoadmapWizardFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [domains] = useState<PracticeDomain[]>(() => structuredClone(ROADMAP_DOMAINS));
  const [domainId, setDomainId] = useState('');
  const [allReports, setAllReports] = useState<InterviewHistoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetLevel, setTargetLevel] = useState<RoadmapTargetLevel | ''>('');
  const [cvId, setCvId] = useState<string | undefined>();
  const [loadingDomains] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const loadReportsForDomain = useCallback(async (nextDomainId: string) => {
    setLoadingReports(true);
    try {
      const [history, cvs] = await Promise.all([
        fetchInterviewHistory({
          page: 1,
          pageSize: 100,
          includeDeleted: false,
        }),
        cvAnalysisService.listUploadedCvs().catch(() => []),
      ]);
      const filtered = history.interviews
        .filter((item) => item.status === 'completed' && item.domainId === nextDomainId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, ROADMAP_REPORT_PREVIEW_LIMIT);
      setAllReports(filtered);
      setSelectedIds([]);
      setCvId(cvs[0]?.id);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep === 1 && domainId) {
        void loadReportsForDomain(domainId);
      }
      setStep(nextStep);
    },
    [domainId, loadReportsForDomain],
  );

  const handleSelectDomain = (id: string) => {
    setDomainId(id);
    setTargetLevel('');
    setSelectedIds([]);
  };

  const toggleReport = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const selectAllReports = () => {
    setSelectedIds(allReports.map((item) => item.id));
  };

  const unselectAllReports = () => {
    setSelectedIds([]);
  };

  const handleCreate = async () => {
    if (!domainId || !targetLevel || selectedIds.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await learningService.createRoadmap({
        domainId,
        targetLevel,
        // Selected in UI only — not sent until API accepts reportIds.
        reportIds: selectedIds,
        cvId,
      });
      await invalidateLearningRoadmaps(queryClient);
      navigate('/candidate/learning', { replace: true });
    } catch {
      setSubmitError(true);
      setIsSubmitting(false);
    }
  };

  const selectedDomain = useMemo(
    () => domains.find((item) => item.id === domainId),
    [domainId, domains],
  );

  const selectedReports = useMemo(
    () => allReports.filter((item) => selectedIds.includes(item.id)),
    [allReports, selectedIds],
  );

  return {
    step,
    domains,
    domainId,
    allReports,
    selectedIds,
    targetLevel,
    loadingDomains,
    loadingReports,
    isSubmitting,
    submitError,
    selectedDomain,
    selectedReports,
    handleSelectDomain,
    setTargetLevel,
    toggleReport,
    selectAllReports,
    unselectAllReports,
    goToStep,
    handleCreate,
  };
}
