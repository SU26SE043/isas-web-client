import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface B2cInterviewControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  cameraAlwaysOn?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onFinish: () => void;
  onSubmitAnswer?: () => void | Promise<void>;
  finishLabel: string;
  finishPrimary?: boolean;
  disabled?: boolean;
  /** Cho phép bấm "Kết thúc" trước khi đã trả lời hết câu (kèm điều kiện riêng qua `finishDisabled`). */
  allowEarlyFinish?: boolean;
  /** Ghi đè `disabled` riêng cho nút Kết thúc khi `allowEarlyFinish` — mặc định dùng `disabled`. */
  finishDisabled?: boolean;
}

export function B2cInterviewControls({
  micEnabled,
  cameraEnabled,
  cameraAlwaysOn = false,
  onToggleMic,
  onToggleCamera,
  onFinish,
  onSubmitAnswer,
  finishLabel,
  finishPrimary,
  disabled,
  allowEarlyFinish = false,
  finishDisabled,
}: B2cInterviewControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-satin bg-surface-raised/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
            disabled={disabled || cameraAlwaysOn}
            onClick={onToggleCamera}
          >
            {cameraEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
          </button>
        </div>

        {!finishPrimary && onSubmitAnswer ? <button
          type="button"
          className="btn-primary rounded-full px-4 py-2.5 text-sm font-medium"
          disabled={disabled}
          onClick={onSubmitAnswer}
        >
          {t('practice.room.submitAnswer')}
        </button> : null}
        {finishPrimary || allowEarlyFinish ? (
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium',
              finishPrimary
                ? 'btn-primary'
                : 'border border-error-500/40 text-error-300 hover:bg-error-500/10',
            )}
            disabled={finishDisabled ?? disabled}
            onClick={onFinish}
          >
            {finishLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

