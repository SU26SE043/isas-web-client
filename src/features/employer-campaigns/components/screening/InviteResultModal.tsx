import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import type { InviteCampaignCandidatesResponse } from '../../types/campaign.api.types';

interface InviteResultModalProps {
  open: boolean;
  result: InviteCampaignCandidatesResponse | null;
  onClose: () => void;
  onRetryFailed: () => void;
}

export function InviteResultModal({ open, result, onClose, onRetryFailed }: InviteResultModalProps) {
  const { t } = useLanguage();

  if (!result) return null;

  const hasFailed = result.failed.length > 0;
  const hasSuccess = result.invited.length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.screening.invitation.send')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {hasSuccess ? (
            <Alert variant="success">
              <AlertDescription>
                {t('employer.campaigns.screening.invitation.success').replace(
                  '{count}',
                  String(result.invited.length),
                )}
              </AlertDescription>
            </Alert>
          ) : null}

          {hasFailed ? (
            <Alert variant="warning">
              <AlertDescription>
                <p className="font-medium">{t('employer.campaigns.screening.invitation.failed')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.failed.map((item) => (
                    <li key={item.candidateId}>
                      {item.candidateId}: {item.reason}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          {hasFailed ? (
            <Button type="button" variant="outline" onClick={onRetryFailed}>
              {t('employer.campaigns.screening.invitation.retryFailed')}
            </Button>
          ) : null}
          <Button type="button" onClick={onClose}>
            {t('employer.campaigns.screening.invitation.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
