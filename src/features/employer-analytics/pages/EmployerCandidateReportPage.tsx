import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { AnalyticsBars } from '../components/AnalyticsBars';
import { ScoreOverrideForm } from '../components/ScoreOverrideForm';
import { getCandidateDisplay } from '../components/PipelineTable';
import { useEmployerCandidate } from '../hooks/useEmployerAnalytics';

export function EmployerCandidateReportPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { candidate, report, isLoading, overrideScore } = useEmployerCandidate(id);

  if (isLoading || !candidate || !report) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-6xl"><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  const visibleScore = report.overrideScore ?? report.score;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <Link to={`/employer/candidates/${candidate.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          {t('employerAnalytics.report.back')}
        </Link>
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('employerAnalytics.report.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('employerAnalytics.report.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{getCandidateDisplay(candidate)} · {t(`employerAnalytics.recommendation.${report.recommendation}`)}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label={t('employerAnalytics.report.score')} value={visibleScore} />
          <Metric label={t('employerAnalytics.report.recommendation')} value={t(`employerAnalytics.recommendation.${report.recommendation}`)} />
          <Metric label={t('employerAnalytics.pipeline.stage')} value={t(`employerAnalytics.stage.${candidate.stage}`)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <AnalyticsBars
            title={t('employerAnalytics.report.breakdown')}
            items={report.breakdown.map((item) => ({ label: item.label, value: item.value }))}
            max={100}
          />
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employerAnalytics.report.override')}</CardTitle></CardHeader>
            <CardContent>
              <ScoreOverrideForm defaultScore={visibleScore} locked={report.reviewed} onSubmit={(score, note) => overrideScore(score, note).then(() => undefined)} />
            </CardContent>
          </Card>
        </div>

        <Card className="border border-subtle bg-surface-raised">
          <CardHeader><CardTitle>{t('employerAnalytics.report.rubric')}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {report.rubricEvidence.map((item) => (
              <div key={item.criterion} className="rounded-xl border border-subtle bg-surface-overlay p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{item.criterion}</p>
                  <span className="text-sm text-muted-foreground">{item.score}/100 · {item.weight}%</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.evidence}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <InsightList title={t('employerAnalytics.report.strengths')} icon="success" items={report.strengths} />
          <InsightList title={t('employerAnalytics.report.risks')} icon="warning" items={report.risks} />
          <InsightList title={t('employerAnalytics.report.transcript')} icon="neutral" items={report.transcriptHighlights} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function InsightList({ title, icon, items }: { title: string; icon: 'success' | 'warning' | 'neutral'; items: string[] }) {
  const Icon = icon === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-lg border border-subtle bg-surface-overlay p-3">
            <Icon className={icon === 'warning' ? 'mt-0.5 size-4 shrink-0 text-warning' : 'mt-0.5 size-4 shrink-0 text-success'} aria-hidden />
            <p className="text-sm text-muted-foreground">{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
