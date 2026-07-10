import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const LiveConversationArea: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 relative bg-surface-raised p-6">
      <div className="flex items-center justify-end mb-2">
        <span className="text-xs bg-surface-overlay/30 text-white px-2 py-1 rounded-md">{t('practice.autoScroll')}</span>
      </div>
      
      {/* Messages */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[160px] custom-scrollbar custom-scrollbar-light">
        {/* AI Message */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center flex-shrink-0 text-foreground text-xs font-bold shadow-sm">
              AI
            </div>
            <div className="bg-surface-raised text-foreground px-4 py-2.5 rounded-xl rounded-tl-sm text-sm max-w-[80%] font-medium shadow-sm">
              {t('practice.aiSampleMsg')}
            </div>
          </div>
          <span className="text-[10px] text-white/60 ml-11">{t('practice.aiName')} • 10:02 AM</span>
        </div>

        {/* User Message */}
        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center flex-shrink-0 text-foreground text-xs font-bold shadow-sm">
              {t('practice.you')}
            </div>
            <div className="bg-surface-raised text-foreground px-4 py-2.5 rounded-xl rounded-tr-sm text-sm max-w-[80%] font-medium shadow-sm">
              {t('practice.userSampleMsg')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
