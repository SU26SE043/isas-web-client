import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useProfile } from '../hooks/useProfile';
import { InterviewActivitySection } from '../components/dashboard/InterviewActivitySection';
import { ProfileCompletenessBar } from '../components/ProfileCompletenessBar';

function MetricCard({ label, value, hint, to }: { label: string; value: string; hint?: string; to?: string }) {
  const content = (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );

  if (to) {
    return <Link to={to} className="block transition hover:opacity-90 focus-ring rounded-xl">{content}</Link>;
  }

  return content;
}

export const CandidateDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { summary, isLoading: summaryLoading } = useDashboardSummary();
  const { completeness, isLoading: profileLoading } = useProfile();

  if (summaryLoading || profileLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  const completenessPercent = completeness?.percent ?? summary?.profileCompleteness ?? 0;

  return (
    <div className="dashboard-content">
      <div className="mb-8">
        <h1 className="heading-primary text-3xl">{t('profile.dashboard.title')}</h1>
        <p className="body-text mt-2 max-w-2xl">{t('profile.dashboard.subtitle')}</p>
      </div>

      <div className="mb-8 rounded-xl border border-subtle bg-surface-raised p-5">
        <ProfileCompletenessBar percent={completenessPercent} showGateHint />
        {!completeness?.meetsGate ? (
          <Link to="/candidate/profile/complete" className="btn-primary mt-4 inline-flex">
            {t('profile.completeness.cta')}
          </Link>
        ) : null}
      </div>

      <div className="mb-8">
        <InterviewActivitySection />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          label={t('profile.dashboard.credits')}
          value={String(summary?.creditsRemaining ?? 0)}
          hint={t('profile.dashboard.creditsHint')}
        />
        <MetricCard
          label={t('profile.dashboard.practice')}
          value={t('profile.dashboard.practiceAction')}
          hint={t('profile.dashboard.practiceHint')}
          to="/practice"
        />
        <MetricCard
          label={t('profile.dashboard.cvStatus')}
          value={summary?.hasCv ? t('profile.dashboard.cvUploaded') : t('profile.dashboard.cvMissing')}
          hint={t('profile.dashboard.cvHint')}
          to="/candidate/cv/analysis"
        />
      </div>
    </div>
  );
};
