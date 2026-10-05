import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag, CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { getUnscoredFlaggedStatusKeys } from '../../utils/unscoredFlaggedStatus';
import { ProctoringAggregatedList } from './proctoring/ProctoringAggregatedList';

/**
 * Danh sách cờ của MỘT buổi chưa có điểm. Dùng chung cho bảng desktop lẫn thẻ mobile để hai bố cục
 * không lệch nhau (trước đây thẻ mobile bỏ mất dòng "Lần đầu / Lần cuối"); cùng một danh sách với
 * popup giám sát khi chưa tải được dòng thời gian.
 */
export function UnscoredFlagList({ flags }: { flags: CampaignResultFlag[] }) {
  const { t } = useLanguage();
  if (flags.length === 0) {
    return <span className="text-xs text-muted-foreground">{t('employer.campaigns.results.flags.none')}</span>;
  }
  return <ProctoringAggregatedList flags={flags} />;
}

/**
 * Trạng thái buổi thay cho cột mã phiên. CỐ Ý không hiện giờ bắt đầu: sau một lượt làm lại, backend
 * vẫn trả giờ bắt đầu của lượt 1 (giữ ngữ nghĩa MON1), nên HR sẽ đọc sai giờ.
 */
export function UnscoredStatus({ item }: { item: CampaignUnscoredFlaggedResult }) {
  const { t } = useLanguage();
  const status = getUnscoredFlaggedStatusKeys(item);
  // Lỗi sinh câu hỏi là lỗi của hệ thống, không phải của ứng viên ⇒ vàng (cần chú ý), không đỏ.
  const systemFault = item.interviewStatus === 'Abandoned' && item.abandonReason === 'generation_failed';
  return (
    <div className="space-y-1">
      {/* Badge mặc định h-5 + nowrap + overflow-hidden ⇒ nhãn dài bị cắt cụt; cho phép xuống dòng. */}
      <Badge
        variant={systemFault ? 'warning' : 'outline'}
        className="h-auto max-w-full whitespace-normal text-left"
      >
        {t(status.label)}
      </Badge>
      {status.detail ? <p className="text-xs text-muted-foreground">{t(status.detail)}</p> : null}
    </div>
  );
}
