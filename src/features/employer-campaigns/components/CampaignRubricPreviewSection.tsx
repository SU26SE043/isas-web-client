import type { EmployerCampaign } from '../types/campaignManagement.types';
import { RubricPreviewMount } from './wizard/preview/RubricPreviewMount';

/**
 * Card chấm thử thước đo trên trang chi tiết (CAMP-19). Chỉ mount cho Draft/Active — Closed/Archived thì BE 409,
 * không có gì để kiểm nữa. Không có bước lưu (rubric đã nằm trên server) ⇒ nút là "Chấm thử", không confirm.
 * Tách khỏi `CampaignDetailView` để file đó không vượt trần 250 dòng.
 */
export function CampaignRubricPreviewSection({ campaign, onGoToCriteria }: { campaign: EmployerCampaign; onGoToCriteria?: () => void }) {
  if (campaign.status !== 'draft' && campaign.status !== 'active') return null;
  return (
    <RubricPreviewMount
      campaignId={campaign.id}
      campaignStatus={campaign.status}
      rubric={campaign.rubric}
      questions={campaign.questions}
      passScorePct={campaign.passScorePct ?? null}
      onGoToCriteria={onGoToCriteria}
    />
  );
}
