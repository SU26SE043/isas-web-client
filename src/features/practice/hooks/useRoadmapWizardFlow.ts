import type { RoadmapScope } from '../types/learning.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';
import { domainToJobCategoryEnum, type JobDomainId } from '@/shared/domain/jobDomains';
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
  ROADMAP_TARGET_LEVELS,
  type RoadmapTargetLevel,
} from '../mocks/practiceSetup.fixtures';

export type RoadmapWizardStep =
  | 'domain'
  | 'nameFocus'
  | 'cv'
  | 'currentLevel'
  | 'targetLevel'
  | 'reports'
  | 'priorRoadmap'
  | 'confirm';

/**
 * Thứ tự bước khai ở ĐÚNG MỘT chỗ. `steps` lọc từ đây, và chỗ cứu bước mồ côi cũng đọc từ đây —
 * hai nơi khai thứ tự riêng thì chúng trôi khỏi nhau mà không có lỗi nào nổ.
 */
export const ROADMAP_WIZARD_STEP_ORDER: readonly RoadmapWizardStep[] = [
  'domain',
  'nameFocus',
  'cv',
  'currentLevel',
  // "Cấp độ mục tiêu" đứng NGAY SAU "Trình độ hiện tại", trước "Báo cáo": hai bước này là một cặp
  // — lộ trình sinh ra từ KHOẢNG CÁCH giữa chúng, nên hỏi rời nhau (chèn bước chọn báo cáo vào
  // giữa) làm người dùng mất mạch. Đây cũng là thứ tự đã chốt với sản phẩm.
  'targetLevel',
  'reports',
  'priorRoadmap',
  'confirm',
];

/**
 * `steps` là mảng ĐỘNG (hai bước tuỳ chọn tự ẩn khi không có dữ liệu). Khi bước đang đứng rơi
 * khỏi `steps`, page vẫn render nhánh đó còn stepper `indexOf` trả `-1` ⇒ `Math.max(-1, 0)` sáng
 * đèn bước 1: người dùng đứng trên một bước KHÔNG còn tồn tại, thanh tiến trình chỉ sai chỗ.
 *
 * Chọn bước hợp lệ GẦN NHẤT VỀ TRƯỚC (không nhảy tới), để không vô tình đưa người dùng vượt qua
 * một bước họ chưa xem. Không còn bước nào phía trước ⇒ về bước đầu.
 */
export function resolveOrphanStepFallback(
  step: RoadmapWizardStep,
  steps: readonly RoadmapWizardStep[],
): RoadmapWizardStep | null {
  if (steps.length === 0 || steps.includes(step)) return null;
  const current = ROADMAP_WIZARD_STEP_ORDER.indexOf(step);
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    if (ROADMAP_WIZARD_STEP_ORDER.indexOf(steps[i]) < current) return steps[i];
  }
  return steps[0];
}

/**
 * Bản phân tích CV thuộc ĐÚNG lĩnh vực đang chọn.
 *
 * 🔴 Ca thật (22/08): tạo lộ trình Backend nhưng ô "Bản phân tích CV" hiện `BA · 22/8/2026`.
 * `listAnalyses()` trả TẤT CẢ bản phân tích của người dùng, không ai lọc. Chọn phải nó thì
 * tóm tắt CV Business Analyst đi thẳng vào prompt sinh lộ trình Backend — không lỗi, không
 * cảnh báo, chỉ ra nội dung sai ngành.
 */
export function analysesForDomain(analyses: CvAnalysisResult[], domainId: string) {
  if (!domainId) return [];
  const wanted = domainToJobCategoryEnum(domainId as JobDomainId);
  return analyses.filter((a) => (a.jobCategory ?? '').trim().toUpperCase() === wanted);
}

/**
 * Trình độ hiện tại suy từ bản phân tích CV — nguồn để điền mặc định bước "Trình độ hiện tại".
 *
 * CHỈ lấy từ bản phân tích CÙNG lĩnh vực: điền trình độ suy từ CV Business Analyst vào lộ trình
 * Backend là sai nền, mà giá trị đó đi thẳng vào prompt làm SÀN (bỏ phần nhập môn người học đã
 * nắm) nên hỏng âm thầm — không lỗi nào nổ.
 *
 * 🔑 Tập hợp lệ lấy TỪ `ROADMAP_TARGET_LEVELS`, không khai lại bằng tay. Danh sách viết tay trước
 * đây còn `'intern'`/`'lead'` — hai giá trị mà cả backend (`RoadmapLevel`) lẫn ô chọn của bước
 * này đều KHÔNG có. Rơi vào đó thì `<select value="lead">` không khớp option nào nên trình duyệt
 * sáng đèn option ĐẦU TIÊN ("Mới tốt nghiệp"), trong khi `resolveApiRoadmapLevel` lại nén `lead`
 * thành `Senior` lúc gửi: người dùng thấy Fresher, hệ thống gửi Senior, không cảnh báo nào.
 * Buộc hai danh sách là MỘT thì cái lệch đó không dựng lại được.
 *
 * `null` = không suy ra được (CV không đủ căn cứ, hoặc chưa phân tích CV nào cho lĩnh vực này) ⇒
 * nơi gọi rơi về `fresher` và nói rõ đó là mặc định, không phải suy từ CV.
 */
export function inferCurrentLevelFromAnalyses(
  analyses: CvAnalysisResult[],
  domainId: string,
): RoadmapTargetLevel | null {
  for (const analysis of analysesForDomain(analyses, domainId)) {
    const level = analysis.currentLevel?.trim().toLowerCase();
    if (level && (ROADMAP_TARGET_LEVELS as readonly string[]).includes(level)) {
      return level as RoadmapTargetLevel;
    }
  }
  return null;
}

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
  const [rawReports, setRawReports] = useState<InterviewHistoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetLevel, setTargetLevel] = useState<RoadmapTargetLevel | ''>('');
  const [currentLevel, setCurrentLevel] = useState<RoadmapTargetLevel>('fresher');
  const [currentLevelSource, setCurrentLevelSource] = useState<'cv' | 'default' | 'manual'>('default');
  const [name, setName] = useState('');
  // Mặc định Quick: 4 bài = 4 credit. Standard là 12 bài, mà suất dùng thử chỉ 3 —
  // để mặc định ở bản lớn thì người mới gần như chắc chắn chạm 402 giữa chừng.
  const [scope, setScope] = useState<RoadmapScope>('Quick');
  const [cvId, setCvId] = useState<string | undefined>();
  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [rawCvAnalyses, setRawCvAnalyses] = useState<CvAnalysisResult[]>([]);
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
      // ⚠ CẢ BỐN lời gọi phải có `.catch` riêng. Trước đây `fetchInterviewHistory` là cái DUY NHẤT
      // không có: nó hỏng thì `Promise.all` reject ⇒ thân `try` dừng giữa chừng ⇒ **vứt luôn cả ba
      // kết quả kia** (file CV, bản phân tích, roadmap đã hoàn tất) dù chúng đã về thành công, và
      // vì chỗ gọi là `void loadReportsForDomain(...)` nên lỗi thoát ra thành unhandled rejection —
      // người dùng chỉ thấy mọi ô hiện "Bỏ qua", không lỗi, không cảnh báo. Đã tái hiện được.
      const [history, cvs, analyses, roadmaps] = await Promise.all([
        fetchInterviewHistory({
          page: 1,
          pageSize: 100,
          includeDeleted: false,
          status: 'Scored',
          excludeCampaign: true,
        }).catch(() => ({ interviews: [] as InterviewHistoryItem[] })),
        cvAnalysisService.listUploadedCvs().catch(() => []),
        cvAnalysisService.listAnalyses().catch(() => []),
        // `enrichCurrentPointers: false` — wizard chỉ cần id/tên/trạng thái; bật thì mỗi thẻ thiếu
        // con trỏ tốn thêm một `GET /roadmaps/{id}`, kéo dài đúng cửa sổ mà bước "Roadmap đã hoàn
        // tất" hiện ra với dropdown rỗng.
        learningPathService
          .listRoadmaps({ status: 'completed' }, { enrichCurrentPointers: false })
          .catch(() => []),
      ]);
      // Lưu THÔ, lọc theo lĩnh vực ở tầng dẫn xuất (`allReports`/`cvAnalyses` bên dưới).
      // Lọc tại đây bằng `nextDomainId` là SAI khi người dùng quay lại đổi lĩnh vực:
      // `handleSelectDomain` KHÔNG nạp lại (goToStep chỉ nạp khi mọi danh sách đều rỗng),
      // nên dữ liệu của lĩnh vực cũ nằm lại và hiện ra dưới lĩnh vực mới.
      const sorted = history.interviews
        .filter((item) => item.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRawReports(sorted);
      setSelectedIds([]);
      setCvFiles(cvs);
      setRawCvAnalyses(analyses);
      // TODO: remove the status fallback once backend always exposes hasFinalReport.
      setCompletedRoadmaps(filterCompletedRoadmapsForWizard(roadmaps));
      setCvId(cvs[0]?.id);
      setCvAnalysisId(undefined);
      // CHỈ lấy từ bản phân tích CÙNG lĩnh vực: điền trình độ suy từ CV Business Analyst vào
      // lộ trình Backend là sai nền, mà giá trị đó đi thẳng vào prompt làm SÀN (bỏ phần nhập
      // môn người học đã nắm) nên hỏng âm thầm — không lỗi nào nổ.
      const inferredLevel = inferCurrentLevelFromAnalyses(analyses, nextDomainId);
      setCurrentLevel(inferredLevel ?? 'fresher');
      setCurrentLevelSource(inferredLevel ? 'cv' : 'default');
      setPriorRoadmapId(undefined);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Lọc theo lĩnh vực ở tầng DẪN XUẤT ⇒ đổi lĩnh vực là danh sách đúng ngay, không cần nạp lại.
  const allReports = useMemo(
    () => (domainId ? rawReports.filter((item) => item.domainId === domainId) : []),
    [rawReports, domainId],
  );
  const cvAnalyses = useMemo(
    () => analysesForDomain(rawCvAnalyses, domainId),
    [rawCvAnalyses, domainId],
  );

  // Lựa chọn TREO: đổi lĩnh vực xong, id đã chọn của lĩnh vực cũ vẫn nằm trong state và vẫn
  // được gửi lên — nhưng không còn hiện trên màn hình nào. Dọn ngay khi nó rời khỏi tập hợp lệ.
  //
  // ⚠ Gác bằng `raw*.length > 0`, KHÔNG bằng danh sách đã lọc: danh sách lọc rỗng có HAI nghĩa
  // — "chưa tải xong" và "đã tải, ngành này không có cái nào". Chỉ ca thứ hai mới được dọn;
  // dọn ở ca thứ nhất là xoá mất lựa chọn hợp lệ do người dùng (hoặc test) đặt trước khi tải.
  useEffect(() => {
    if (rawCvAnalyses.length === 0) return;
    if (cvAnalysisId && !cvAnalyses.some((a) => a.id === cvAnalysisId)) setCvAnalysisId(undefined);
  }, [rawCvAnalyses.length, cvAnalyses, cvAnalysisId]);
  useEffect(() => {
    if (rawReports.length === 0) return;
    setSelectedIds((prev) => prev.filter((id) => allReports.some((item) => item.id === id)));
  }, [rawReports.length, allReports]);

  const steps = useMemo<RoadmapWizardStep[]>(() => {
    // Chế độ lộ trình (LevelUp/Reinforce) KHÔNG còn tồn tại ở tầng giao diện: mỗi lộ trình nay là
    // một BẢN TRỘN (vừa sửa điểm yếu đo được, vừa tiến lên cấp mục tiêu). Bước chọn chế độ đã gỡ ở
    // `4d53085`, và vòng này gỡ nốt phần hiển thị + phần GỬI. Không state `mode`, không field
    // `mode` trong payload ⇒ backend nhận `null` và tự hiểu là "LevelUp" (`CreateRoadmapRequest`
    // khai `string? Mode = null`), đúng hành vi trước khi có bước đó.
    const showReports = loadingReports || allReports.length > 0;
    const showPrior = loadingReports || completedRoadmaps.length > 0;
    return ROADMAP_WIZARD_STEP_ORDER.filter((item) => {
      if (item === 'reports') return showReports;
      if (item === 'priorRoadmap') return showPrior;
      return true;
    });
  }, [allReports.length, completedRoadmaps.length, loadingReports]);

  // Bước MỒ CÔI: đang đứng ở một bước tuỳ chọn thì dữ liệu về rỗng ⇒ `steps` bỏ bước đó, nhưng
  // `step` vẫn giữ giá trị cũ. Đưa về bước hợp lệ gần nhất.
  //
  // ⚠ Dùng thẳng `setStep`, KHÔNG qua `goToStep`: chỗ này chỉ chạy NGAY SAU khi mẻ dữ liệu vừa
  // về, mà `goToStep` lại có nhánh nạp dữ liệu khi mọi danh sách đều rỗng ⇒ đi qua nó là gọi lại
  // API vừa chạy xong.
  useEffect(() => {
    const fallback = resolveOrphanStepFallback(step, steps);
    if (fallback) setStep(fallback);
  }, [step, steps]);

  const goToStep = useCallback(
    (nextStep: RoadmapWizardStep) => {
      if ((nextStep === 'cv' || nextStep === 'reports') && domainId && !loadingReports && allReports.length === 0 && cvFiles.length === 0 && cvAnalyses.length === 0) {
        // `.catch` ở đây là lưới cuối: `loadReportsForDomain` đã bọc từng lời gọi, nhưng chỗ gọi
        // dạng fire-and-forget mà để lọt một reject nào thì nó thành unhandled rejection — lỗi
        // duy nhất người dùng thấy là mọi ô im lặng rỗng.
        void loadReportsForDomain(domainId).catch(() => {});
      }
      setStep(nextStep);
    },
    [allReports.length, cvAnalyses.length, cvFiles.length, domainId, loadReportsForDomain, loadingReports],
  );

  // Điều hướng DẪN XUẤT từ `steps`, thay cho next/back ghi cứng ở từng bước.
  // Ghi cứng là cách lỗi thứ-tự-bước ở trên sinh ra: một lần đổi thứ tự phải sửa đúng 8 chỗ,
  // sót một chỗ thì wizard nhảy sai mà không có lỗi nào nổ. Ở đây thứ tự chỉ khai MỘT nơi.
  //
  // ⚠ PHẢI đi qua `goToStep`, KHÔNG gọi thẳng `setStep`: chỗ nạp dữ liệu (danh sách buổi luyện,
  // CV, bản phân tích, roadmap cũ) nằm trong `goToStep`. Gọi tắt thì vào bước CV/Báo cáo mà
  // không tải gì — mọi ô hiện "Bỏ qua", hai bước tuỳ chọn không bao giờ xuất hiện, và không có
  // lỗi nào nổ. Tôi đã tự gây đúng lỗi này ở lượt đầu khi thay next/back ghi cứng.
  const goNext = useCallback(() => {
    const i = steps.indexOf(step);
    if (i >= 0 && i < steps.length - 1) goToStep(steps[i + 1]);
  }, [goToStep, step, steps]);
  const goBack = useCallback(() => {
    const i = steps.indexOf(step);
    if (i > 0) goToStep(steps[i - 1]);
  }, [goToStep, step, steps]);
  const hasStep = useCallback((s: RoadmapWizardStep) => steps.includes(s), [steps]);

  const handleSelectDomain = (id: string) => {
    setDomainId(id);
    setTargetLevel('');
    setCurrentLevel('fresher');
    setCurrentLevelSource('default');
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
    setName,
    setCvId,
    setFocus,
    setCvAnalysisId,
    setPriorRoadmapId,
    scope,
    setScope,
    toggleReport,
    selectAllReports,
    unselectAllReports,
    goToStep,
    goNext,
    goBack,
    hasStep,
    steps,
    handleCreate,
  };
}
