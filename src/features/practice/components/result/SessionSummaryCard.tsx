import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatScore } from '../../utils/practiceSessionResultFormat';

/** Overall "Kết quả" block — matches reference: big score + answered count + feedback. */
export function SessionSummaryCard({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  const passed =
    view.overallScore != null && view.passThresholdPct != null
      ? (view.overallScore / view.maxScore) * 100 >= view.passThresholdPct
      : null;

  return (
    <section
      id="overview"
      className="frame-satin scroll-mt-24 space-y-5 rounded-2xl border border-satin bg-surface-raised p-6"
    >
      <h2 className="text-lg font-semibold text-foreground">{t('practice.result.summary')}</h2>

      <div>
        <p className="text-5xl font-semibold tabular-nums text-info">
          {formatScore(view.overallScore, view.maxScore)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {view.answeredCount}/{view.totalQuestions} {t('practice.result.questionsAnswered')}
        </p>
        {passed != null ? (
          <p className={`mt-2 text-sm font-medium ${passed ? 'text-success' : 'text-warning'}`}>
            {passed ? t('practice.result.passed') : t('practice.result.notPassed')}
            {view.passThresholdPct != null
              ? ` · ${t('practice.result.passThreshold').replace('{{n}}', String(Math.round(view.passThresholdPct)))}`
              : null}
          </p>
        ) : null}
      </div>

      {view.overallFeedback ? (
        <div className="rounded-xl bg-surface-overlay p-4">
          <p className="leading-relaxed text-foreground">{view.overallFeedback}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [t('practice.result.answered'), `${view.answeredCount}/${view.totalQuestions}`],
          [t('practice.result.skipped'), String(view.skippedCount)],
          [
            t('practice.result.averageDuration'),
            view.averageDurationSec == null
              ? t('practice.result.noData')
              : t('practice.result.durationSeconds').replace(
                  '{{n}}',
                  String(view.averageDurationSec),
                ),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-satin bg-surface-overlay p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
