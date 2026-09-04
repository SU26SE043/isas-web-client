import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { useCreateCampaignInvitations } from '../../hooks/useCreateCampaignInvitations';
import { useCampaignSlots } from '../../hooks/useCampaignSlots';
import type {
  CreatedCampaignInvitation,
  FailedCampaignInvitation,
} from '../../types/campaign.api.types';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { SelectedInvitationCandidate } from '../../stores/campaignInvitationStore';
import { useInviteCampaignCandidates } from '../../hooks/useCampaignCandidates';
import {
  getCampaignInvitationError,
  getCampaignInvitationErrorKey,
} from '../../utils/campaignInvitationError';
import {
  isValidEmail,
  mergeUniqueEmails,
  normalizeEmail,
  parseEmailBatch,
  uniqueNormalizedEmails,
  type InvalidEmailItem,
} from '../../utils/emailInvitationUtils';
import { campaignSlotCapacity } from '../../utils/campaignSlots';

export type EmailInviteStep = 'form' | 'result';

export function useEmailInvitationFlow(
  campaign: EmployerCampaign,
  initialEmails: string[] = [],
  selectedCandidates: SelectedInvitationCandidate[] = [],
) {
  const { t } = useLanguage();
  const inviteMutation = useCreateCampaignInvitations(campaign.id);
  const candidateInviteMutation = useInviteCampaignCandidates(campaign.id);
  const slotsQuery = useCampaignSlots(campaign.id);
  const isActive = campaign.status === 'active';
  const isSending = inviteMutation.isPending || candidateInviteMutation.isPending;
  const initialEmailsKey = initialEmails.join('|');

  const [step, setStep] = useState<EmailInviteStep>('form');
  const [validEmails, setValidEmails] = useState<string[]>(() =>
    uniqueNormalizedEmails(initialEmails).filter(isValidEmail),
  );
  const [invalidEmails, setInvalidEmails] = useState<InvalidEmailItem[]>([]);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryEmails, setRetryEmails] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCampaignInvitation[]>([]);
  const [failed, setFailed] = useState<FailedCampaignInvitation[]>([]);

  useEffect(() => {
    setStep('form');
    setValidEmails(uniqueNormalizedEmails(initialEmails).filter(isValidEmail));
    setInvalidEmails([]);
    setDuplicateEmails([]);
    setConfirmOpen(false);
    setRetryMode(false);
    setRetryEmails([]);
    setFormError(null);
    setCreated([]);
    setFailed([]);
    inviteMutation.reset();
    candidateInviteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on campaign change
  }, [campaign.id, initialEmailsKey]);

  const capacityWarning = useMemo(() => {
    if (!slotsQuery.data || validEmails.length === 0) return null;
    const { available } = campaignSlotCapacity(slotsQuery.data);
    if (validEmails.length > available) {
      return t('employer.campaigns.slots.invitationWarning')
        .replace('{inviting}', String(validEmails.length))
        .replace('{available}', String(available));
    }
    return null;
  }, [slotsQuery.data, t, validEmails.length]);

  const canSend =
    isActive && validEmails.length > 0 && invalidEmails.length === 0 && !isSending;

  const addSingle = useCallback(
    (raw: string) => {
      const normalized = normalizeEmail(raw);
      if (!normalized) {
        return {
          ok: false as const,
          errorKey: 'employer.campaigns.emailInvitations.errors.emptyEmail',
        };
      }
      if (!isValidEmail(normalized)) {
        return {
          ok: false as const,
          errorKey: 'employer.campaigns.emailInvitations.errors.invalidEmail',
        };
      }
      if (validEmails.includes(normalized)) {
        return {
          ok: false as const,
          errorKey: 'employer.campaigns.emailInvitations.errors.duplicateEmail',
        };
      }
      setValidEmails((prev) => [...prev, normalized]);
      setDuplicateEmails((prev) => prev.filter((item) => item !== normalized));
      setInvalidEmails((prev) =>
        prev.filter((item) => normalizeEmail(item.value) !== normalized),
      );
      return { ok: true as const };
    },
    [validEmails],
  );

  const addBulk = useCallback(
    (raw: string) => {
      const parsed = parseEmailBatch(raw, new Set(validEmails));
      setValidEmails((prev) => mergeUniqueEmails(prev, parsed.validEmails));
      setInvalidEmails((prev) => {
        const map = new Map(
          prev.map((item) => [`${normalizeEmail(item.value)}:${item.reason}`, item]),
        );
        for (const item of parsed.invalidEmails) {
          map.set(`${normalizeEmail(item.value)}:${item.reason}`, item);
        }
        return Array.from(map.values());
      });
      setDuplicateEmails((prev) => Array.from(new Set([...prev, ...parsed.duplicateEmails])));
      return {
        validEmails: parsed.validEmails,
        validCount: parsed.validEmails.length,
        invalidCount: parsed.invalidEmails.length,
        duplicateCount: parsed.duplicateEmails.length,
      };
    },
    [validEmails],
  );

  const removeEmail = (value: string) => {
    const normalized = normalizeEmail(value);
    setValidEmails((prev) => prev.filter((email) => email !== normalized));
    setInvalidEmails((prev) =>
      prev.filter((item) => normalizeEmail(item.value) !== normalized),
    );
    setDuplicateEmails((prev) => prev.filter((email) => email !== normalized));
  };

  const openConfirm = (emails: string[], retry: boolean) => {
    if (!isActive || emails.length === 0 || isSending) return;
    setRetryMode(retry);
    setRetryEmails(emails);
    setConfirmOpen(true);
    setFormError(null);
  };

  const replaceEmails = (emails: string[]) => {
    setValidEmails(uniqueNormalizedEmails(emails).filter(isValidEmail));
    setInvalidEmails([]);
    setDuplicateEmails([]);
  };

  const sendInvitations = async (overrideEmails?: string[]) => {
    const emails = uniqueNormalizedEmails(overrideEmails ?? (retryMode ? retryEmails : validEmails));
    if (!isActive || emails.length === 0 || isSending) return;

    try {
      const selectedByEmail = new Map(selectedCandidates.map((candidate) => [normalizeEmail(candidate.email), candidate]));
      const isUneditedCandidateSelection = selectedCandidates.length > 0 &&
        selectedCandidates.every((candidate) => candidate.id && normalizeEmail(candidate.email) === emails.find((email) => normalizeEmail(email) === normalizeEmail(candidate.email)));
      const response = isUneditedCandidateSelection
        ? await candidateInviteMutation.mutateAsync({
            candidateIds: selectedCandidates.flatMap((candidate) => candidate.id ? [candidate.id] : []),
            ...(selectedCandidates.some((candidate) => candidate.eligible === false) ? { includeIneligible: true } : {}),
          }).then((result) => ({
            created: result.invited.map((item) => ({ id: item.invitationId, email: item.email, expiresAt: '' })),
            failed: result.failed.map((item) => ({ email: selectedByEmail.get(item.candidateId)?.email ?? item.candidateId, reason: item.reason })),
          }))
        : await inviteMutation.mutateAsync({ emails });
      if (retryMode) {
        const retrySet = new Set(emails);
        const keptFailed = failed.filter((item) => !retrySet.has(normalizeEmail(item.email)));
        const createdMap = new Map(created.map((item) => [item.email, item]));
        for (const item of response.created) {
          createdMap.set(item.email, item);
        }
        const failedMap = new Map(
          [...keptFailed, ...response.failed].map((item) => [normalizeEmail(item.email), item]),
        );
        for (const item of response.created) {
          failedMap.delete(normalizeEmail(item.email));
        }
        setCreated(Array.from(createdMap.values()));
        setFailed(Array.from(failedMap.values()));
      } else {
        setCreated(response.created);
        setFailed(response.failed);
        setValidEmails(response.failed.map((item) => normalizeEmail(item.email)));
        setInvalidEmails([]);
        setDuplicateEmails([]);
      }
      setConfirmOpen(false);
      setStep('result');
    } catch (error) {
      setConfirmOpen(false);
      const key = getCampaignInvitationErrorKey(error);
      setFormError(getCampaignInvitationError(error, t(key)));
    }
  };

  const inviteMore = () => {
    setStep('form');
    setCreated([]);
    setFailed([]);
    setFormError(null);
    inviteMutation.reset();
    candidateInviteMutation.reset();
  };

  return {
    isActive,
    isSending,
    step,
    validEmails,
    invalidEmails,
    duplicateEmails,
    confirmOpen,
    retryEmails,
    formError,
    created,
    failed,
    capacityWarning,
    availableSlotCapacity: campaignSlotCapacity(slotsQuery.data ?? []).available,
    canSend,
    addSingle,
    addBulk,
    removeEmail,
    clearAll: () => {
      setValidEmails([]);
      setInvalidEmails([]);
      setDuplicateEmails([]);
    },
    clearInvalid: () => {
      setInvalidEmails([]);
      setDuplicateEmails([]);
    },
    openConfirm,
    replaceEmails,
    sendInvitations,
    inviteMore,
    closeConfirm: () => setConfirmOpen(false),
  };
}
