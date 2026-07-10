import React from 'react';
import { useLanguage } from '../../../shared/languages';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';

interface CVResultRightPanelProps {
  result: CvAnalysisResult;
}

export const CVResultRightPanel: React.FC<CVResultRightPanelProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-surface-raised rounded-xl p-6 md:p-8 border border-subtle shadow-sm relative overflow-hidden">
        <div className="absolute right-[-10%] bottom-[-10%] opacity-5 w-48 h-48">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-foreground mb-4">{t('result.aiInsights')}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">{t('result.aiInsightBody')}</p>

        <div className="bg-surface-base rounded-xl p-5 border border-subtle">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('result.topRecommendation')}</p>
          <p className="text-sm text-foreground font-medium leading-relaxed">{t('result.topRecommendationBody')}</p>
        </div>
      </div>

      <div className="bg-surface-raised rounded-xl p-6 md:p-8 border border-subtle shadow-sm">
        <h3 className="text-xl font-extrabold text-foreground mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t('result.experience')}
        </h3>
        <div className="relative border-l-2 border-subtle ml-3 space-y-8">
          {result.experiences.map((experience) => (
            <div key={`${experience.company}-${experience.period}`} className="relative pl-6">
              <div
                className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-surface-raised ${
                  experience.highlight ? 'bg-surface-overlay' : 'bg-surface-highlight'
                }`}
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                {experience.period}
              </span>
              <h4 className="font-bold text-foreground">{experience.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{experience.company}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <h3 className="text-xl font-extrabold text-foreground mb-5 flex items-center">
          <svg className="w-6 h-6 mr-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          {t('result.education')}
        </h3>
        <div>
          <h4 className="font-bold text-foreground">{result.education.degree}</h4>
          <p className="text-sm text-muted-foreground">{result.education.school}</p>
          <p className="text-xs text-muted-foreground font-bold mt-1">{result.education.period}</p>
        </div>
      </div>
    </div>
  );
};
