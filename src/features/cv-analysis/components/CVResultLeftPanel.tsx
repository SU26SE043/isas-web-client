import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const CVResultLeftPanel: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">

      {/* Profile & Competency Radar Chart */}
      <div className="bg-surface-raised rounded-xl p-6 md:p-8 border border-subtle shadow-sm flex flex-col h-auto lg:h-[500px]">

        {/* Header Info inside Radar Card */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-subtle">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">Nguyen Van A</h2>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Senior Frontend Developer</p>
            <div className="inline-flex items-center px-2.5 py-1 bg-surface-overlay text-white text-[10px] font-bold rounded-full shadow-sm">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              {t('result.goodFit')}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-foreground mb-6">{t('result.profile')}</h3>
        <div className="flex-grow flex items-center justify-center relative w-full max-w-[280px] mx-auto">
          {/* Simplified SVG Radar Chart Mockup */}
          <svg viewBox="-20 -10 140 120" className="w-full h-auto drop-shadow-md overflow-visible">
            <defs>
              <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#111827" />
                <stop offset="100%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            {/* Pentagram Background Grid */}
            <polygon points="50,5 95,38 78,90 22,90 5,38" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <polygon points="50,20 80,42 68,76 32,76 20,42" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <polygon points="50,35 65,46 59,62 41,62 35,46" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            {/* Grid Lines */}
            <line x1="50" y1="50" x2="50" y2="5" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="50" y1="50" x2="95" y2="38" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="50" y1="50" x2="78" y2="90" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="50" y1="50" x2="22" y2="90" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="50" y1="50" x2="5" y2="38" stroke="#e2e8f0" strokeWidth="1" />

            {/* Data Polygon */}
            <polygon
              points="50,15 85,38 72,80 25,75 18,30"
              fill="none"
              stroke="url(#brandGradient)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Data Points */}
            <circle cx="50" cy="15" r="3.5" fill="#111827" />
            <circle cx="85" cy="38" r="3.5" fill="#9CA3AF" />
            <circle cx="72" cy="80" r="3.5" fill="#111827" />
            <circle cx="25" cy="75" r="3.5" fill="#9CA3AF" />
            <circle cx="18" cy="30" r="3.5" fill="#111827" />
          </svg>
          {/* Labels */}
          <span className="absolute top-[-10px] text-[10px] font-bold text-muted-foreground tracking-wider">SKILLS</span>
          <span className="absolute right-[-10px] top-[30%] text-[10px] font-bold text-muted-foreground tracking-wider">EXPERIENCE</span>
          <span className="absolute bottom-[-10px] right-[10%] text-[10px] font-bold text-muted-foreground tracking-wider">EDUCATION</span>
          <span className="absolute bottom-[-10px] left-[10%] text-[10px] font-bold text-muted-foreground tracking-wider">PROJECTS</span>
          <span className="absolute left-[-15px] top-[30%] text-[10px] font-bold text-muted-foreground tracking-wider">SOFT SKILLS</span>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <h3 className="text-xl font-extrabold text-foreground mb-5 flex items-center">
          <svg className="w-6 h-6 mr-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {t('result.skills')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-1.5 bg-surface-overlay text-white text-sm font-bold rounded-full shadow-sm">React.js</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-white text-sm font-bold rounded-full shadow-sm">TypeScript</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-white text-sm font-bold rounded-full shadow-sm">Tailwind CSS</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-muted-foreground text-sm font-bold rounded-full border border-subtle">Node.js</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-muted-foreground text-sm font-bold rounded-full">GraphQL</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-muted-foreground text-sm font-bold rounded-full">System Design</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-muted-foreground text-sm font-bold rounded-full">Agile</span>
          <span className="px-4 py-1.5 bg-surface-overlay text-muted-foreground text-sm font-bold rounded-full">Unit Testing</span>
        </div>
      </div>

      {/* Key Projects */}
      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <h3 className="text-xl font-extrabold text-foreground mb-5 flex items-center">
          <svg className="w-6 h-6 mr-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {t('result.projects')}
        </h3>
        <div className="space-y-6">
          <div className="relative pl-4 border-l-4 border-subtle">
            <h4 className="font-bold text-foreground mb-1">E-commerce Micro-frontend</h4>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              Led the migration of a monolithic frontend to a suite of independent micro-apps.
            </p>
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Next.js / Module Federation / AWS</p>
          </div>
          <div className="relative pl-4 border-l-4 border-default">
            <h4 className="font-bold text-foreground mb-1">Internal Dashboard System</h4>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              Developed high-performance data visualization tools for real-time analytics.
            </p>
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">D3.js / React / Redux Toolkit</p>
          </div>
        </div>
      </div>

    </div>
  );
};
