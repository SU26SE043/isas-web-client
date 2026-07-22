import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { JdMatch } from '../../types/cvAnalysis.types';
import { CvMatchScoreRing } from './CvMatchScoreRing';

interface JDMatchCardProps {
  jdMatch: JdMatch;
}

function matchTierLabel(score: number, t: (key: string) => string) {
  if (score >= 80) return t('cv.report.matchGood');
  if (score >= 60) return t('cv.report.matchFair');
  return t('cv.report.matchLow');
}

export const JDMatchCard: React.FC<JDMatchCardProps> = ({ jdMatch }) => {
  const { t } = useLanguage();
  const tier = matchTierLabel(jdMatch.score, t);

  return (
    <section className="frame-satin rounded-3xl bg-[var(--glass-bg)] p-6 backdrop-blur-xl sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('cv.report.jdMatch')}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{t('cv.report.jdMatchDesc')}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr] lg:items-center">
        <div className="flex flex-col items-center gap-2">
          <CvMatchScoreRing score={jdMatch.score} className="size-40 [&_svg]:size-40" />
          <p className="text-sm font-medium text-foreground">
            {t('cv.report.jdMatchScore')}: {jdMatch.score}% · {tier}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('cv.report.matchedSkills')}</h3>
            {jdMatch.matchedSkills.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('cv.report.emptyList')}</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {jdMatch.matchedSkills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-sm text-success"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('cv.report.missingSkills')}</h3>
            {jdMatch.missingSkills.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('cv.report.emptyList')}</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {jdMatch.missingSkills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-error/25 bg-error/10 px-3 py-1.5 text-sm text-error"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
