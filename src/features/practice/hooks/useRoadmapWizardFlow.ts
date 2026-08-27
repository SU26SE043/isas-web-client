import { ROADMAP_SCOPE_LESSONS, type RoadmapScope } from '../types/learning.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { invalidateLearningRoadmaps, learningLessonQueryKey } from './useLearningRoadmaps';
import { fetchInterviewHistory } from '../services/history.service';
import { learningService } from '../services/learning.service';
import { roadmapService } from '../services/roadmap.service';
import type { InterviewHistoryItem } from '../types/history.types';
import type { PracticeDomain } from '../types/practiceSetup.types';
import { ROADMAP_DOMAINS } from '../mocks/practiceSetup.fixtures';

export type RoadmapWizardStep =
  | 'domain'
  | 'nameFocus'
  | 'reports'
  | 'confirm';

/** Thứ tự wizard được khai báo tập trung để stepper và điều hướng luôn đồng bộ. */
export const ROADMAP_WIZARD_STEP_ORDER: readonly RoadmapWizardStep[] = [
  'domain',
  'nameFocus',
  'reports',
  'confirm',
];

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
  const [rawReports, setRawReports] = useState<InterviewHistoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  // Mặc định Quick: 4 bài = 4 credit. Standard là 12 bài, mà suất dùng thử chỉ 3 —
  // để mặc định ở bản lớn thì người mới gần như chắc chắn chạm 402 giữa chừng.
  const [scope, setScope] = useState<RoadmapScope>('Quick');
  const [focus, setFocus] = useState('');
  const [loadingDomains] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState(false);
  const [loadedDomainId, setLoadedDomainId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<CreateRoadmapErrorCode | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const loadReportsForDomain = useCallback(async (nextDomainId: string) => {
    setLoadingReports(true);
    setReportsError(false);
    try {
      const results = await Promise.allSettled([fetchInterviewHistory({
        page: 1,
        pageSize: 100,
        includeDeleted: false,
        status: 'Scored',
        excludeCampaign: true,
      })]);
      const history = results[0].status === 'fulfilled' ? results[0].value : { interviews: [] as InterviewHistoryItem[] };
      if (results[0].status === 'rejected') setReportsError(true);
      const sorted = history.interviews
        .filter((item) => item.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRawReports(sorted);
      setSelectedIds([]);
      setLoadedDomainId(nextDomainId);
    } catch {
      setReportsError(true);
      setRawReports([]);
      setLoadedDomainId(nextDomainId);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Lọc theo lĩnh vực ở tầng DẪN XUẤT ⇒ đổi lĩnh vực là danh sách đúng ngay, không cần nạp lại.
  const allReports = useMemo(
    () => (domainId ? rawReports.filter((item) => item.domainId === domainId) : []),
    [rawReports, domainId],
  );
  const reportCounts = useMemo(() => rawReports.reduce<Record<string, number>>((counts, report) => {
    counts[report.domainId] = (counts[report.domainId] ?? 0) + 1;
    return counts;
  }, {}), [rawReports]);

  // F6 (giữ qua merge REC1): nạp lịch sử NGAY khi wizard mở để lưới ngành hiện đúng số buổi
  // TRƯỚC khi người dùng chọn ngành. Lời gọi này không lọc theo ngành ở server — `allReports`
  // và `reportCounts` lọc ở tầng dẫn xuất — nên nạp sớm là đủ và không tốn thêm vòng nào.
  useEffect(() => {
    void loadReportsForDomain('').catch(() => {});
  }, [loadReportsForDomain]);

  useEffect(() => {
    if (domainId && domainId !== loadedDomainId && !loadingReports) {
      void loadReportsForDomain(domainId).catch(() => {});
    }
  }, [domainId, loadedDomainId, loadReportsForDomain, loadingReports]);

  useEffect(() => {
    if (rawReports.length === 0) return;
    setSelectedIds((prev) => prev.filter((id) => allReports.some((item) => item.id === id)));
  }, [rawReports.length, allReports]);

  const steps = useMemo<RoadmapWizardStep[]>(() => [...ROADMAP_WIZARD_STEP_ORDER], []);

  const goToStep = useCallback(
    (nextStep: RoadmapWizardStep) => {
      if (nextStep === 'reports' && domainId && !loadingReports && allReports.length === 0) {
        // `.catch` ở đây là lưới cuối: `loadReportsForDomain` đã bọc từng lời gọi, nhưng chỗ gọi
        // dạng fire-and-forget mà để lọt một reject nào thì nó thành unhandled rejection — lỗi
        // duy nhất người dùng thấy là mọi ô im lặng rỗng.
        void loadReportsForDomain(domainId).catch(() => {});
      }
      setStep(nextStep);
    },
    [allReports.length, domainId, loadReportsForDomain, loadingReports],
  );

  const goNext = useCallback(() => {
    const i = steps.indexOf(step);
    if (i >= 0 && i < steps.length - 1) goToStep(steps[i + 1]);
  }, [goToStep, step, steps]);
  const goBack = useCallback(() => {
    const i = steps.indexOf(step);
    if (i > 0) goToStep(steps[i - 1]);
  }, [goToStep, step, steps]);

  const handleSelectDomain = (id: string) => {
    setDomainId(id);
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
    if (!domainId || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitErrorMessage(null);
    try {
      const uniqueSessionIds = Array.from(
        new Set(selectedIds.map((id) => id.trim()).filter(Boolean)),
      );
      const created = await learningService.createRoadmap({
        domainId,
        name,
        reportIds: uniqueSessionIds,
        sessionIds: uniqueSessionIds,
        focus,
        scope,
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
      const lessonCount = created.milestones?.flatMap((milestone) => milestone.lessons).length ?? 0;
      navigate('/candidate/learning', {
        replace: true,
        state: { fewerLessons: lessonCount < ROADMAP_SCOPE_LESSONS[scope] },
      });
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
    name,
    focus,
    loadingDomains,
    loadingReports,
    reportsError,
    reportCounts,
    isSubmitting,
    submitError,
    submitErrorMessage,
    selectedDomain,
    selectedReports,
    handleSelectDomain,
    setName,
    setFocus,
    scope,
    setScope,
    toggleReport,
    selectAllReports,
    unselectAllReports,
    goToStep,
    goNext,
    goBack,
    steps,
    handleCreate,
  };
}
