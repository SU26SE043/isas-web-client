import { useLanguage } from '@/shared/languages';
import type { LeaderboardEntry } from '../../types/learning.types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <table className="min-w-full text-sm">
        <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t('practice.leaderboard.rank')}</th>
            <th className="px-4 py-3">{t('practice.leaderboard.candidate')}</th>
            <th className="px-4 py-3">{t('practice.leaderboard.score')}</th>
            <th className="px-4 py-3">{t('practice.leaderboard.sessions')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              className={[
                'border-b border-subtle last:border-b-0',
                entry.isCurrentUser ? 'bg-surface-overlay' : '',
              ].join(' ')}
            >
              <td className="px-4 py-3 font-semibold text-foreground">#{entry.rank}</td>
              <td className="px-4 py-3 text-foreground">
                {entry.candidateName}
                {entry.isCurrentUser ? (
                  <span className="ml-2 rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">
                    {t('practice.leaderboard.you')}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground">{entry.score}</td>
              <td className="px-4 py-3 text-muted-foreground">{entry.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
