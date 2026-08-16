import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Coins, Loader2, Play, Target, TrendingUp, XCircle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useTokenWallet } from '@/features/payment/hooks/useTokenWallet';
import { useInterviewHistory } from '@/features/practice/hooks/useInterviewHistory';
import { computeInterviewActivityStats } from '../utils/interviewHeatmapUtils';

function MetricCard({
  label,
  value,
  hint,
  to,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  to: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-subtle bg-surface-raised p-5 transition-colors hover:border-foreground/30 focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-surface-overlay text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className="mt-5 text-label text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-caption text-muted-foreground">{hint}</p>
    </Link>
  );
}

export const CandidateDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { available: tokenAvailable, isLoading: walletLoading } = useTokenWallet();
  const { interviews, isLoading: historyLoading } = useInterviewHistory({ pageSize: 500 });

  if (walletLoading || historyLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  const stats = computeInterviewActivityStats(interviews);

  return (
    <div className="dashboard-content">
      <div className="mb-8">
        <h1 className="heading-primary text-3xl">{t('profile.dashboard.title')}</h1>
        <p className="body-text mt-2 max-w-2xl">{t('profile.dashboard.subtitle')}</p>
      </div>

      <Link
        to="/practice"
        className="group mb-6 flex items-center justify-between gap-4 rounded-2xl border border-foreground/20 bg-surface-elevated p-5 transition-colors hover:border-foreground/50 focus-ring sm:p-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden />
          </span>
          <div>
            <p className="text-lg font-semibold text-foreground">{t('profile.dashboard.practiceAction')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('profile.dashboard.practiceHint')}</p>
          </div>
        </div>
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('profile.dashboard.heatmapTotal')}
          value={String(stats.total)}
          hint={t('profile.dashboard.statInterviewsHint')}
          icon={Target}
          to="/candidate/practice/history"
        />
        <MetricCard
          label={t('profile.dashboard.heatmapAverageScore')}
          value={`${stats.averageScore}%`}
          hint={t('profile.dashboard.statScoreHint')}
          icon={TrendingUp}
          to="/candidate/practice/history"
        />
        <MetricCard
          label={t('profile.dashboard.heatmapPassed')}
          value={String(stats.passed)}
          hint={t('profile.dashboard.statPassedHint')}
          icon={CheckCircle2}
          to="/candidate/practice/history?status=passed"
        />
        <MetricCard
          label={t('profile.dashboard.tokens')}
          value={(tokenAvailable ?? 0).toLocaleString()}
          hint={t('profile.dashboard.tokensHint')}
          icon={Coins}
          to="/candidate/credits"
        />
      </div>

      {stats.failed > 0 ? (
        <Link to="/candidate/practice/history?status=failed" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-ring">
          <XCircle className="size-4" aria-hidden />
          {t('profile.dashboard.statFailedLink').replace('{count}', String(stats.failed))}
        </Link>
      ) : null}
    </div>
  );
};
