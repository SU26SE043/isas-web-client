import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, RotateCcw, Send, Video, VideoOff } from 'lucide-react';
import { useLanguage } from '../../../shared/languages';
import { cn } from '@/lib/utils';

interface InterviewControlsProps {
  sessionId: string;
  isSubmitting: boolean;
  isPaused: boolean;
  isLocked: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  /** When true (B2B exam), hide the camera toggle — camera stays on. */
  cameraAlwaysOn?: boolean;
  isRecording: boolean;
  onSubmit: () => void;
  onTogglePause: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleRecording: () => void;
  onSpeakAgain: () => void;
  speakAgainDisabled?: boolean;
  learningMode?: boolean;
  isLastQuestion?: boolean;
  isEvaluating?: boolean;
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
  isSubmitting,
  isPaused,
  isLocked,
  micEnabled,
  cameraEnabled,
  cameraAlwaysOn = false,
  onSubmit,
  onToggleMic,
  onToggleCamera,
  onSpeakAgain,
  speakAgainDisabled = false,
  learningMode = false,
  isLastQuestion: _isLastQuestion = false,
  isEvaluating = false,
  exitHref,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const finishHref = exitHref ?? `/interview/${sessionId}/complete`;
  const busy = isSubmitting || isEvaluating || isPaused || isLocked;
  const replayDisabled = busy || speakAgainDisabled;

  const handlePrimary = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const primaryLabel = (() => {
    if (isEvaluating || isSubmitting) {
      return learningMode
        ? t('practice.learningPath.evaluating')
        : t('practice.room.submitting');
    }
    // Learning: always submit answer; finish CTA lives on the question report page.
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
      if ((event.key === 'r' || event.key === 'R') && !replayDisabled) {
        event.preventDefault();
        onSpeakAgain();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, finishHref, handlePrimary, learningMode, navigate, onSpeakAgain, replayDisabled]);

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

          {!cameraAlwaysOn ? (
            <ControlIconButton
              label={t('practice.flow.controls.camera')}
              pressed={cameraEnabled}
              disabled={isLocked}
              onClick={onToggleCamera}
            >
              {cameraEnabled ? (
                <Video className="size-5" aria-hidden />
              ) : (
                <VideoOff className="size-5" aria-hidden />
              )}
            </ControlIconButton>
          ) : null}
        </div>

        <button
          type="button"
          className={cn(
            'group inline-flex min-w-[10.5rem] items-center gap-3 rounded-full border border-satin bg-surface-overlay/70 py-2 pl-2 pr-5 text-left shadow-[var(--satin-inset)] transition',
            'hover:border-white/25 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          disabled={replayDisabled}
          onClick={onSpeakAgain}
          aria-label={t('practice.room.speakAgain')}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition group-hover:scale-[1.03] group-active:scale-95">
            <RotateCcw className="size-4 transition group-hover:-rotate-45" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium tracking-tight text-foreground">
              {t('practice.room.speakAgain')}
            </span>
            <span className="text-[11px] text-muted-foreground">{t('practice.room.replayHint')}</span>
          </span>
          <kbd className="ml-auto hidden rounded border border-satin bg-surface-base/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            R
          </kbd>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
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
              className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-transparent px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/10"
              onClick={() => navigate(finishHref)}
            >
              {t('practice.room.end')}
              <kbd className="hidden rounded border border-red-500/30 px-1.5 py-0.5 text-[10px] text-red-300/80 sm:inline">
                Esc
              </kbd>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
