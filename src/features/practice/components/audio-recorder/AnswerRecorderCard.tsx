import { Mic } from 'lucide-react';
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
    <section className="frame-satin rounded-2xl border border-satin bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="frame-satin-soft flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-overlay text-foreground">
            <Mic className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {t('practice.audioRecorder.cardTitle')}
              </h3>
              <span
                className={cn(
                  'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  statusClass[status],
                )}
              >
                {t(statusKey[status])}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {alreadySubmitted
                ? t('practice.audioRecorder.cardSubmittedHint')
                : t('practice.audioRecorder.cardDescription')}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary shrink-0 self-start sm:self-center"
          disabled={disabled || status === 'submitting'}
          onClick={onOpenRecorder}
        >
          {alreadySubmitted
            ? t('practice.audioRecorder.openAgain')
            : t('practice.audioRecorder.open')}
        </button>
      </div>
    </section>
  );
}
