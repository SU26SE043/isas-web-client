import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';
import { getResultFlagCount } from '../../../utils/campaignResultsActions';
import { ProctoringDialog } from '../proctoring/ProctoringDialog';

/**
 * Cờ giám sát của buổi thi dưới dạng MỘT NÚT ở đầu trang chi tiết → bấm mở popup (2026-09-15, theo yêu
 * cầu chủ sản phẩm; trước đó là khối cuối trang, HR phải cuộn hết bài mới biết có cờ hay không).
 *
 * Số trên nút là LƯỢT GHI NHẬN (dữ liệu gộp của `/results`), không phải số sự việc — số sự việc chỉ tính
 * được sau khi tải dòng thời gian trong popup. Gọi đúng tên để nút và popup không mâu thuẫn nhau.
 *
 * 0 cờ → badge tĩnh "không có vi phạm", KHÔNG có nút (popup rỗng là một cú bấm vô nghĩa, và HR vẫn cần
 * thấy rằng giám sát đã chạy và không ghi nhận gì).
 */
export function ProctoringFlagsButton({
  flags,
  campaignId,
  sessionId,
}: {
  flags: CampaignResultFlag[];
  campaignId: string;
  sessionId: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const count = getResultFlagCount(flags);

  if (count === 0) {
    return (
      <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
        <ShieldCheck className="size-3.5" aria-hidden />
        {t('employer.campaigns.results.detail.proctoringNone')}
      </Badge>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ShieldAlert aria-hidden />
        {t('employer.campaigns.results.detail.proctoringButton').replace('{{count}}', String(count))}
      </Button>
      <ProctoringDialog
        open={open}
        onOpenChange={setOpen}
        campaignId={campaignId}
        sessionId={sessionId}
        flags={flags}
      />
    </>
  );
}
