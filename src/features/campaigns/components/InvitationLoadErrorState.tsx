import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

interface InvitationLoadErrorStateProps {
  message: string;
}

export function InvitationLoadErrorState({ message }: InvitationLoadErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="page-container page-section flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-error" role="alert">{message}</p>
      <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
        {t('campaigns.invite.retryLoad')}
      </button>
      <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        {t('campaigns.invite.home')}
      </Link>
    </div>
  );
}
