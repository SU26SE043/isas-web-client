import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsSignalCount } from '../types/employerAnalytics.types';
import { flagLabelKey } from '../utils/employerAnalyticsMetrics';
import { AnalyticsCard } from './AnalyticsCard';

export function EmployerAnalyticsFlagsTable({ flags }: { flags: EmployerAnalyticsSignalCount[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <AnalyticsCard title={t('employerAnalytics.flags.title')} description={t('employerAnalytics.flags.description')}>
      {flags.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.flags.empty')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerAnalytics.flags.signal')}</TableHead>
              <TableHead className="text-right">{t('employerAnalytics.flags.count')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => {
              const key = flagLabelKey(flag.signalType);
              return (
                <TableRow key={flag.signalType}>
                  <TableCell>
                    <p className="font-medium text-foreground">{key ? t(key) : flag.signalType}</p>
                    {key ? <p className="text-xs text-muted-foreground">{flag.signalType}</p> : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">{flag.count.toLocaleString(locale)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </AnalyticsCard>
  );
}
