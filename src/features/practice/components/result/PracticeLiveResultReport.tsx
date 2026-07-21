import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';

interface PracticeLiveResultReportProps {
  session: PracticeSessionResponse;
  onLeave?: () => void;
}

export function PracticeLiveResultReport({ session, onLeave }: PracticeLiveResultReportProps) {
  const { t } = useLanguage();
  const result = session.result;
  if (!result) return null;

  return (
    <div className="page-container page-section mx-auto max-w-4xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.result.liveTitle')}</h1>
      </header>

      <section className="frame-satin rounded-2xl border border-satin bg-surface-raised p-6">
        <h2 className="text-sm font-medium text-muted-foreground">{t('practice.result.overallScore')}</h2>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">
          {result.overallScore}
          <span className="text-lg text-muted-foreground"> / 100</span>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.result.criteriaScores')}</h2>
        <ul className="space-y-3">
          {result.criteriaScores.map((item) => {
            const max = item.maxScore && item.maxScore > 0 ? item.maxScore : 100;
            const pct = Math.max(0, Math.min(100, (item.score / max) * 100));
            return (
              <li key={item.name} className="rounded-xl border border-satin bg-surface-raised p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.score}
                    {item.maxScore != null ? ` / ${item.maxScore}` : ''}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-overlay">
                  <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                </div>
                {item.comment ? (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-normal [overflow-wrap:anywhere]">
                    {item.comment}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.result.needsImprovement')}</h2>
        {result.needsImprovement.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('practice.result.needsImprovementEmpty')}</p>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
            {result.needsImprovement.map((item) => (
              <li key={item} className="whitespace-normal [overflow-wrap:anywhere]">
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.result.overallComment')}</h2>
        <p className="text-sm leading-relaxed text-foreground whitespace-normal [overflow-wrap:anywhere]">
          {result.overallComment || '—'}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.result.cvVsAnswer')}</h2>
        {!session.cvId || !result.cvVsAnswer ? (
          <p className="text-sm text-muted-foreground">{t('practice.result.cvVsAnswerNone')}</p>
        ) : (
          <div className="space-y-2 rounded-xl border border-satin bg-surface-raised p-4 text-sm text-foreground">
            {result.cvVsAnswer.consistencyScore != null ? (
              <p>
                {t('practice.result.overallScore')}: {result.cvVsAnswer.consistencyScore}
              </p>
            ) : null}
            {result.cvVsAnswer.summary ? (
              <p className="whitespace-normal [overflow-wrap:anywhere]">{result.cvVsAnswer.summary}</p>
            ) : null}
            {(result.cvVsAnswer.confirmedSkills ?? []).map((skill) => (
              <p key={skill}>• {skill}</p>
            ))}
          </div>
        )}
      </section>

      {session.answers && session.answers.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t('practice.result.questionReview')}</h2>
          <ul className="space-y-3">
            {session.answers.map((item) => (
              <li key={item.questionId} className="rounded-xl border border-satin bg-surface-raised p-4 text-sm">
                <p className="font-medium text-foreground">
                  {item.orderNo != null ? `#${item.orderNo} · ` : null}
                  {item.content ?? item.questionId}
                </p>
                {item.kind ? <p className="mt-1 text-xs text-muted-foreground">{item.kind}</p> : null}
                <p className="mt-2 text-muted-foreground">
                  {item.transcript ?? t('practice.answer.transcriptPending')}
                </p>
                {item.score != null ? (
                  <p className="mt-1 tabular-nums text-foreground">{item.score}</p>
                ) : null}
                {item.comment ? (
                  <p className="mt-1 whitespace-normal [overflow-wrap:anywhere]">{item.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 pb-8">
        <Link to="/practice" className="btn-primary" onClick={onLeave}>
          {t('practice.result.practiceAgain')}
        </Link>
        <Link to="/candidate/practice/history" className="btn-secondary" onClick={onLeave}>
          {t('practice.result.history')}
        </Link>
        <Link to="/candidate/dashboard" className="btn-ghost" onClick={onLeave}>
          {t('practice.result.dashboard')}
        </Link>
      </div>
    </div>
  );
}
