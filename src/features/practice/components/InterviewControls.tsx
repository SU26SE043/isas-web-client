import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  Mic,
  MicOff,
  MonitorUp,
  Play,
  Send,
  Settings,
  Video,
} from 'lucide-react';
import { useLanguage } from '../../../shared/languages';
import { cn } from '@/lib/utils';
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
  learningMode?: boolean;
  feedbackVisible?: boolean;
  isLastQuestion?: boolean;
  isEvaluating?: boolean;
  onNextQuestion?: () => void;
  onCompleteSession?: () => void;
  exitHref?: string;
}

function ControlIconButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        pressed && 'text-foreground',
      )}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-full border border-satin bg-surface-overlay/80',
          pressed === false && 'border-red-500/40 bg-red-500/15 text-red-300',
        )}
      >
        {children}
      </span>
      <span className="hidden text-[10px] font-medium sm:block">{label}</span>
    </button>
  );
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  sessionId,
  remainingSeconds,
  isSubmitting,
  isPaused,
  isLocked,
  micEnabled,
  chunksUploaded,
  onSubmit,
  onTogglePause,
  onToggleMic,
  learningMode = false,
  feedbackVisible = false,
  isLastQuestion = false,
  isEvaluating = false,
  onNextQuestion,
  onCompleteSession,
  exitHref,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const timerClass = getTimerColorClass(getTimerSeverity(remainingSeconds));
  const finishHref = exitHref ?? `/interview/${sessionId}/complete`;
  const busy = isSubmitting || isEvaluating || isPaused || isLocked;

  const handlePrimary = useCallback(() => {
    if (learningMode && feedbackVisible) {
      if (isLastQuestion) onCompleteSession?.();
      else onNextQuestion?.();
      return;
    }
    onSubmit();
  }, [
    feedbackVisible,
    isLastQuestion,
    learningMode,
    onCompleteSession,
    onNextQuestion,
    onSubmit,
  ]);

  const primaryLabel = (() => {
    if (learningMode && feedbackVisible) {
      if (isLastQuestion) {
        return isSubmitting
          ? t('practice.learningPath.completing')
          : t('practice.learningPath.completeSession');
      }
      return t('practice.learningPath.nextQuestion');
    }
    if (isEvaluating || isSubmitting) {
      return learningMode
        ? t('practice.learningPath.evaluating')
        : t('practice.room.submitting');
    }
    return t('practice.room.submitAnswer');
  })();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'Enter' && !event.shiftKey && !busy) {
        event.preventDefault();
        handlePrimary();
      }
      if (event.key === 'Escape' && !learningMode) {
        event.preventDefault();
        navigate(finishHref);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, finishHref, handlePrimary, learningMode, navigate]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-satin bg-surface-raised/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <ControlIconButton
            label={t('practice.flow.controls.mic')}
            pressed={micEnabled}
            disabled={isLocked}
            onClick={onToggleMic}
          >
            {micEnabled ? <Mic className="size-5" aria-hidden /> : <MicOff className="size-5" aria-hidden />}
          </ControlIconButton>

          <ControlIconButton label={t('practice.flow.controls.camera')} pressed disabled>
            <Video className="size-5" aria-hidden />
          </ControlIconButton>

          <ControlIconButton label={t('practice.room.screenShare')} disabled>
            <MonitorUp className="size-5" aria-hidden />
          </ControlIconButton>

          <ControlIconButton
            label={isPaused ? t('practice.room.resume') : t('practice.room.settings')}
            pressed={!isPaused}
            disabled={isLocked}
            onClick={onTogglePause}
          >
            {isPaused ? <Play className="size-5" aria-hidden /> : <Settings className="size-5" aria-hidden />}
          </ControlIconButton>
        </div>

        <div className="flex min-w-[7rem] flex-col items-center">
          <span className={cn('text-2xl font-semibold tabular-nums tracking-wider sm:text-3xl', timerClass)}>
            {formatTimerSeconds(remainingSeconds)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('practice.room.answerTime')}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground/80">
            {t('practice.room.chunksUploaded').replace('{count}', String(chunksUploaded))}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            disabled={busy}
            onClick={handlePrimary}
          >
            <Send className="size-4" aria-hidden />
            <span>{primaryLabel}</span>
            <kbd className="hidden rounded border border-black/20 bg-black/10 px-1.5 py-0.5 text-[10px] font-medium text-black/70 sm:inline">
              Enter
            </kbd>
          </button>

          {!learningMode ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-transparent px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
              onClick={() => navigate(finishHref)}
            >
              {t('practice.room.end')}
              <kbd className="hidden rounded border border-red-500/30 px-1.5 py-0.5 text-[10px] text-red-300/80 sm:inline">
                Esc
              </kbd>
            </button>
          ) : null}

          <a
            href="/candidate/help"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t('practice.room.help')}
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-satin bg-surface-overlay/80">
              <CircleHelp className="size-5" aria-hidden />
            </span>
            <span className="hidden text-[10px] font-medium sm:block">{t('practice.room.help')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
