import { useEffect, useMemo, useState } from 'react';
import { UserRoundPen } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useUpdateCampaignCandidate } from '../../hooks/useCampaignCandidates';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import {
  buildUpdateCandidatePayload,
  getUpdateCandidateErrorKey,
  isValidCandidateEmail,
} from '../../utils/campaignCandidateActions';

interface EditCandidateModalProps {
  open: boolean;
  campaignId: string;
  candidate: CampaignCandidateListItem | null;
  onClose: () => void;
}

export function EditCandidateModal({
  open,
  campaignId,
  candidate,
  onClose,
}: EditCandidateModalProps) {
  const { t } = useLanguage();
  const updateMutation = useUpdateCampaignCandidate(campaignId);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !candidate) return;
    setFullName(candidate.fullName ?? '');
    setEmail(candidate.email ?? '');
    setEmailError(null);
  }, [open, candidate]);

  const payload = useMemo(
    () => (candidate ? buildUpdateCandidatePayload(candidate, { fullName, email }) : {}),
    [candidate, email, fullName],
  );

  const currentName = (candidate?.fullName ?? '').trim();
  const currentEmail = (candidate?.email ?? '').trim().toLowerCase();
  const dirtyName = fullName.trim() !== currentName;
  const dirtyEmail = email.trim().toLowerCase() !== currentEmail;
  const nameInvalid = dirtyName && !fullName.trim();
  const emailFormatInvalid =
    email.trim().length > 0 && !isValidCandidateEmail(email)
      ? t('employer.campaigns.screening.edit.emailInvalid')
      : dirtyEmail && !email.trim()
        ? t('employer.campaigns.screening.edit.emailInvalid')
        : null;

  const canSubmit =
    Boolean(candidate) &&
    Object.keys(payload).length > 0 &&
    !nameInvalid &&
    !emailFormatInvalid &&
    !updateMutation.isPending;

  const handleSubmit = async () => {
    if (!candidate || !canSubmit) return;
    if (payload.email && !isValidCandidateEmail(payload.email)) {
      setEmailError(t('employer.campaigns.screening.edit.emailInvalid'));
      return;
    }
    setEmailError(null);
    try {
      await updateMutation.mutateAsync({ candidateId: candidate.id, payload });
      toast.success(t('employer.campaigns.screening.edit.success'));
      onClose();
    } catch (error) {
      toast.error(t(getUpdateCandidateErrorKey(error)));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !updateMutation.isPending && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogIcon>
            <UserRoundPen aria-hidden />
          </DialogIcon>
          <DialogTitle>{t('employer.campaigns.screening.edit.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.screening.edit.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-candidate-name">
              {t('employer.campaigns.screening.edit.fullName')}
            </Label>
            <Input
              id="edit-candidate-name"
              className="focus-visible:border-foreground focus-visible:ring-foreground/15"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={updateMutation.isPending}
              aria-invalid={nameInvalid || undefined}
              aria-describedby={nameInvalid ? 'edit-candidate-name-error' : undefined}
            />
            {nameInvalid ? (
              <p id="edit-candidate-name-error" className="text-sm text-error" role="alert">
                {t('employer.campaigns.screening.edit.fullNameRequired')}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-candidate-email">
              {t('employer.campaigns.screening.edit.email')}
            </Label>
            <Input
              id="edit-candidate-email"
              type="email"
              className="focus-visible:border-foreground focus-visible:ring-foreground/15"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              disabled={updateMutation.isPending}
              aria-invalid={Boolean(emailError || emailFormatInvalid) || undefined}
              aria-describedby={
                emailError || emailFormatInvalid ? 'edit-candidate-email-error' : undefined
              }
            />
            {emailError || emailFormatInvalid ? (
              <p id="edit-candidate-email-error" className="text-sm text-error" role="alert">
                {emailError || emailFormatInvalid}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={onClose}
          >
            {t('employer.campaigns.screening.edit.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-foreground text-background hover:bg-foreground/85"
            disabled={!canSubmit}
            loading={updateMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {updateMutation.isPending
              ? t('employer.campaigns.screening.edit.saving')
              : t('employer.campaigns.screening.edit.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
