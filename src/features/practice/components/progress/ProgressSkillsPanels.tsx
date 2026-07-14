import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type {
  ProgressSkillItem,
  ProgressStrengthItem,
  ProgressTrendDirection,
  ProgressWeaknessItem,
} from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

function trendLabel(t: (key: string) => string, trend: ProgressTrendDirection) {
  return t(`practice.progress.trend.${trend}`);
}

export function ProgressSkillBreakdown({ skills }: { skills: ProgressSkillItem[] }) {
  const { t, language } = useLanguage();

  return (
    <ProgressSection
      title={t('practice.progress.sections.skills')}
      description={t('practice.progress.sections.skillsDesc')}
    >
      <ul className="space-y-3">
        {skills.map((skill) => (
          <li key={skill.id} className="rounded-lg bg-surface-overlay px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-foreground">{language === 'vi' ? skill.nameVi : skill.name}</p>
              <p className="text-sm tabular-nums text-muted-foreground">
                {skill.currentScore} · {skill.improvementPercent >= 0 ? '+' : ''}
                {skill.improvementPercent}% · {trendLabel(t, skill.trend)}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === 'vi' ? skill.aiAssessmentVi : skill.aiAssessment}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressStrengths({ items }: { items: ProgressStrengthItem[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.strengths')}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-subtle bg-surface-overlay px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{language === 'vi' ? item.nameVi : item.name}</p>
            <p className="mt-1 text-muted-foreground">
              {t('practice.progress.strength.score')}: {item.score} · {t('practice.progress.strength.stability')}:{' '}
              {item.stability}% · {t('practice.progress.strength.frequency')}: {item.frequency}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressWeaknesses({ items }: { items: ProgressWeaknessItem[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.weaknesses')}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-overlay px-4 py-3"
          >
            <div>
              <p className="font-medium text-foreground">{language === 'vi' ? item.nameVi : item.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('practice.progress.strength.score')}: {item.score}
              </p>
            </div>
            <Link to={item.practiceHref} className="btn-primary inline-flex text-xs">
              {t('practice.progress.cta.practiceNow')}
            </Link>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}
