import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { LeaderboardEntry } from '../../types/learning.types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { t } = useLanguage();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('practice.leaderboard.rank')}</TableHead>
          <TableHead>{t('practice.leaderboard.candidate')}</TableHead>
          <TableHead>{t('practice.leaderboard.score')}</TableHead>
          <TableHead>{t('practice.leaderboard.sessions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow
            key={entry.rank}
            data-state={entry.isCurrentUser ? 'selected' : undefined}
          >
            <TableCell className="font-semibold text-foreground">#{entry.rank}</TableCell>
            <TableCell className="text-foreground">
              {entry.candidateName}
              {entry.isCurrentUser ? (
                <span className="ml-2 rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">
                  {t('practice.leaderboard.you')}
                </span>
              ) : null}
            </TableCell>
            <TableCell className="font-semibold text-foreground">{entry.score}</TableCell>
            <TableCell>{entry.sessions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
