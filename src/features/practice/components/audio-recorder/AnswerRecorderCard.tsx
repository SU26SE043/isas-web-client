import { AudioWaveform, ChevronRight, Mic } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { AnswerCardStatus } from '../../types/audioRecorder.types';

const statusKey: Record<AnswerCardStatus, string> = {
  unanswered: 'practice.audioRecorder.cardStatus.unanswered',
  recording: 'practice.audioRecorder.cardStatus.recording',
  recorded: 'practice.audioRecorder.cardStatus.recorded',
  submitting: 'practice.audioRecorder.cardStatus.submitting',
  submitted: 'practice.audioRecorder.cardStatus.submitted',
  error: 'practice.audioRecorder.cardStatus.error',
};

const statusClass: Record<AnswerCardStatus, string> = {
  unanswered: 'border-satin bg-surface-overlay text-muted-foreground',
  recording: 'border-warning/40 bg-warning/10 text-warning',
  recorded: 'border-info/40 bg-info/10 text-info',
  submitting: 'border-satin bg-surface-overlay text-muted-foreground',
  submitted: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
};

interface AnswerRecorderCardProps {
  status: AnswerCardStatus;
  disabled?: boolean;
  onOpenRecorder: () => void;
}

export function AnswerRecorderCard({
  status,
  disabled,
  onOpenRecorder,
}: AnswerRecorderCardProps) {
  const { t } = useLanguage();
  const alreadySubmitted = status === 'submitted';

  return (
    <section className="frame-satin relative flex h-full min-h-[12rem] flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-info/60 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(124,58,237,0.16),transparent_42%)] bg-surface-raised p-5 shadow-[0_20px_60px_-34px_rgba(99,102,241,0.8)] sm:p-6">
      <div className="relative flex min-w-0 flex-col gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-full border border-info/60 bg-gradient-to-br from-info/25 to-violet-500/25 text-info-light shadow-[0_0_24px_-8px_var(--color-info)]">
          <Mic className="size-7" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t('practice.audioRecorder.cardTitle')}
            </h3>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium',
                statusClass[status],
              )}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {t(statusKey[status])}
            </span>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <AudioWaveform className="size-4 shrink-0 text-info" aria-hidden />
            {alreadySubmitted
              ? t('practice.audioRecorder.cardSubmittedHint')
              : t('practice.audioRecorder.cardDescription')}
          </p>
        </div>
      </div>
      <div className="relative">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-violet-400/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-4 text-base font-semibold text-white shadow-[0_0_28px_-8px_rgba(124,58,237,0.95)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || status === 'submitting'}
          onClick={onOpenRecorder}
        >
          <AudioWaveform className="size-5" aria-hidden />
          {alreadySubmitted
            ? t('practice.audioRecorder.openAgain')
            : t('practice.audioRecorder.open')}
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
