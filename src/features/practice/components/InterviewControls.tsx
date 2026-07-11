import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../shared/languages';
import { formatTimerSeconds, getTimerColorClass, getTimerSeverity } from '../utils/questionTimer';

interface InterviewControlsProps {
  sessionId: string;
  remainingSeconds: number;
  isSubmitting: boolean;
  isPaused: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  onSubmit: () => void;
  onTogglePause: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  sessionId,
  remainingSeconds,
  isSubmitting,
  isPaused,
  micEnabled,
  cameraEnabled,
  onSubmit,
  onTogglePause,
  onToggleMic,
  onToggleCamera,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const timerClass = getTimerColorClass(getTimerSeverity(remainingSeconds));

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="flex cursor-grab items-center gap-6 rounded-lg border-6 border-default bg-surface-raised px-6 py-3 shadow-sm active:cursor-grabbing">
        <div className="flex flex-col gap-1 border-r border-default pr-2 opacity-50 transition-opacity hover:opacity-100">
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors ${
              micEnabled ? 'bg-surface-overlay text-foreground hover:bg-surface-elevated' : 'bg-red-500/20 text-red-400'
            }`}
            aria-label={t('practice.flow.controls.mic')}
            aria-pressed={!micEnabled}
            onClick={onToggleMic}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors ${
              cameraEnabled ? 'bg-surface-overlay text-foreground hover:bg-surface-elevated' : 'bg-red-500/20 text-red-400'
            }`}
            aria-label={t('practice.flow.controls.camera')}
            aria-pressed={!cameraEnabled}
            onClick={onToggleCamera}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={onTogglePause}>
            {isPaused ? t('practice.room.resume') : t('practice.room.pause')}
          </button>
        </div>

        <div className="flex items-center gap-4 border-l border-default pl-6">
          <div className="flex flex-col items-center">
            <span className={`text-2xl font-black tabular-nums leading-none tracking-wider ${timerClass}`}>
              {formatTimerSeconds(remainingSeconds)}
            </span>
            <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
              {t('practice.currentQuestionTime')}
            </span>
          </div>

          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            disabled={isSubmitting || isPaused}
            onClick={onSubmit}
          >
            {isSubmitting ? t('practice.room.submitting') : t('practice.room.submitAnswer')}
          </button>

          <button
            type="button"
            className="btn-ghost px-3 py-2 text-sm"
            onClick={() => navigate(`/interview/${sessionId}/complete`)}
          >
            {t('practice.flow.controls.finish')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
