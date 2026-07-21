import { Mic, MicOff, RotateCcw, Send, Square, Video, VideoOff } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface B2cInterviewControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  recordingStatus: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplay: () => void;
  replayDisabled: boolean;
  replaying: boolean;
  onSubmit: () => void;
  submitDisabled: boolean;
  submitLabel: string;
  onFinish: () => void;
  finishLabel: string;
  finishPrimary?: boolean;
  disabled?: boolean;
}

export function B2cInterviewControls({
  micEnabled,
  cameraEnabled,
  onToggleMic,
  onToggleCamera,
  recordingStatus,
  onStartRecording,
  onStopRecording,
  onReplay,
  replayDisabled,
  replaying,
  onSubmit,
  submitDisabled,
  submitLabel,
  onFinish,
  finishLabel,
  finishPrimary,
  disabled,
}: B2cInterviewControlsProps) {
  const { t } = useLanguage();
  const isRecording = recordingStatus === 'recording';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-satin bg-surface-raised/95 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary rounded-full px-3 py-2"
            aria-pressed={micEnabled}
            aria-label={t('practice.flow.controls.mic')}
            disabled={disabled}
            onClick={onToggleMic}
          >
            {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          </button>
          <button
            type="button"
            className="btn-secondary rounded-full px-3 py-2"
            aria-pressed={cameraEnabled}
            aria-label={t('practice.flow.controls.camera')}
            disabled={disabled}
            onClick={onToggleCamera}
          >
            {cameraEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"
            disabled={replayDisabled || disabled}
            onClick={onReplay}
          >
            <RotateCcw className="size-4" aria-hidden />
            {replaying ? t('practice.speech.replaying') : t('practice.speech.replay')}
          </button>
          {isRecording ? (
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"
              disabled={disabled}
              onClick={onStopRecording}
            >
              <Square className="size-4" aria-hidden />
              {t('practice.recording.stop')}
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"
              disabled={disabled}
              onClick={onStartRecording}
            >
              <Mic className="size-4" aria-hidden />
              {recordingStatus === 'stopped' || recordingStatus === 'submitted'
                ? t('practice.recording.retry')
                : t('practice.recording.start')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm',
              finishPrimary ? 'btn-secondary' : 'btn-primary',
            )}
            disabled={submitDisabled || disabled}
            onClick={onSubmit}
          >
            <Send className="size-4" aria-hidden />
            {submitLabel}
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10',
              finishPrimary && 'btn-primary border-transparent text-black',
            )}
            disabled={disabled}
            onClick={onFinish}
          >
            {finishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
