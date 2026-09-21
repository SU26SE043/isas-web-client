import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';

interface CandidateStatusCellProps {
  candidate: CampaignCandidateListItem;
  onRescreen?: (candidateId: string) => void;
  rescreeningCandidateId?: string | null;
}

const BADGE_VARIANT: Record<string, 'info' | 'destructive' | 'secondary'> = {
  invited: 'info',
  rejected: 'destructive',
  pending: 'secondary',
};

/**
 * Trạng thái sàng CV, nay nằm DƯỚI tên ứng viên thay vì một cột riêng — và chỉ hiện khi KHÁC
 * "Đã phân tích": trạng thái mặc định lặp ở mọi dòng không mang thông tin, còn cột thứ 6 là thứ
 * đẩy "Xem chi tiết" ra ngoài khung wizard (đo 21/09: bảng 7 cột trong khung ~1090px, cột Trạng
 * thái bị cắt, nút hành động phải cuộn ngang mới thấy).
 */
export function CandidateStatusCell({ candidate, onRescreen, rescreeningCandidateId }: CandidateStatusCellProps) {
  const { t } = useLanguage();
  const status = candidate.status.toLowerCase();
  if (status === 'analyzed') return null;

  if (status === 'analysisfailed') {
    return (
      <div className="mt-1 text-xs">
        <p className="font-medium text-error">{t(candidateScreeningStatusLabelKey(candidate.status))}</p>
        {candidate.rejectReason ? <p className="mt-0.5 text-error">{candidate.rejectReason}</p> : null}
        {onRescreen ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            loading={rescreeningCandidateId === candidate.id}
            disabled={rescreeningCandidateId === candidate.id}
            onClick={() => onRescreen(candidate.id)}
          >
            {t('employer.campaigns.screening.actions.rescreen')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Badge variant={BADGE_VARIANT[status] ?? 'secondary'} className="mt-1">
      {t(candidateScreeningStatusLabelKey(candidate.status))}
    </Badge>
  );
}
