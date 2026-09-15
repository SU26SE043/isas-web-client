import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';
import { getResultFlagCount } from '../../../utils/campaignResultsActions';
import { ProctoringAnalysis } from '../ProctoringAnalysis';

/**
 * Cờ giám sát của buổi thi dưới dạng MỘT NÚT ở đầu trang chi tiết → bấm mở popup liệt kê từng cờ
 * (2026-09-15, theo yêu cầu chủ sản phẩm). Trước đó là một khối "Phân tích giám sát" nằm CUỐI trang,
 * dưới toàn bộ câu hỏi — HR phải cuộn hết bài mới biết buổi này có 9 cờ hay 0 cờ.
 *
 * 0 cờ → badge tĩnh "không có vi phạm", KHÔNG có nút (popup rỗng là một cú bấm vô nghĩa, và HR vẫn cần
 * thấy rằng giám sát đã chạy và không ghi nhận gì).
 */
export function ProctoringFlagsButton({ flags }: { flags: CampaignResultFlag[] }) {
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
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.proctoring.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.results.proctoring.description')}</DialogDescription>
        </DialogHeader>
        <ProctoringAnalysis flags={flags} embedded />
      </DialogContent>
    </Dialog>
  );
}
