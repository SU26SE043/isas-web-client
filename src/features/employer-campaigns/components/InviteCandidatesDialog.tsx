import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { InviteResolution } from '../types/campaignManagement.types';

interface InviteCandidatesDialogProps {
  onInvite: (emails: string[]) => Promise<InviteResolution>;
}

function parseEmails(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function InviteCandidatesDialog({ onInvite }: InviteCandidatesDialogProps) {
  const { t } = useLanguage();
  const [emails, setEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InviteResolution | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const resolution = await onInvite(parseEmails(emails));
      setResult(resolution);
      if (resolution.rejected.length === 0) setEmails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>{t('employer.campaigns.detail.invite')}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.invite.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.invite.description')}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            {result.linked.length > 0 ? (
              <Alert variant="success">
                <AlertDescription>
                  {t('employer.campaigns.invite.linked').replace('{count}', String(result.linked.length))}
                </AlertDescription>
              </Alert>
            ) : null}
            {result.pending.length > 0 ? (
              <Alert>
                <AlertDescription>
                  {t('employer.campaigns.invite.pending').replace('{count}', String(result.pending.length))}
                </AlertDescription>
              </Alert>
            ) : null}
            {result.rejected.length > 0 ? (
              <Alert variant="warning">
                <AlertDescription>
                  <p className="font-medium">{t('employer.campaigns.invite.rejectedTitle')}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {result.rejected.map((item) => (
                      <li key={item.email}>
                        {item.email}:{' '}
                        {item.reason === 'EMPLOYER_EMAIL' || item.reason === 'INVALID_EMAIL'
                          ? t(`employer.campaigns.invite.rejected.${item.reason}`)
                          : item.reason}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="candidate-emails">{t('employer.campaigns.invite.emails')}</Label>
          <textarea
            id="candidate-emails"
            rows={6}
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            className="w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t('employer.campaigns.invite.cancel')}</DialogClose>
          <Button type="button" onClick={handleSubmit} loading={isSubmitting}>
            {t('employer.campaigns.invite.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
