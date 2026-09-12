import { useRubricPreview } from '../../../hooks/useRubricPreview';
import type { CampaignQuestion, EmployerCampaignStatus, RubricCriterion } from '../../../types/campaignManagement.types';
import { RubricPreviewCard } from './RubricPreviewCard';

export interface RubricPreviewMountProps {
  campaignId: string | null;
  campaignStatus: EmployerCampaignStatus | null;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  passScorePct: number | null;
  variant?: 'full' | 'compact';
  /** Wizard: lưu thước đo + câu hỏi trước khi chạy; trả campaignId sau lưu. Cùng một hàm đi vào hook (beforeRun) và card (nhãn/confirm). */
  onBeforeRun?: () => Promise<string | null>;
  onGoToCriteria?: () => void;
  onGoToQuestions?: () => void;
  currentRubricVersion?: number | null;
  className?: string;
}

/**
 * Chỗ DUY NHẤT nối hook `useRubricPreview` với card — card và mọi con của nó chỉ nhận `preview` qua props
 * nên test không phụ thuộc hook. Bước 3 (full), bước 8 (compact) và trang chi tiết đều đi qua đây.
 */
export function RubricPreviewMount({ campaignId, onBeforeRun, ...cardProps }: RubricPreviewMountProps) {
  const preview = useRubricPreview({ campaignId, beforeRun: onBeforeRun });
  return <RubricPreviewCard preview={preview} campaignId={campaignId} onBeforeRun={onBeforeRun} {...cardProps} />;
}
