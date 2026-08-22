import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useMilestoneScoreReport } from '../../hooks/useMilestoneScoreReport';
import { hasHeadlineMismatch } from '../../services/roadmapPractice.service';
import { MilestoneScoreCriterionRow } from './MilestoneScoreCriterionRow';

export function MilestoneScoreReportPanel({ roadmapId, milestoneId }: { roadmapId: string; milestoneId: string }) {
  const { t } = useLanguage();
  const query = useMilestoneScoreReport(roadmapId, milestoneId);

  if (query.isLoading) {
    return <p aria-live="polite" className="mt-3 text-caption text-muted-foreground">{t('practice.milestoneReport.loading')}</p>;
  }

  if (query.isError) {
    const status = getApiStatusCode(query.error);
    const messageKey = status === 403 ? 'forbidden' : status === 404 ? 'notFound' : 'error';
    return (
      <div className="mt-3 space-y-2">
        <Alert variant="error"><AlertDescription>{t(`practice.milestoneReport.${messageKey}`)}</AlertDescription></Alert>
        {status === 403 || status === 404 ? null : (
          <button type="button" className="btn-ghost inline-flex text-xs" onClick={() => void query.refetch()}>
            {t('practice.milestoneReport.retry')}
          </button>
        )}
      </div>
    );
  }

  const report = query.data;
  if (!report) return null;

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-subtle bg-surface-raised/70 p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
        {/* `source` phải NÓI RA, không nuốt: nó là lý do con số có thể lệch tiêu đề. */}
        <span>
          {t('practice.milestoneReport.sourceLabel')} <span className="text-foreground">{t(`practice.milestoneReport.source.${report.source}`)}</span>
        </span>
        <span>
          {t('practice.milestoneReport.comparedWithLabel')}{' '}
          <span className="text-foreground">
            {t(`practice.milestoneReport.comparedWith.${report.comparedWith}`)}
            {report.comparedWithTitle ? ` — ${report.comparedWithTitle}` : ''}
          </span>
        </span>
      </div>

      {hasHeadlineMismatch(report.criteria) ? (
        <Alert variant="warning"><AlertDescription>{t('practice.milestoneReport.mismatchWarning')}</AlertDescription></Alert>
      ) : null}

      {report.criteria.length ? (
        <div className="space-y-3">
          {report.criteria.map((criterion) => (
            <MilestoneScoreCriterionRow key={criterion.name} criterion={criterion} />
          ))}
        </div>
      ) : (
        <p className="text-caption text-muted-foreground">{t('practice.milestoneReport.empty')}</p>
      )}
    </div>
  );
}
