import type { Language } from '@/shared/languages';
import type { LearningRoadmapResolvedFrom } from '../../types/learningPath.types';
import { formatResultDateTime } from '../../utils/practiceSessionResultFormat';

interface RoadmapSourceSectionProps {
  resolvedFrom: LearningRoadmapResolvedFrom;
  language: Language;
  t: (key: string) => string;
}

/** Nguồn dữ liệu đã dựng nên lộ trình: các buổi luyện được gom làm mốc khởi điểm. */
export function RoadmapSourceSection({ resolvedFrom, language, t }: RoadmapSourceSectionProps) {
  return (
    <section
      className="mt-5 rounded-2xl border border-satin bg-surface-raised/70 p-5"
      aria-labelledby="roadmap-source-title"
    >
      <h2 id="roadmap-source-title" className="text-base font-semibold text-foreground">
        {t('practice.learningPath.sourceTitle')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('practice.learningPath.sourceSessions').replace('{count}', String(resolvedFrom.sessions.length))}
      </p>
      {resolvedFrom.sessions.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {resolvedFrom.sessions.map((session) => (
            <li
              key={session.id}
              data-testid="roadmap-source-session"
              className="rounded-xl border border-satin/70 bg-surface-overlay/60 px-3 py-2 text-sm text-foreground"
            >
              <p className="font-medium">
                {formatResultDateTime(session.date, language) ?? t('practice.learningPath.sourceSessionDateUnavailable')}
              </p>
              {/* Ngày đứng một mình không nói được buổi nào — kèm tên bài + điểm để người học nhận ra. */}
              <p className="mt-0.5 text-caption text-muted-foreground">
                {session.lessonTitle ?? t('practice.learningPath.sourceSessionFree')}
                {session.score != null
                  ? ` · ${t('practice.learningPath.sourceSessionScore').replace('{score}', String(session.score))}`
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {!resolvedFrom.baselineAvailable ? (
        <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          {t('practice.learningPath.sourceGenericWarning')}
        </p>
      ) : null}
    </section>
  );
}
