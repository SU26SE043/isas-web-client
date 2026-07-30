import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface B2cPracticeRoomModalsProps {
  finishOpen: boolean;
  isSubmittingSession: boolean;
  submittedCount: number;
  unansweredCount: number;
  hasPendingRecording: boolean;
  onCloseFinish: () => void;
  onConfirmFinish: () => void;
  overwriteConfirmOpen: boolean;
  onCloseOverwrite: () => void;
  onConfirmOverwrite: () => void;
  retryConfirmOpen: boolean;
  onCloseRetry: () => void;
  onConfirmRetry: () => void;
}

export function B2cPracticeRoomModals({
  finishOpen,
  isSubmittingSession,
  submittedCount,
  unansweredCount,
  hasPendingRecording,
  onCloseFinish,
  onConfirmFinish,
  overwriteConfirmOpen,
  onCloseOverwrite,
  onConfirmOverwrite,
  retryConfirmOpen,
  onCloseRetry,
  onConfirmRetry,
}: B2cPracticeRoomModalsProps) {
  const { t } = useLanguage();

  return (
    <>
      {finishOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl border border-satin bg-surface-raised p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('practice.finish.confirmTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('practice.finish.confirmDescription')}</p>
            <ul className="mt-4 space-y-1 text-sm text-foreground">
              <li>{t('practice.finish.submittedCount').replace('{count}', String(submittedCount))}</li>
              <li>{t('practice.finish.unansweredCount').replace('{count}', String(unansweredCount))}</li>
              {hasPendingRecording ? <li>{t('practice.finish.pendingRecording')}</li> : null}
            </ul>
            {isSubmittingSession ? (
              <p className="mt-4 flex items-center gap-2 text-sm" aria-live="polite">
                <Loader2 className="size-4 animate-spin" />
                {t('practice.finish.submitting')}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" disabled={isSubmittingSession} onClick={onCloseFinish}>
                {t('practice.finish.continue')}
              </button>
              <button type="button" className="btn-primary" disabled={isSubmittingSession} onClick={onConfirmFinish}>
                {t('practice.finish.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {overwriteConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl border border-satin bg-surface-raised p-6">
            <p className="text-sm text-foreground">{t('practice.recording.overwriteConfirm')}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onCloseOverwrite}>
                {t('practice.finish.continue')}
              </button>
              <button type="button" className="btn-primary" onClick={onConfirmOverwrite}>
                {t('practice.recording.submit')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {retryConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl border border-satin bg-surface-raised p-6">
            <p className="text-sm text-foreground">{t('practice.recording.retryConfirm')}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onCloseRetry}>
                {t('practice.finish.continue')}
              </button>
              <button type="button" className="btn-primary" onClick={onConfirmRetry}>
                {t('practice.recording.retry')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
