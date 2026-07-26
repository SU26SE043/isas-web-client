import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { SkillRadarChart } from '../SkillRadarChart';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';
import { PracticeOverallFeedback } from './PracticeOverallFeedback';

interface PracticeLiveResultReportProps {
  session: PracticeSessionResponse;
  onLeave?: () => void;
  actions?: ReactNode;
}

export function PracticeLiveResultReport({ session, onLeave, actions }: PracticeLiveResultReportProps) {
  const { t, language } = useLanguage();
  const result = session.result;
  if (!result) return null;
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const answeredCount = (session.answers ?? []).filter(
    (answer) => Boolean(answer.transcript || answer.textAnswer),
  ).length;
  const totalQuestions = session.questionCount ?? session.questions.length;
  const skippedCount = Math.max(0, totalQuestions - answeredCount);
  const maxScore = result.maxScore ?? 100;
  const reviewAnswers = session.questions.length
    ? session.questions.map((question) => {
        const answer = session.answers?.find((item) => item.questionId === question.id);
        return (
          answer ?? {
            questionId: question.id,
            orderNo: question.orderNo,
            content: question.content,
            kind: question.kind,
            status: 'Skipped',
          }
        );
      })
    : (session.answers ?? []);
  const averageDuration =
    answeredCount > 0
      ? Math.round(
          (session.answers ?? []).reduce((sum, answer) => sum + (answer.durationSec ?? 0), 0) /
            answeredCount,
        )
      : null;
  const radarData = result.criteriaScores.map((criterion) => {
    const max = criterion.maxScore && criterion.maxScore > 0 ? criterion.maxScore : 100;
    return {
      subject: criterion.name,
      subjectVi: criterion.name,
      A: Math.round(Math.max(0, Math.min(100, (criterion.score / max) * 100))),
      B: 50,
      fullMark: 100,
    };
  });

  return (
    <div className="page-container page-section mx-auto max-w-7xl space-y-8 py-8">
      <header className="space-y-5">
        <Link
          to="/candidate/practice/history"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('practice.result.backToList')}
        </Link>
        <div>
          <h1 className="heading-primary text-3xl text-foreground">
            {t('practice.result.liveTitle')} · {session.jobCategory ?? t('practice.result.session')}
          </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {session.level ? <span>{session.level} ·</span> : null}
          <span>{session.status}</span>
          {session.completedAt ? (
            <>
              <span>·</span>
              <time dateTime={session.completedAt}>
                {new Date(session.completedAt).toLocaleString(locale)}
              </time>
            </>
          ) : null}
        </div>
        </div>
      </header>

      <section
        id="overview"
        className="frame-satin scroll-mt-24 grid gap-6 rounded-2xl border border-satin bg-surface-raised p-6 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            {t('practice.result.overallScore')}
          </h2>
          <p className="mt-2 text-5xl font-semibold tabular-nums text-foreground">
            {result.overallScore}
            <span className="text-xl text-muted-foreground">/{maxScore}</span>
          </p>
          {result.overallComment ? (
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              {result.overallComment}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [t('practice.result.answered'), `${answeredCount}/${totalQuestions}`],
            [t('practice.result.skipped'), String(skippedCount)],
            [t('practice.result.averageDuration'), averageDuration == null ? '—' : `${averageDuration}s`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-satin bg-surface-overlay p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-y border-satin bg-surface-base/90 py-3 backdrop-blur">
        {[
          ['overview', t('practice.result.quickOverview')],
          ['questions', t('practice.result.quickQuestions')],
          ['criteria', t('practice.result.quickCriteria')],
          ['feedback', t('practice.result.quickFeedback')],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="btn-secondary shrink-0 text-xs">
            {label}
          </a>
        ))}
      </nav>

      {reviewAnswers.length ? (
        <section id="questions" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t('practice.result.questionReview')}
          </h2>
          {reviewAnswers.map((answer, index) => (
            <PracticeQuestionResultCard
              key={answer.answerId ?? answer.questionId}
              answer={answer}
              fallbackOrder={index + 1}
              defaultOpen={index === 0}
              timeLimitSec={
                session.questions.find((question) => question.id === answer.questionId)
                  ?.timeLimitSec ?? session.timeLimitSec
              }
            />
          ))}
        </section>
      ) : null}

      <section id="criteria" className="scroll-mt-24 space-y-3">
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

      {radarData.length >= 3 ? (
        <SkillRadarChart data={radarData} language={language} />
      ) : null}

      <PracticeOverallFeedback result={result} session={session} />

      <div className="flex flex-wrap gap-3 pb-8">
        {actions ?? (
          <>
            <Link to="/practice" className="btn-primary" onClick={onLeave}>
              {t('practice.result.practiceAgain')}
            </Link>
            <Link to="/candidate/practice/history" className="btn-secondary" onClick={onLeave}>
              {t('practice.result.history')}
            </Link>
            <Link to="/candidate/dashboard" className="btn-ghost" onClick={onLeave}>
              {t('practice.result.dashboard')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
