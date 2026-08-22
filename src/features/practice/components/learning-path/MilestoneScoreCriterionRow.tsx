import { useLanguage } from '@/shared/languages';
import type { MilestoneScoreCriterion, MilestoneScoreSession } from '../../types/roadmapPractice.api.types';

/**
 * `null` = KHUYẾT, trả dấu gạch. Vẽ thành `0%` là bịa ra một số đo không tồn tại,
 * và cái sai đó luôn nghiêng về phía KHEN người học (mốc tụt xuống đáy thì mọi
 * thứ trông như đang vượt mốc) — kiểu sai không ai đi báo.
 */
export function formatPct(value: number | null): string {
  return value == null ? '—' : `${value}%`;
}

export function formatDelta(value: number | null): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : '−'}${Math.abs(value)}%`;
}

function SessionList({ sessions, labelKey }: { sessions: MilestoneScoreSession[]; labelKey: string }) {
  const { t } = useLanguage();
  return (
    <div>
      <p className="text-caption font-medium text-foreground">{t(labelKey)}</p>
      {sessions.length ? (
        <ul className="mt-1 space-y-1">
          {sessions.map((session) => (
            <li key={`${session.sessionId}-${session.attemptNo}`} className="flex flex-wrap items-baseline gap-x-2 text-caption text-muted-foreground">
              <span className="text-foreground">{session.lessonTitle}</span>
              {/* Làm lại bài thì mỗi lần là một dòng riêng — phải nói rõ đây là lần thứ mấy. */}
              {session.attemptNo > 1 ? <span>{t('practice.milestoneReport.attempt')} {session.attemptNo}</span> : null}
              <span className="font-semibold text-foreground">{formatPct(session.percentage)}</span>
              {session.scoredAt ? <span>{session.scoredAt}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-caption text-muted-foreground">{t('practice.milestoneReport.noSessions')}</p>
      )}
    </div>
  );
}

export function MilestoneScoreCriterionRow({ criterion }: { criterion: MilestoneScoreCriterion }) {
  const { t } = useLanguage();
  const mismatch =
    criterion.deltaPct != null && criterion.headlineDeltaPct != null && criterion.deltaPct !== criterion.headlineDeltaPct;
  return (
    <section className="rounded-xl border border-subtle bg-surface-overlay/60 p-4">
      <h4 className="font-medium text-foreground">{criterion.name}</h4>
      <dl className="mt-2 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.milestoneReport.current')}</dt>
          <dd className="text-foreground">{formatPct(criterion.currentAveragePercentage)}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.milestoneReport.reference')}</dt>
          <dd className="text-foreground">{formatPct(criterion.referenceAveragePercentage)}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.milestoneReport.delta')}</dt>
          <dd className={criterion.deltaPct == null ? 'text-muted-foreground' : criterion.deltaPct < 0 ? 'font-semibold text-error' : 'font-semibold text-success'}>
            {formatDelta(criterion.deltaPct)}
          </dd>
        </div>
      </dl>
      {/* Lệch thì trưng CẢ HAI con số, không im lặng chọn một bên. */}
      {mismatch ? (
        <p className="mt-2 text-caption text-warning">
          {t('practice.milestoneReport.headlineValue')} <span className="font-semibold">{formatDelta(criterion.headlineDeltaPct)}</span>
        </p>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SessionList sessions={criterion.currentSessions} labelKey="practice.milestoneReport.sessionsCurrent" />
        <SessionList sessions={criterion.referenceSessions} labelKey="practice.milestoneReport.sessionsReference" />
      </div>
    </section>
  );
}
