import { Lock, PencilLine, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import { CAMPAIGN_DEFAULT_MAX_ATTEMPTS } from '../../utils/campaignAttemptRules';
import { canIncreaseMaxAttempts } from '../../utils/campaignAttemptRulesUpdate';
import { IncreaseMaxAttemptsDialog } from './IncreaseMaxAttemptsDialog';

const K = 'employer.campaigns.detail.attemptRules';

/**
 * ATT1-F2 — thẻ "Luật làm bài" ở trang chi tiết (thay ô số liệu Thời lượng cũ).
 * - Draft: link "Sửa ở bước 5" (`?step=5` là 1-based ⇒ bước Bảo mật & phỏng vấn thích ứng).
 * - Active và `maxAttempts` < 3: nút "Tăng số lần" [C2]. KHÔNG có đường sửa thời lượng khi đã triển khai [C3].
 * - Closed / Archived (và Paused): chỉ hiển thị.
 */
export function CampaignAttemptRulesCard({ campaign }: { campaign: EmployerCampaign }) {
  const { t } = useLanguage();
  const isDraft = campaign.status === 'draft';
  const maxAttempts = campaign.maxAttempts ?? CAMPAIGN_DEFAULT_MAX_ATTEMPTS;
  const duration =
    campaign.durationMinutes > 0 ? `${campaign.durationMinutes} ${t('employer.campaigns.detail.minutes')}` : '—';
  const attempts = t(maxAttempts === 1 ? `${K}.attemptsValueOne` : `${K}.attemptsValueMany`).replace(
    '{{n}}',
    String(maxAttempts),
  );

  return (
    <Card className="frame-satin bg-surface-raised" data-testid="campaign-attempt-rules-card">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-info/30 bg-info/15 text-info-light">
              <Timer className="size-4" aria-hidden />
            </span>
            {t('employer.campaigns.form.attemptRules.title')}
          </CardTitle>
          {isDraft ? (
            <Link
              to={`/employer/campaigns/${campaign.id}/edit?step=5`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <PencilLine aria-hidden />
              {t(`${K}.editInStep5`)}
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <dt className="w-24 shrink-0 text-muted-foreground">{t('employer.campaigns.detail.duration')}</dt>
            <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <strong className="font-semibold text-foreground" data-testid="attempt-rules-duration">
                {duration}
              </strong>
              {isDraft ? null : (
                <span
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  data-testid="attempt-rules-duration-locked"
                >
                  <Lock className="size-3" aria-hidden />
                  {t(`${K}.durationLocked`)}
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <dt className="w-24 shrink-0 text-muted-foreground">{t(`${K}.attemptsLabel`)}</dt>
            <dd className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
              <strong className="font-semibold text-foreground" data-testid="attempt-rules-attempts">
                {attempts}
              </strong>
              {canIncreaseMaxAttempts(campaign.status, maxAttempts) ? (
                <IncreaseMaxAttemptsDialog campaignId={campaign.id} title={campaign.title} current={maxAttempts} />
              ) : null}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
