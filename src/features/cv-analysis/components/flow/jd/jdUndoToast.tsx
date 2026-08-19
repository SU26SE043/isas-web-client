import toast from 'react-hot-toast';

export interface UndoToastOptions {
  message: string;
  undoLabel: string;
  failedLabel: string;
  /** Returns false when the change can no longer be reverted. */
  onUndo: () => boolean;
}

/**
 * Destructive edits apply immediately and offer Undo for 5 seconds — a confirm
 * dialog on every delete would cost more taps than the mistake it prevents.
 *
 * The content inherits the toast's own colours (`color: inherit`,
 * `border-current`): react-hot-toast sets the surface colour inline, so a
 * hard-coded `text-foreground` here renders white text on its white bar.
 */
export function showUndoToast({ message, undoLabel, failedLabel, onUndo }: UndoToastOptions) {
  toast(
    (instance) => (
      <span className="flex items-center gap-3 text-inherit">
        <span className="text-sm">{message}</span>
        <button
          type="button"
          className="min-h-8 shrink-0 rounded-lg border border-current px-3 py-1 text-xs font-semibold text-inherit opacity-90 transition-opacity hover:opacity-100"
          onClick={() => {
            toast.dismiss(instance.id);
            if (!onUndo()) toast.error(failedLabel);
          }}
        >
          {undoLabel}
        </button>
      </span>
    ),
    { duration: 5000 },
  );
}
