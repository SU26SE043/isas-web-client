import React from 'react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_DOMAINS } from '../../mocks/practiceSetup.fixtures';
import type { LearningDashboardQuery, LearningPathStatus } from '../../types/learningPath.types';
import { Input } from '@/components/ui/input';

interface LearningDashboardToolbarProps {
  query: LearningDashboardQuery;
  onChange: (next: LearningDashboardQuery) => void;
}

export const LearningDashboardToolbar: React.FC<LearningDashboardToolbarProps> = ({
  query,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 rounded-xl border border-subtle bg-surface-raised/60 p-4 backdrop-blur-sm md:grid-cols-4">
      <Input
        value={query.search ?? ''}
        onChange={(event) => onChange({ ...query, search: event.target.value })}
        placeholder={t('practice.learningPath.searchPlaceholder')}
        aria-label={t('practice.learningPath.search')}
      />
      <select
        className="rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm text-foreground"
        value={query.domainId ?? 'all'}
        onChange={(event) => onChange({ ...query, domainId: event.target.value })}
        aria-label={t('practice.learningPath.filterDomain')}
      >
        <option value="all">{t('practice.learningPath.allDomains')}</option>
        {ROADMAP_DOMAINS.map((domain) => (
          <option key={domain.id} value={domain.id}>
            {domain.name}
          </option>
        ))}
      </select>
      <select
        className="rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm text-foreground"
        value={query.status ?? 'all'}
        onChange={(event) =>
          onChange({ ...query, status: event.target.value as LearningPathStatus | 'all' })
        }
        aria-label={t('practice.learningPath.filterStatus')}
      >
        <option value="all">{t('practice.learningPath.allStatuses')}</option>
        <option value="not_started">{t('practice.learningPath.status.not_started')}</option>
        <option value="in_progress">{t('practice.learningPath.status.in_progress')}</option>
        <option value="completed">{t('practice.learningPath.status.completed')}</option>
      </select>
      <select
        className="rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm text-foreground"
        value={query.sort ?? 'updated'}
        onChange={(event) =>
          onChange({ ...query, sort: event.target.value as 'updated' | 'progress' })
        }
        aria-label={t('practice.learningPath.sort')}
      >
        <option value="updated">{t('practice.learningPath.sortUpdated')}</option>
        <option value="progress">{t('practice.learningPath.sortProgress')}</option>
      </select>
    </div>
  );
};
