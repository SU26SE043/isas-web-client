import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

interface InviteExpiredStateProps {
  variant: 'expired' | 'invalid' | 'revoked';
}

export function InviteExpiredState({ variant }: InviteExpiredStateProps) {
  const { t } = useLanguage();

  const titleKey =
    variant === 'expired'
      ? 'campaigns.invite.expiredTitle'
      : variant === 'revoked'
        ? 'campaigns.invite.revokedTitle'
        : 'campaigns.invite.notFound';

  const hintKey =
    variant === 'expired'
      ? 'campaigns.invite.expired'
      : variant === 'revoked'
        ? 'campaigns.invite.revokedHint'
        : 'campaigns.invite.notFoundHint';

  return (
    <Card className="mx-auto max-w-2xl border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-warning" aria-hidden />
        <h1 className="text-2xl font-semibold text-foreground">{t(titleKey)}</h1>
        <p className="text-sm text-muted-foreground">{t(hintKey)}</p>
        <Link to="/" className={cn(buttonVariants({ variant: 'secondary' }), 'mx-auto w-fit')}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('campaigns.invite.home')}
        </Link>
      </CardContent>
    </Card>
  );
}
