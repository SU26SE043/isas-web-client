import { Pencil } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { LearningRoadmapCard } from '../../types/learningPath.types';

/**
 * Hai nguồn ngữ cảnh (bản phân tích CV, roadmap trước đó) ở bước Xác nhận — CHỈ ĐỌC.
 *
 * 🔴 Trước đây đây là hai ô `<select>`, trong khi bước 3 ("CV") và bước "Roadmap đã hoàn tất" đã
 * làm đúng việc chọn. Hai ô nhập cho CÙNG một giá trị là chỗ đẻ ra mâu thuẫn: người dùng chọn ở
 * bước 3, sang Xác nhận thấy "Không chọn" thì không biết cái nào thắng. Bước Xác nhận phải trả
 * lời đúng một câu — "tôi sắp tạo cái gì" — chứ không phải hỏi lại.
 *
 * Đường sửa vẫn còn, chỉ là dẫn NGƯỢC về đúng bước sở hữu giá trị đó. `onEdit*` vắng mặt ⇒ bước
 * đó không có trong `steps` (ví dụ chưa có roadmap nào hoàn tất) ⇒ không vẽ nút dẫn tới một bước
 * không tồn tại.
 */
function SummaryRow({
  label,
  value,
  muted,
  onEdit,
  editLabel,
}: {
  label: string;
  value: string;
  muted?: boolean;
  onEdit?: () => void;
  editLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-3">
        <span
          className={`min-w-0 truncate text-right font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}
          title={value}
        >
          {value}
        </span>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-satin bg-surface-overlay px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-info/45 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            aria-label={`${editLabel}: ${label}`}
          >
            <Pencil className="size-3" aria-hidden />
            {editLabel}
          </button>
        ) : null}
      </dd>
    </div>
  );
}

export function RoadmapConfirmSources({
  cvAnalyses,
  cvAnalysisId,
  completedRoadmaps,
  priorRoadmapId,
  onEditCvAnalysis,
  onEditPriorRoadmap,
}: {
  cvAnalyses: CvAnalysisResult[];
  cvAnalysisId?: string;
  completedRoadmaps: LearningRoadmapCard[];
  priorRoadmapId?: string;
  onEditCvAnalysis?: () => void;
  onEditPriorRoadmap?: () => void;
}) {
  const { language, t } = useLanguage();
  const editLabel = t('practice.roadmapWizard.confirm.edit');

  const analysis = cvAnalyses.find((item) => item.id === cvAnalysisId);
  const roadmap = completedRoadmaps.find((item) => item.id === priorRoadmapId);

  // Ba trạng thái KHÁC NHAU, không gộp: "đã chọn X" · "có thứ để chọn nhưng chưa chọn" · "không có
  // gì để chọn". Gộp hai cái sau thành một câu thì người dùng không biết mình bỏ sót hay hệ thống
  // không có dữ liệu — và chỉ ca giữa mới đáng hiện nút Sửa.
  const analysisValue = analysis
    ? `${analysis.jobCategory} · ${new Date(analysis.createdAt).toLocaleDateString()}`
    : cvAnalyses.length > 0
      ? t('practice.roadmapWizard.confirm.notSelected')
      : t('practice.roadmapWizard.confirm.cvAnalysisNone');
  const roadmapValue = roadmap
    ? (language === 'vi' ? roadmap.nameVi : roadmap.name)
    : completedRoadmaps.length > 0
      ? t('practice.roadmapWizard.confirm.notSelected')
      : t('practice.roadmapWizard.confirm.priorRoadmapNone');

  return (
    <>
      <SummaryRow
        label={t('practice.roadmapWizard.confirm.cvAnalysis')}
        value={analysisValue}
        muted={!analysis}
        onEdit={cvAnalyses.length > 0 ? onEditCvAnalysis : undefined}
        editLabel={editLabel}
      />
      <SummaryRow
        label={t('practice.roadmapWizard.confirm.priorRoadmap')}
        value={roadmapValue}
        muted={!roadmap}
        onEdit={completedRoadmaps.length > 0 ? onEditPriorRoadmap : undefined}
        editLabel={editLabel}
      />
    </>
  );
}
