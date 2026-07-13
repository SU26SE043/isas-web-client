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
  isLocked: boolean;
  micEnabled: boolean;
  isRecording: boolean;
  chunksUploaded: number;
  onSubmit: () => void;
  onTogglePause: () => void;
  onToggleMic: () => void;
  onToggleRecording: () => void;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  sessionId,
  remainingSeconds,
  isSubmitting,
  isPaused,
  isLocked,
  micEnabled,
  isRecording,
  chunksUploaded,
  onSubmit,
  onTogglePause,
  onToggleMic,
  onToggleRecording,
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
              isRecording ? 'bg-error/20 text-red-400' : 'bg-surface-overlay text-foreground hover:bg-surface-elevated'
            }`}
            aria-label={isRecording ? t('practice.stopRecording') : t('practice.startRecording')}
            aria-pressed={isRecording}
            onClick={onToggleRecording}
          >
            <span className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500' : 'border-2 border-current'}`} />
          </button>
          <button type="button" className="btn-secondary px-3 py-2 text-sm" disabled={isLocked} onClick={onTogglePause}>
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
            <span className="mt-1 text-[10px] text-muted-foreground">
              {t('practice.room.chunksUploaded').replace('{count}', String(chunksUploaded))}
            </span>
          </div>

          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            disabled={isSubmitting || isPaused || isLocked}
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
