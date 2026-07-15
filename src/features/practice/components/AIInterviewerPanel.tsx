import React from 'react';
import { useLanguage } from '../../../shared/languages';
import type { AiInterviewerState } from '../types/interviewSession.types';

interface AIInterviewerPanelProps {
  aiState: AiInterviewerState;
}

export const AIInterviewerPanel: React.FC<AIInterviewerPanelProps> = ({ aiState }) => {
  const { t } = useLanguage();

  const getStateConfig = () => {
    switch (aiState) {
      case 'speaking':
        return { label: t('practice.aiState.speaking'), color: 'bg-success', animation: 'animate-pulse' };
      case 'thinking':
        return { label: t('practice.aiState.thinking'), color: 'bg-white/70', animation: 'animate-ping' };
      case 'listening':
        return { label: t('practice.aiState.listening'), color: 'bg-info', animation: '' };
    }
  };

  const config = getStateConfig();

  return (
    <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-satin bg-surface-raised shadow-[var(--satin-inset)]">
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-surface-base">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200&h=800"
          alt={t('practice.aiPanelTitle')}
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: aiState === 'thinking' ? 0.8 : 1 }}
        />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-satin bg-black/55 px-3 py-1.5 backdrop-blur-md">
          <div className={`size-2 rounded-full ${config.color} ${config.animation}`} />
          <span className="text-xs font-semibold tracking-wide text-white">{config.label}</span>
          {aiState === 'speaking' ? (
            <div className="ml-1 flex h-3 items-center gap-0.5" aria-hidden>
              <div className="h-1.5 w-0.5 animate-[bounce_1s_infinite] rounded-full bg-white/80" />
              <div className="h-3 w-0.5 animate-[bounce_1s_infinite_0.2s] rounded-full bg-white/80" />
              <div className="h-2 w-0.5 animate-[bounce_1s_infinite_0.4s] rounded-full bg-white/80" />
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-4 left-4 z-10">
          <div className="rounded-lg border border-satin bg-black/45 px-4 py-2 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">
              {t('practice.aiName')} — {t('practice.aiInterviewerLabel')}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
      </div>
    </div>
  );
};
