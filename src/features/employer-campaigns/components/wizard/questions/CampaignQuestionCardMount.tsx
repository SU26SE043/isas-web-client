import { useQuestionPreview } from '../../../hooks/useQuestionPreview';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import { CampaignQuestionCard, type CampaignQuestionCardProps } from './CampaignQuestionCard';

export interface CampaignQuestionCardMountProps extends Omit<CampaignQuestionCardProps, 'preview' | 'previewCtx'> {
  previewCtx: QuestionPreviewContext;
}

/**
 * SC2 · T9 — chỗ DUY NHẤT nối `useQuestionPreview` với card (mẫu `RubricPreviewMount`): card và mọi con chỉ
 * nhận `preview` qua props nên test không phụ thuộc hook/QueryClient. Mỗi card một instance; TanStack dedupe
 * GET theo `queryKey` nên vẫn một lần gọi mạng cho cả danh sách.
 */
export function CampaignQuestionCardMount({ previewCtx, question, ...cardProps }: CampaignQuestionCardMountProps) {
  const preview = useQuestionPreview({
    campaignId: previewCtx.campaignId,
    questionId: question.id,
    currentRubricVersion: previewCtx.currentRubricVersion,
    beforeRun: previewCtx.beforeRun,
    resolveQuestionId: previewCtx.resolveQuestionId,
  });
  return <CampaignQuestionCard {...cardProps} question={question} previewCtx={previewCtx} preview={preview} />;
}
