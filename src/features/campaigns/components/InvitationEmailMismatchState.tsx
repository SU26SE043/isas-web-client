import { AlertTriangle } from 'lucide-react';
import { AppModal } from '@/components/ui/app-modal';
import { useLanguage } from '@/shared/languages';

interface InvitationEmailMismatchStateProps {
  currentEmail?: string | null;
  isSwitchingAccount: boolean;
  onSwitchAccount: () => void;
}

export function InvitationEmailMismatchState({
  currentEmail,
  isSwitchingAccount,
  onSwitchAccount,
}: InvitationEmailMismatchStateProps) {
  const { t } = useLanguage();

  return (
    <AppModal
      open
      onClose={() => undefined}
      size="md"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      ariaLabel={t('campaigns.invite.emailMismatchTitle')}
      contentClassName="border-error/40 bg-error/10"
    >
      <section role="alert" aria-labelledby="invitation-email-mismatch-title">
        <AlertTriangle className="size-7 text-error" aria-hidden />
        <h1 id="invitation-email-mismatch-title" className="mt-4 text-2xl font-semibold text-foreground">
          {t('campaigns.invite.emailMismatchTitle')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t('campaigns.invite.emailMismatchDescription')}
        </p>
        {currentEmail ? (
          <div className="mt-5 rounded-xl border border-error/30 bg-surface-elevated px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              {t('campaigns.invite.currentAccount')}
            </p>
            <p className="mt-1 break-all text-sm font-medium text-foreground">{currentEmail}</p>
          </div>
        ) : null}
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={onSwitchAccount}
          disabled={isSwitchingAccount}
        >
          {isSwitchingAccount
            ? t('campaigns.invite.switchingAccount')
            : t('campaigns.invite.switchAccount')}
        </button>
      </section>
    </AppModal>
  );
}
