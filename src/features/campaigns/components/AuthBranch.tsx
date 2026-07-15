import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { InviteAuthMode } from '../types/campaign.types';

interface AuthBranchProps {
  mode: InviteAuthMode;
  candidateEmail: string;
  invitePath: string;
  isAuthenticated: boolean;
  currentEmail?: string;
}

export function AuthBranch({
  mode,
  candidateEmail,
  invitePath,
  isAuthenticated,
  currentEmail,
}: AuthBranchProps) {
  const { t } = useLanguage();
  const authState = { from: { pathname: invitePath } };

  if (mode === 'role_blocked') {
    return (
      <div className="rounded-xl border border-error/20 bg-error-bg p-4 text-sm text-error" role="alert">
        {t('campaigns.invite.roleBlocked')}
      </div>
    );
  }

  if (isAuthenticated && currentEmail && currentEmail.toLowerCase() !== candidateEmail.toLowerCase()) {
    return (
      <div className="rounded-xl border border-error/20 bg-error-bg p-4 text-sm text-error" role="alert">
        {t('campaigns.invite.emailMismatch').replace('{email}', candidateEmail)}
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border border-subtle bg-surface-overlay p-5">
      <p className="text-sm text-muted-foreground">
        {mode === 'sign_in'
          ? t('campaigns.invite.authSignIn').replace('{email}', candidateEmail)
          : t('campaigns.invite.authRegister').replace('{email}', candidateEmail)}
      </p>
      <div className="flex flex-wrap gap-3">
        {mode === 'sign_in' ? (
          <Link to="/login" state={authState} className={cn(buttonVariants(), 'inline-flex gap-2')}>
            <LogIn className="size-4" aria-hidden />
            {t('campaigns.invite.signIn')}
          </Link>
        ) : (
          <Link to="/register" state={authState} className={cn(buttonVariants(), 'inline-flex gap-2')}>
            <UserPlus className="size-4" aria-hidden />
            {t('campaigns.invite.register')}
          </Link>
        )}
        {mode === 'register' ? (
          <Link to="/login" state={authState} className={cn(buttonVariants({ variant: 'secondary' }), 'inline-flex gap-2')}>
            <LogIn className="size-4" aria-hidden />
            {t('campaigns.invite.signIn')}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
