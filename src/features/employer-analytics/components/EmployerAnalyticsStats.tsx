import { BriefcaseBusiness, CheckCircle2, ClipboardCheck, Send, Target, Users } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalytics } from '../types/employerAnalytics.types';
import { computePassRate, toCampaignStatusChip } from '../utils/employerAnalyticsMetrics';

function fill(template: string, values: Record<string, number | string>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

/** 6 thẻ số tổng — trạng thái HIỆN TẠI của cả tổ chức, không đổi theo kỳ đã chọn. */
export function EmployerAnalyticsStats({ data, className }: { data: EmployerAnalytics; className?: string }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const number = (value: number) => value.toLocaleString(locale);
  const score = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 1 });

  const byStatus = (chip: 'active' | 'draft') =>
    data.campaigns.byStatus
      .filter((item) => toCampaignStatusChip(item.status) === chip)
      .reduce((sum, item) => sum + item.count, 0);
  const active = byStatus('active');
  const draft = byStatus('draft');
  const { invitations, interviews } = data;
  const passRate = computePassRate(interviews.passed, interviews.failed);

  return (
    <StatGrid columns={6} className={className}>
      <StatCard
        label={t('employerAnalytics.stats.activeCampaigns')}
        value={number(active)}
        hint={fill(t('employerAnalytics.stats.activeCampaignsHint'), { total: number(data.campaigns.total), draft: number(draft) })}
        icon={<BriefcaseBusiness aria-hidden />}
        to="/employer/campaigns"
      />
      <StatCard
        label={t('employerAnalytics.stats.invited')}
        value={number(invitations.total)}
        hint={fill(t('employerAnalytics.stats.invitedHint'), { sent: number(invitations.sent), queued: number(invitations.queued) })}
        icon={<Send aria-hidden />}
      />
      <StatCard
        label={t('employerAnalytics.stats.joined')}
        value={number(interviews.joined)}
        hint={fill(t('employerAnalytics.stats.joinedHint'), { started: number(interviews.started), inProgress: number(interviews.inProgress) })}
        icon={<Users aria-hidden />}
      />
      <StatCard
        label={t('employerAnalytics.stats.scored')}
        value={number(interviews.scored)}
        hint={fill(t('employerAnalytics.stats.scoredHint'), { pending: number(interviews.pendingScore) })}
        icon={<ClipboardCheck aria-hidden />}
        tone={interviews.pendingScore > 0 ? 'warning' : 'neutral'}
      />
      <StatCard
        label={t('employerAnalytics.stats.passRate')}
        value={passRate == null ? '—' : `${score(passRate)}%`}
        hint={
          passRate == null
            ? t('employerAnalytics.stats.passRateEmpty')
            : fill(t('employerAnalytics.stats.passRateHint'), {
                passed: number(interviews.passed),
                failed: number(interviews.failed),
                undetermined: number(interviews.undetermined),
              })
        }
        icon={<CheckCircle2 aria-hidden />}
        tone={passRate == null ? 'neutral' : 'success'}
      />
      <StatCard
        label={t('employerAnalytics.stats.medianScore')}
        value={interviews.medianScore == null ? '—' : score(interviews.medianScore)}
        hint={interviews.medianScore == null ? t('employerAnalytics.stats.medianScoreEmpty') : t('employerAnalytics.stats.medianScoreHint')}
        icon={<Target aria-hidden />}
      />
    </StatGrid>
  );
}
