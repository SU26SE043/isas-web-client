import type { Language } from '@/shared/languages';
import type { LearningRoadmapResolvedFrom } from '../../types/learningPath.types';

interface RoadmapSourceSectionProps {
  resolvedFrom: LearningRoadmapResolvedFrom;
  language: Language;
  t: (key: string) => string;
}

/** Nguồn dữ liệu đã dựng nên lộ trình: các buổi luyện được gom làm mốc khởi điểm. */
export function RoadmapSourceSection({ resolvedFrom, language, t }: RoadmapSourceSectionProps) {
  const formatSessionDate = (date: string | null) => {
    if (!date) return t('practice.learningPath.sourceSessionDateUnavailable');
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(parsed);
  };

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
              className="rounded-xl border border-satin/70 bg-surface-overlay/60 px-3 py-2 text-sm text-foreground"
            >
              {formatSessionDate(session.date)}
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
