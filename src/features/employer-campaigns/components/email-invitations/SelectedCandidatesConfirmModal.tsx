import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { SelectedInvitationCandidate } from '../../stores/campaignInvitationStore';
import { emailAppearsInCv, hasValidUniqueEmailSet, isValidEmail, normalizeEmail } from '../../utils/emailInvitationUtils';

interface SelectedCandidatesConfirmModalProps {
  open: boolean;
  candidates: SelectedInvitationCandidate[];
  isSending: boolean;
  onCancel: () => void;
  onConfirm: (emails: string[]) => void;
}

export function SelectedCandidatesConfirmModal({
  open,
  candidates,
  isSending,
  onCancel,
  onConfirm,
}: SelectedCandidatesConfirmModalProps) {
  const { t } = useLanguage();
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    if (open) setEmails(candidates.map((candidate) => candidate.email ?? ''));
  }, [candidates, open]);

  const duplicateIndexes = useMemo(() => {
    const seen = new Map<string, number>();
    const duplicates = new Set<number>();
    emails.forEach((email, index) => {
      const normalized = normalizeEmail(email);
      if (!normalized) return;
      const previous = seen.get(normalized);
      if (previous != null) {
        duplicates.add(previous);
        duplicates.add(index);
      } else seen.set(normalized, index);
    });
    return duplicates;
  }, [emails]);

  const canConfirm = hasValidUniqueEmailSet(emails);
  const updateEmail = (index: number, email: string) => {
    setEmails((current) => current.map((value, itemIndex) => itemIndex === index ? email : value));
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSending && onCancel()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.emailInvitations.selectedConfirmation.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.emailInvitations.selectedConfirmation.description')}</DialogDescription>
        </DialogHeader>
        <Alert variant="warning">
          <AlertDescription>{t('employer.campaigns.emailInvitations.selectedConfirmation.loginWarning')}</AlertDescription>
        </Alert>
        <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {candidates.map((candidate, index) => {
            const email = emails[index] ?? '';
            const inCv = emailAppearsInCv(email, candidate.cvText);
            const invalid = email.trim().length === 0 || !isValidEmail(email) || duplicateIndexes.has(index);
            return (
              <div key={candidate.id ?? `${candidate.email}-${index}`} className="grid gap-3 rounded-lg border border-satin bg-surface-overlay p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{candidate.fullName || t('employer.campaigns.emailInvitations.selectedConfirmation.unnamed')}</p>
                  <p className="text-xs text-muted-foreground">{t('employer.campaigns.emailInvitations.selectedConfirmation.candidateEmail')}: {candidate.email || t('employer.campaigns.emailInvitations.selectedConfirmation.missing')}</p>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`selected-invite-email-${index}`} className="text-xs font-medium text-muted-foreground">{t('employer.campaigns.emailInvitations.selectedConfirmation.recipient')}</label>
                  <Input id={`selected-invite-email-${index}`} type="email" value={email} onChange={(event) => updateEmail(index, event.target.value)} disabled={isSending} aria-invalid={invalid || undefined} />
                  {invalid ? <p className="text-xs text-error" role="alert">{t('employer.campaigns.emailInvitations.selectedConfirmation.emailInvalid')}</p> : null}
                </div>
                <p className={inCv ? 'text-xs text-success' : 'text-xs text-warning'}>{inCv ? t('employer.campaigns.emailInvitations.selectedConfirmation.inCv') : t('employer.campaigns.emailInvitations.selectedConfirmation.notInCv')}</p>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSending} onClick={onCancel}>{t('employer.campaigns.emailInvitations.actions.cancel')}</Button>
          <Button type="button" disabled={!canConfirm || isSending} loading={isSending} onClick={() => onConfirm(emails.map(normalizeEmail))}>{t('employer.campaigns.emailInvitations.selectedConfirmation.send').replace('{count}', String(candidates.length))}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
