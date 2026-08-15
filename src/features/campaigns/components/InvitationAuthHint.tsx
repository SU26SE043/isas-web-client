import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

interface InvitationAuthHintProps {
  invitePath: string;
  token: string;
  onSavePendingToken: (token: string) => void;
}

export function InvitationAuthHint({ invitePath, token, onSavePendingToken }: InvitationAuthHintProps) {
  const { t } = useLanguage();

  return (
    <p className="mx-auto max-w-3xl text-center text-sm text-zinc-500">
      {t('campaigns.invite.authRequiredHint')}{' '}
      <Link
        to="/login"
        state={{ from: { pathname: invitePath } }}
        className="font-medium text-zinc-100 underline-offset-4 hover:underline"
        onClick={() => onSavePendingToken(token)}
      >
        {t('campaigns.invite.signIn')}
      </Link>
      {' · '}
      <Link
        to="/register"
        state={{ from: { pathname: invitePath } }}
        className="font-medium text-zinc-100 underline-offset-4 hover:underline"
        onClick={() => onSavePendingToken(token)}
      >
        {t('campaigns.invite.register')}
      </Link>
    </p>
  );
}
