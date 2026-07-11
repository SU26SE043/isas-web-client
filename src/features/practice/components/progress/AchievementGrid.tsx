import { Award } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { Achievement } from '../../types/learning.types';

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {achievements.map((achievement) => {
        const title = language === 'vi' ? achievement.titleVi : achievement.title;
        const description = language === 'vi' ? achievement.descriptionVi : achievement.description;

        return (
          <article
            key={achievement.id}
            className={[
              'rounded-xl border p-5',
              achievement.earned
                ? 'border-subtle bg-surface-raised'
                : 'border-subtle bg-surface-base opacity-70',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  'rounded-lg p-2',
                  achievement.earned ? 'bg-surface-overlay text-foreground' : 'bg-surface-overlay text-muted-foreground',
                ].join(' ')}
              >
                <Award className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h3 className="heading-secondary text-base text-foreground">{title}</h3>
                <p className="body-text mt-1 text-sm text-muted-foreground">{description}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {achievement.earned && achievement.earnedAt
                    ? t('practice.achievements.earnedAt').replace(
                        '{date}',
                        new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                          new Date(achievement.earnedAt),
                        ),
                      )
                    : t('practice.achievements.locked')}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
