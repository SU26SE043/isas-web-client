import { AudioWaveform, Mic } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { useAudioRecorderController } from '../../hooks/useAudioRecorderController';
import type { AudioRecorderStatus } from '../../types/audioRecorder.types';
import { AudioRecorderBody } from './AudioRecorderBody';

interface AnswerRecorderCardProps {
  sessionId: string;
  questionId: string;
  maxDurationSeconds: number;
  sharedStream?: MediaStream | null;
  disabled?: boolean;
  paused?: boolean;
  autoSubmitRequestId?: number;
  resetRequestId?: number;
  onSubmitRecording: (file: File, durationSec: number) => Promise<void>;
  onAutoSubmitRecording?: (file: File, durationSec: number) => Promise<void>;
  onAutoSubmitEmpty?: () => Promise<boolean | void>;
  onAutoSubmitEmptyResult?: (result: { submitted: boolean; error?: unknown }) => void;
  mapSubmitErrorKey?: (error: unknown) => string;
  onStatusChange?: (status: AudioRecorderStatus) => void;
}

const statusKey: Record<AudioRecorderStatus, string> = {
  idle: 'practice.audioRecorder.cardStatus.unanswered',
  'requesting-permission': 'practice.audioRecorder.cardStatus.submitting',
  recording: 'practice.audioRecorder.cardStatus.recording',
  recorded: 'practice.audioRecorder.cardStatus.recorded',
  submitting: 'practice.audioRecorder.cardStatus.submitting',
  success: 'practice.audioRecorder.cardStatus.submitted',
  error: 'practice.audioRecorder.cardStatus.error',
};

const statusClass: Record<AudioRecorderStatus, string> = {
  idle: 'border-satin bg-surface-overlay text-muted-foreground',
  'requesting-permission': 'border-info/40 bg-info/10 text-info',
  recording: 'border-warning/40 bg-warning/10 text-warning',
  recorded: 'border-info/40 bg-info/10 text-info',
  submitting: 'border-satin bg-surface-overlay text-muted-foreground',
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
};

export function AnswerRecorderCard({
  sessionId,
  questionId,
  maxDurationSeconds,
  sharedStream = null,
  disabled,
  paused = false,
  autoSubmitRequestId = 0,
  resetRequestId = 0,
  onSubmitRecording,
  onAutoSubmitRecording,
  onAutoSubmitEmpty,
  onAutoSubmitEmptyResult,
  mapSubmitErrorKey,
  onStatusChange,
}: AnswerRecorderCardProps) {
  const { t } = useLanguage();
  const recorder = useAudioRecorderController({
    sessionId,
    questionId,
    maxDurationSeconds,
    sharedStream,
    paused,
    autoSubmitRequestId,
    resetRequestId,
    onSubmitRecording,
    onAutoSubmitRecording,
    onAutoSubmitEmpty,
    onAutoSubmitEmptyResult,
    mapSubmitErrorKey,
    onStatusChange,
  });
  const status = recorder.state.status;

  return (
    <section className="frame-satin flex h-full min-h-[20rem] flex-col gap-4 overflow-hidden rounded-2xl border border-info/60 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(124,58,237,0.16),transparent_42%)] bg-surface-raised p-4 shadow-none sm:p-5">
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-full border border-info/60 bg-gradient-to-br from-info/25 to-info-500/25 text-info-light shadow-[0_0_24px_-8px_var(--color-info)]">
          <Mic className={cn('size-6', status === 'recording' && 'text-warning')} aria-hidden />
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            statusClass[status],
          )}
          aria-live="polite"
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {t(statusKey[status])}
        </span>
      </div>

      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.audioRecorder.cardTitle')}</h2>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <AudioWaveform className="size-4 shrink-0 text-info" aria-hidden />
          {t('practice.audioRecorder.cardDescription')}
        </p>
      </div>

      <AudioRecorderBody
        state={recorder.state}
        audioElementRef={recorder.audioElementRef}
        compact
        disabled={disabled || status === 'submitting'}
        onStart={() => void recorder.startRecording()}
        onStop={recorder.stopRecording}
        onRetake={recorder.resetRecording}
        onReplay={() => void recorder.replayAudio()}
        onSubmit={() => void recorder.submitOnce()}
        onRetrySubmit={recorder.retrySubmit}
        onContinueSuccess={recorder.resetRecording}
        onCloseError={recorder.resetRecording}
      />
    </section>
  );
}
