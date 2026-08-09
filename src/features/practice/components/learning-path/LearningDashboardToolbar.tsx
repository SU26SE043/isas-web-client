import React from 'react';
import { CalendarDays, Clock3, Grid2X2, Search } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_DOMAINS } from '../../mocks/practiceSetup.fixtures';
import type { LearningDashboardQuery, LearningPathStatus } from '../../types/learningPath.types';
import { Input } from '@/components/ui/input';

interface LearningDashboardToolbarProps { query: LearningDashboardQuery; onChange: (next: LearningDashboardQuery) => void; }

export const LearningDashboardToolbar: React.FC<LearningDashboardToolbarProps> = ({ query, onChange }) => {
  const { t } = useLanguage();
  return <div className="grid gap-3 md:grid-cols-4">
    <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="h-11 pl-9" value={query.search ?? ''} onChange={(event) => onChange({ ...query, search: event.target.value })} placeholder={t('practice.learningPath.searchPlaceholder')} aria-label={t('practice.learningPath.search')} /></label>
    <Filter icon={Grid2X2} value={query.domainId ?? 'all'} ariaLabel={t('practice.learningPath.filterDomain')} onChange={(value) => onChange({ ...query, domainId: value })}><option value="all">{t('practice.learningPath.allDomains')}</option>{ROADMAP_DOMAINS.map((domain) => <option key={domain.id} value={domain.id}>{domain.name}</option>)}</Filter>
    <Filter icon={Clock3} value={query.status ?? 'all'} ariaLabel={t('practice.learningPath.filterStatus')} onChange={(value) => onChange({ ...query, status: value as LearningPathStatus | 'all' })}><option value="all">{t('practice.learningPath.allStatuses')}</option><option value="not_started">{t('practice.learningPath.status.not_started')}</option><option value="in_progress">{t('practice.learningPath.status.in_progress')}</option><option value="completed">{t('practice.learningPath.status.completed')}</option></Filter>
    <Filter icon={CalendarDays} value={query.sort ?? 'updated'} ariaLabel={t('practice.learningPath.sort')} onChange={(value) => onChange({ ...query, sort: value as 'updated' | 'progress' })}><option value="updated">{t('practice.learningPath.sortUpdated')}</option><option value="progress">{t('practice.learningPath.sortProgress')}</option></Filter>
  </div>;
};

function Filter({ icon: Icon, value, ariaLabel, onChange, children }: { icon: typeof Grid2X2; value: string; ariaLabel: string; onChange: (value: string) => void; children: React.ReactNode }) { return <label className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><select className="h-11 w-full appearance-none rounded-lg border border-default bg-surface-overlay py-2 pl-9 pr-3 text-sm text-foreground" value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel}>{children}</select></label>; }
