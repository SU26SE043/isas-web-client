import { useId, useState } from 'react';
import { CircleStop } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';

interface EndCampaignDialogProps {
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export function EndCampaignDialog({ onConfirm, disabled }: EndCampaignDialogProps) {
  const { t } = useLanguage();
  const confirmationId = useId();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmationPhrase = t('employer.campaigns.endConfirm.phrase');
  const canConfirm = confirmation === confirmationPhrase && !isSubmitting;

  const resetDialog = () => {
    setConfirmation('');
    setErrorMessage(null);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirm();
      setOpen(false);
      resetDialog();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, t('employer.campaigns.endConfirm.errorDescription')),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        setOpen(next);
        if (!next) resetDialog();
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={disabled}
            title={t('employer.campaigns.detail.endTooltip')}
            className="border border-error/50 bg-error/15 text-error-light hover:border-error/80 hover:bg-error/30 hover:text-white"
          />
        }
      >
        <CircleStop aria-hidden />
        {t('employer.campaigns.detail.endCampaign')}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogIcon className="border border-error/35 bg-error/15 text-error-light">
            <CircleStop aria-hidden />
          </DialogIcon>
          <DialogTitle>{t('employer.campaigns.endConfirm.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.endConfirm.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.endConfirm.dataRetention')}
          </p>
          <p className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-sm font-medium text-error-light">
            {t('employer.campaigns.endConfirm.irreversible')}
          </p>

          <div className="space-y-2">
            <Label htmlFor={confirmationId}>
              {t('employer.campaigns.endConfirm.inputLabel').replace(
                '{phrase}',
                confirmationPhrase,
              )}
            </Label>
            <Input
              id={confirmationId}
              value={confirmation}
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck={false}
              placeholder={confirmationPhrase}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setErrorMessage(null);
              }}
            />
          </div>

          {errorMessage ? (
            <Alert variant="error">
              <AlertTitle>{t('employer.campaigns.endConfirm.errorTitle')}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            {t('employer.campaigns.endConfirm.cancel')}
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!canConfirm}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            {t(
              isSubmitting
                ? 'employer.campaigns.endConfirm.submitting'
                : 'employer.campaigns.endConfirm.confirm',
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
