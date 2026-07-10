import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const CVResultHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-surface-raised rounded-xl p-6 lg:p-8 border border-subtle shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center space-x-6 md:space-x-8">
        {/* Match Score Circle */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-surface-base border-[6px] border-subtle ">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-foreground leading-none">78<span className="text-lg text-muted-foreground font-bold">/100</span></div>
            <div className="text-[10px] md:text-xs font-bold text-muted-foreground tracking-wider mt-1 uppercase">{t('result.match')}</div>
          </div>
        </div>
        
        {/* Candidate Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">Nguyen Van A</h1>
          <p className="text-lg text-muted-foreground font-medium mb-3">Senior Frontend Developer</p>
          <div className="inline-flex items-center px-3 py-1 bg-surface-overlay text-white text-xs font-bold rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            {t('result.goodFit')}
          </div>
        </div>
      </div>

      {/* CV Preview Thumbnail Mock */}
      <div className="hidden md:block w-48 h-32 bg-surface-overlay rounded-xl border border-subtle shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://cdn.dribbble.com/users/1204689/screenshots/11267439/media/c0af829f0cebe14d0263f6a8e5793e16.png?resize=400x300&vertical=center')] bg-cover bg-top opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span className="bg-surface-overlay text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">{t('result.viewCv')}</span>
        </div>
      </div>
    </div>
  );
};
