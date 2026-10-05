import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import { useCampaignResultFlagTimeline } from '../../../hooks/useCampaignResults';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';
import { ProctoringAnalysis, type ProctoringTimelineStatus } from '../ProctoringAnalysis';

interface ProctoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  sessionId: string;
  flags: CampaignResultFlag[];
}

/**
 * Popup "Phân tích giám sát" dùng chung cho trang chi tiết và khu "chưa chấm nhưng có cờ".
 *
 * Hook dòng thời gian nằm trong `ProctoringDialogBody` — `DialogContent` chỉ mount con khi popup mở,
 * nên endpoint chỉ được gọi khi HR thật sự mở popup (bảng 50 ứng viên không bắn 50 request).
 */
export function ProctoringDialog({ open, onOpenChange, campaignId, sessionId, flags }: ProctoringDialogProps) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* overflowAnchor none: khi dòng thời gian tải xong, danh sách gộp được thay bằng ba tầng —
          scroll anchoring của trình duyệt có thể giữ "điểm neo" cũ trong khung nhìn nên popup tự cuộn
          xuống (đo trên dev: 209px, mất tiêu đề). Style trực tiếp: class tuỳ biến Tailwind không được
          sinh ra trong dev. */}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" style={{ overflowAnchor: 'none' }}>
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.proctoring.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.results.proctoring.description')}</DialogDescription>
        </DialogHeader>
        <ProctoringDialogBody campaignId={campaignId} sessionId={sessionId} flags={flags} />
      </DialogContent>
    </Dialog>
  );
}

function ProctoringDialogBody({ campaignId, sessionId, flags }: Omit<ProctoringDialogProps, 'open' | 'onOpenChange'>) {
  const timeline = useCampaignResultFlagTimeline(campaignId, sessionId);
  const status: ProctoringTimelineStatus = timeline.isError
    ? 'error'
    : timeline.isSuccess
      ? 'ready'
      : 'loading';
  return <ProctoringAnalysis flags={flags} events={timeline.data?.events} timelineStatus={status} />;
}
