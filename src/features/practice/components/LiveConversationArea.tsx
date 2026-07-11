import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { ConversationMessage } from '../types/interviewSession.types';

interface LiveConversationAreaProps {
  messages: ConversationMessage[];
  isGenerating?: boolean;
}

export const LiveConversationArea: React.FC<LiveConversationAreaProps> = ({
  messages,
  isGenerating = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col gap-4 bg-surface-raised p-6">
      <div className="mb-2 flex items-center justify-end">
        <span className="rounded-md bg-surface-overlay/30 px-2 py-1 text-xs text-white">
          {t('practice.autoScroll')}
        </span>
      </div>

      <div className="custom-scrollbar custom-scrollbar-light flex max-h-[160px] flex-col gap-4 overflow-y-auto pr-2">
        {messages.map((message) => {
          const isAi = message.role === 'ai';
          const content =
            message.role === 'user' && message.content === '__recorded__'
              ? t('practice.room.answerRecorded')
              : message.content;

          return (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${isAi ? '' : 'items-end'}`}
            >
              <div className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-bold text-foreground shadow-sm">
                  {isAi ? 'AI' : t('practice.you')}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-medium text-foreground shadow-sm ${
                    isAi
                      ? 'rounded-tl-sm bg-surface-raised'
                      : 'rounded-tr-sm bg-surface-overlay'
                  }`}
                >
                  {content}
                </div>
              </div>
              {isAi ? (
                <span className="ml-11 text-[10px] text-white/60">
                  {t('practice.aiName')} • {message.timestamp}
                </span>
              ) : null}
            </div>
          );
        })}

        {isGenerating ? (
          <p className="text-sm text-muted-foreground">{t('practice.room.generatingQuestion')}</p>
        ) : null}
      </div>
    </div>
  );
};
