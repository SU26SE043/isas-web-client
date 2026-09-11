import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, TranscriptQuestion } from '../../../types/campaign.api.types';
import { candidateDisplayEmail, candidateDisplayName, ResultStatusBadge } from '../ResultBadges';

/**
 * Header trang "Đánh giá chi tiết": chiến dịch (eyebrow) · tên + email ứng viên · hạng/kết quả/số câu cần soi
 * · nút Ứng viên trước/sau (thứ tự HẠNG server, không phải bảng đã lọc). Đóng trang = breadcrumb
 * "Quay lại kết quả" ở trang (trước đây có thêm nút × ở đây ⇒ hai cách đóng cùng một màn).
 */
export function ResultDetailHeader({ campaignName, item, total, questions, previous, next, onNavigate }: {
  campaignName: string;
  item: CampaignResultItem;
  total: number;
  questions: TranscriptQuestion[];
  previous: CampaignResultItem | null;
  next: CampaignResultItem | null;
  onNavigate: (sessionId: string) => void;
}) {
  const { t } = useLanguage();
  const reviewCount = questions.filter((question) => question.needsReview).length;
  const email = candidateDisplayEmail(item, t);
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 space-y-2">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{campaignName}</p>
        <div>
          <h1 className="heading-primary text-lg! [overflow-wrap:anywhere] sm:text-2xl!">{candidateDisplayName(item, t)}</h1>
          {email ? <p className="text-sm text-muted-foreground">{email}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {t('employer.campaigns.results.detail.rank').replace('{{rank}}', String(item.rank)).replace('{{total}}', String(total))}
          </Badge>
          <ResultStatusBadge result={item.result} />
          <Badge variant="outline" className={reviewCount ? 'border-warning/30 bg-warning/10 text-warning' : ''}>
            {t('employer.campaigns.results.detail.needsReview').replace('{{count}}', String(reviewCount))}
          </Badge>
        </div>
      </div>
      <nav className="flex gap-2" aria-label={t('employer.campaigns.results.detail.candidateNavigation')}>
        <Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && onNavigate(previous.sessionId)}>
          <ArrowLeft aria-hidden />
          {t('employer.campaigns.results.detail.previous')}
        </Button>
        <Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next.sessionId)}>
          {t('employer.campaigns.results.detail.next')}
          <ArrowRight aria-hidden />
        </Button>
      </nav>
    </header>
  );
}
