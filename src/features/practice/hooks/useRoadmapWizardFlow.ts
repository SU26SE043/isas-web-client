import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';
import { invalidateLearningRoadmaps, learningLessonQueryKey } from './useLearningRoadmaps';
import { fetchInterviewHistory } from '../services/history.service';
import { learningService } from '../services/learning.service';
import { learningPathService } from '../services/learningPath.service';
import { roadmapService } from '../services/roadmap.service';
import type { LearningRoadmapCard } from '../types/learningPath.types';
import type { InterviewHistoryItem } from '../types/history.types';
import type { PracticeDomain } from '../types/practiceSetup.types';
import {
  ROADMAP_DOMAINS,
  type RoadmapTargetLevel,
} from '../mocks/practiceSetup.fixtures';
import type { RoadmapMode } from '../types/learning.types';

export type RoadmapWizardStep =
  | 'domain'
  | 'cv'
  | 'currentLevel'
  | 'mode'
  | 'targetLevel'
  | 'reports'
  | 'priorRoadmap'
  | 'confirm';

/** Temporary compatibility: older list responses have no hasFinalReport yet. */
export function filterCompletedRoadmapsForWizard(roadmaps: LearningRoadmapCard[]) {
  return roadmaps.filter((roadmap) => roadmap.status === 'completed' && roadmap.hasFinalReport !== false);
}
import {
  CreateRoadmapError,
  type CreateRoadmapErrorCode,
} from '../utils/roadmapCreateErrors';

export function useRoadmapWizardFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [step, setStep] = useState<RoadmapWizardStep>('domain');
  const [domains] = useState<PracticeDomain[]>(() => structuredClone(ROADMAP_DOMAINS));
  const [domainId, setDomainId] = useState('');
  const [allReports, setAllReports] = useState<InterviewHistoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetLevel, setTargetLevel] = useState<RoadmapTargetLevel | ''>('');
  const [currentLevel, setCurrentLevel] = useState<RoadmapTargetLevel>('fresher');
  const [currentLevelSource, setCurrentLevelSource] = useState<'cv' | 'default' | 'manual'>('default');
  const [mode, setMode] = useState<RoadmapMode>('LevelUp');
  const [name, setName] = useState('');
  const [cvId, setCvId] = useState<string | undefined>();
  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [cvAnalyses, setCvAnalyses] = useState<CvAnalysisResult[]>([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState<LearningRoadmapCard[]>([]);
  const [cvAnalysisId, setCvAnalysisId] = useState<string | undefined>();
  const [priorRoadmapId, setPriorRoadmapId] = useState<string | undefined>();
  const [focus, setFocus] = useState('');
  const [loadingDomains] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<CreateRoadmapErrorCode | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const loadReportsForDomain = useCallback(async (nextDomainId: string) => {
    setLoadingReports(true);
    try {
      const [history, cvs, analyses, roadmaps] = await Promise.all([
        fetchInterviewHistory({
          page: 1,
          pageSize: 100,
          includeDeleted: false,
        }),
        cvAnalysisService.listUploadedCvs().catch(() => []),
        cvAnalysisService.listAnalyses().catch(() => []),
        learningPathService.listRoadmaps({ status: 'completed' }).catch(() => []),
      ]);
      const filtered = history.interviews
        .filter((item) => item.status === 'completed' && item.domainId === nextDomainId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllReports(filtered);
      setSelectedIds([]);
      setCvFiles(cvs);
      setCvAnalyses(analyses);
      // TODO: remove the status fallback once backend always exposes hasFinalReport.
      setCompletedRoadmaps(filterCompletedRoadmapsForWizard(roadmaps));
      setCvId(cvs[0]?.id);
      setCvAnalysisId(undefined);
      const inferredLevel = analyses.find((analysis) => analysis.currentLevel)?.currentLevel?.toLowerCase();
      if (inferredLevel && ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'].includes(inferredLevel)) {
        setCurrentLevel(inferredLevel as RoadmapTargetLevel);
        setCurrentLevelSource('cv');
      } else {
        setCurrentLevel('fresher');
        setCurrentLevelSource('default');
      }
      setPriorRoadmapId(undefined);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const steps = useMemo<RoadmapWizardStep[]>(() => {
    const next: RoadmapWizardStep[] = ['domain', 'cv', 'currentLevel', 'mode', 'targetLevel'];
    if (loadingReports || allReports.length > 0) next.push('reports');
    if (loadingReports || completedRoadmaps.length > 0) next.push('priorRoadmap');
    next.push('confirm');
    return next;
  }, [allReports.length, completedRoadmaps.length, loadingReports]);

  const goToStep = useCallback(
    (nextStep: RoadmapWizardStep) => {
      if (nextStep === 'cv' && domainId && !loadingReports && allReports.length === 0 && cvFiles.length === 0 && cvAnalyses.length === 0) {
        void loadReportsForDomain(domainId);
      }
      setStep(nextStep);
    },
    [allReports.length, cvAnalyses.length, cvFiles.length, domainId, loadReportsForDomain, loadingReports],
  );

  const handleSelectDomain = (id: string) => {
    setDomainId(id);
    setTargetLevel('');
    setCurrentLevel('fresher');
    setCurrentLevelSource('default');
    setMode('LevelUp');
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
    if (!domainId || !targetLevel || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitErrorMessage(null);
    try {
      const uniqueSessionIds = Array.from(
        new Set(selectedIds.map((id) => id.trim()).filter(Boolean)),
      );
      const created = await learningService.createRoadmap({
        domainId,
        targetLevel,
        currentLevel,
        name,
        reportIds: uniqueSessionIds,
        sessionIds: uniqueSessionIds,
        cvId,
        cvAnalysisId,
        priorRoadmapId,
        focus,
        mode,
      });
      const firstLessonId = created.milestones?.flatMap((milestone) => milestone.lessons)[0]?.id;
      if (created.id && firstLessonId) {
        // Deliberately fire-and-forget: closing the tab forfeits warming the cache, and a fast click can briefly duplicate the AI request. The backend idempotency guard keeps the result correct; the narrow extra-cost window is accepted for a faster first lesson.
        void queryClient.prefetchQuery({
          queryKey: learningLessonQueryKey(created.id, firstLessonId),
          queryFn: () => roadmapService.getLesson(created.id as string, firstLessonId),
          staleTime: 60_000,
        }).catch(() => {});
      }
      await invalidateLearningRoadmaps(queryClient);
      toast.success(t('practice.roadmapWizard.createSuccess'));
      navigate('/candidate/learning', { replace: true });
    } catch (error) {
      const mapped =
        error instanceof CreateRoadmapError ? error : new CreateRoadmapError('generic');
      setSubmitError(mapped.code);
      setSubmitErrorMessage(mapped.message);
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
    currentLevel,
    currentLevelSource,
    mode,
    name,
    cvId,
    cvFiles,
    cvAnalyses,
    completedRoadmaps,
    cvAnalysisId,
    priorRoadmapId,
    focus,
    loadingDomains,
    loadingReports,
    isSubmitting,
    submitError,
    submitErrorMessage,
    selectedDomain,
    selectedReports,
    handleSelectDomain,
    setTargetLevel,
    setCurrentLevel: (value: RoadmapTargetLevel) => { setCurrentLevel(value); setCurrentLevelSource('manual'); },
    setCurrentLevelSource,
    setMode,
    setName,
    setCvId,
    setFocus,
    setCvAnalysisId,
    setPriorRoadmapId,
    toggleReport,
    selectAllReports,
    unselectAllReports,
    goToStep,
    steps,
    handleCreate,
  };
}
