import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { ProgressDomainCard } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function ProgressDomainGrid({ domains }: { domains: ProgressDomainCard[] }) {
  const { t, language } = useLanguage();

  return (
    <ProgressSection title={t('practice.progress.sections.domains')} description={t('practice.progress.sections.domainsDesc')}>
      <div className="grid gap-4 lg:grid-cols-2">
        {domains.map((domain) => (
          <article key={domain.id} className="rounded-lg border border-subtle bg-surface-overlay p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'vi' ? domain.nameVi : domain.name}
                </h3>
                <p className="text-caption text-muted-foreground">
                  {language === 'vi' ? domain.currentLevelVi : domain.currentLevel} ·{' '}
                  {t('practice.progress.domain.readiness')}: {domain.interviewReadinessPercent}%
                </p>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{domain.currentScore}</p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                {t('practice.progress.domain.improvement')}: +{domain.improvementPercent}%
              </div>
              <div>
                {t('practice.progress.domain.sessions')}: {domain.practiceSessions}
              </div>
              <div>
                {t('practice.progress.domain.mocks')}: {domain.mockInterviews}
              </div>
              <div>
                {t('practice.progress.domain.roadmap')}: {domain.roadmapProgressPercent}%
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/candidate/learning" className="btn-secondary inline-flex text-xs">
                {t('practice.progress.cta.continueLearning')}
              </Link>
              <Link to="/practice" className="btn-primary inline-flex text-xs">
                {t('practice.progress.cta.continuePractice')}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </ProgressSection>
  );
}
