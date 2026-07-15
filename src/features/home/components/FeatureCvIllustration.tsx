import { useLanguage } from '@/shared/languages';

export function FeatureCvIllustration() {
  const { t } = useLanguage();

  return (
    <div className="bg-surface-overlay/50 backdrop-blur-sm rounded-xl p-8 mb-8 relative overflow-hidden flex justify-center items-center min-h-[360px]">
      <style>{`
        @keyframes scan {
          0% { top: 5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }
      `}</style>

      <div className="absolute top-0 right-0 w-48 h-48 bg-surface-overlay rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-surface-raised rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

      <div className="w-64 md:w-72 bg-surface-raised rounded-lg shadow-md p-6 md:p-8 relative border border-subtle transform group-hover:-translate-y-3 transition-transform duration-700 z-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-surface-overlay/40 border-2 border-default flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="space-y-3 flex-grow">
            <div className="w-3/4 h-3.5 bg-surface-highlight rounded-full" />
            <div className="w-1/2 h-2.5 bg-surface-overlay rounded-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="w-1/3 h-3 bg-surface-highlight rounded-full" />
            <div className="w-full h-2 bg-surface-overlay rounded-full" />
            <div className="w-5/6 h-2 bg-surface-overlay rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="w-1/3 h-3 bg-surface-highlight rounded-full" />
            <div className="w-full h-2 bg-surface-overlay rounded-full" />
            <div className="w-4/6 h-2 bg-surface-overlay rounded-full" />
          </div>
        </div>

        <div
          className="absolute left-[-15%] right-[-15%] h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent border-y border-default transform -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none"
          style={{ animation: 'scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate' }}
        >
          <div className="absolute w-full h-[2px] bg-surface-overlay shadow-[0_0_15px_4px_rgba(209,213,219,0.8)]" />
          <div className="absolute right-4 -top-8 bg-surface-overlay/90 backdrop-blur-md text-foreground font-bold text-[10px] font-mono px-3 py-1 rounded border border-default flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-surface-raised rounded-full animate-ping" />
            <span>{t('features.scanning')}</span>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 bg-surface-raised rounded-lg border border-subtle p-4 flex items-center space-x-3 z-30 transform group-hover:scale-110 transition-transform duration-500">
          <div className="w-10 h-10 bg-surface-overlay/40 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{t('features.aiRating')}</div>
            <div className="text-lg font-extrabold text-foreground">95% {t('features.match')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
