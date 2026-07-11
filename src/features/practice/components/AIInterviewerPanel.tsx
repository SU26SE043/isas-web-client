import React from 'react';
import { LiveConversationArea } from './LiveConversationArea';
import { useLanguage } from '../../../shared/languages';
import type { AiInterviewerState, ConversationMessage } from '../types/interviewSession.types';

interface AIInterviewerPanelProps {
  aiState: AiInterviewerState;
  messages: ConversationMessage[];
  isGenerating?: boolean;
}

export const AIInterviewerPanel: React.FC<AIInterviewerPanelProps> = ({
  aiState,
  messages,
  isGenerating = false,
}) => {
  const { t } = useLanguage();

  const getStateConfig = () => {
    switch (aiState) {
      case 'speaking':
        return { label: t('practice.aiState.speaking'), color: 'bg-success', animation: 'animate-pulse' };
      case 'thinking':
        return { label: t('practice.aiState.thinking'), color: 'bg-surface-overlay', animation: 'animate-ping' };
      case 'listening':
        return { label: t('practice.aiState.listening'), color: 'bg-info', animation: '' };
    }
  };

  const config = getStateConfig();

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-subtle bg-surface-raised shadow-sm">
      <div className="relative w-full flex-1 overflow-hidden bg-surface-base">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200&h=800"
          alt={t('practice.aiPanelTitle')}
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: aiState === 'thinking' ? 0.8 : 1 }}
        />

        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-subtle bg-black/50 px-3 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex h-3 w-3 items-center justify-center">
            <div className={`h-2 w-2 rounded-full ${config.color} ${config.animation}`} />
          </div>
          <span className="text-xs font-semibold tracking-wide text-white">{config.label}</span>
          {aiState === 'speaking' ? (
            <div className="ml-1 flex h-3 items-center gap-0.5">
              <div className="h-1.5 w-0.5 animate-[bounce_1s_infinite] rounded-full bg-surface-raised/80" />
              <div className="h-3 w-0.5 animate-[bounce_1s_infinite_0.2s] rounded-full bg-surface-raised/80" />
              <div className="h-2 w-0.5 animate-[bounce_1s_infinite_0.4s] rounded-full bg-surface-raised/80" />
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-4 left-4 z-10">
          <div className="rounded-lg border border-default bg-black/40 px-4 py-2 shadow-md backdrop-blur-md">
            <h2 className="text-sm font-bold text-white">{t('practice.aiName')}</h2>
            <p className="text-xs font-medium text-white/80">{t('practice.aiRole')}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <LiveConversationArea messages={messages} isGenerating={isGenerating} />
    </div>
  );
};
