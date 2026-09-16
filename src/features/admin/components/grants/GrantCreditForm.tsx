import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import type { CreditGrantInput, GrantCreditResult } from '../../types/adminApi.types';
import { GRANT_CREDITS_MAX, GRANT_CREDITS_MIN, GRANT_NOTE_MAX, GRANT_NOTE_MIN, useIdempotencyKey } from '../../utils/adminGrants';
import { shortId } from '../../utils/adminBilling';
import { EMPTY_OWNER, OwnerPicker, type OwnerSelection } from '../common/OwnerPicker';

/**
 * Cấp credit khuyến mãi (F20) — "in tiền" trong hệ: người cấp lấy từ JWT phía BE, ghi sổ `PromoGrant`,
 * không hoàn tự động. Confirm nêu đúng số + tên chủ ví; kết quả có cấu trúc; form reset + khoá idempotency
 * xoay sau thành công.
 */
export function GrantCreditForm({ mutation }: { mutation: UseMutationResult<GrantCreditResult, unknown, CreditGrantInput> }) {
  const { t } = useLanguage();
  const [owner, setOwner] = useState<OwnerSelection>(EMPTY_OWNER);
  const [credits, setCredits] = useState('');
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<(GrantCreditResult & { ownerLabel: string }) | null>(null);
  const amount = Number(credits);
  const { key, rotate } = useIdempotencyKey(JSON.stringify([owner.ownerType, owner.ownerId, amount, note.trim()]));
  const valid = Boolean(owner.ownerId) && Number.isInteger(amount) && amount >= GRANT_CREDITS_MIN && amount <= GRANT_CREDITS_MAX && note.trim().length >= GRANT_NOTE_MIN && note.trim().length <= GRANT_NOTE_MAX;
  const status = getApiStatusCode(mutation.error);
  const errorMessage = mutation.isError ? (status === 409 ? t('admin.grants.credit.error.walletRace') : getApiErrorMessage(mutation.error, t('admin.grants.error.default'))) : null;

  const submit = () => mutation.mutate({ ownerType: owner.ownerType, ownerId: owner.ownerId, credits: amount, note: note.trim(), idempotencyKey: key }, {
    onSuccess: (data) => { setResult({ ...data, ownerLabel: owner.ownerLabel }); setCredits(''); setNote(''); rotate(); setConfirming(false); },
    onError: () => setConfirming(false),
  });

  return (
    <section className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-labelledby="grant-credit-title">
      <div><h2 id="grant-credit-title" className="text-base font-medium text-foreground">{t('admin.grants.credit.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.grants.credit.description')}</p></div>
      <OwnerPicker value={owner} onChange={(next) => { setOwner(next); setResult(null); mutation.reset(); }} disabled={mutation.isPending} />
      <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="space-y-1.5"><Label htmlFor="grant-credits">{t('admin.grants.credit.amount')}</Label><Input id="grant-credits" type="number" inputMode="numeric" min={GRANT_CREDITS_MIN} max={GRANT_CREDITS_MAX} value={credits} disabled={mutation.isPending} onChange={(event) => setCredits(event.target.value)} /><p className="text-xs text-muted-foreground">{t('admin.grants.credit.amountHint').replace('{max}', String(GRANT_CREDITS_MAX))}</p></div>
        <div className="space-y-1.5"><Label htmlFor="grant-note">{t('admin.grants.note')}</Label><Textarea id="grant-note" rows={2} maxLength={GRANT_NOTE_MAX} value={note} disabled={mutation.isPending} onChange={(event) => setNote(event.target.value)} placeholder={t('admin.grants.credit.notePlaceholder')} /><p className="text-xs text-muted-foreground">{t('admin.grants.noteHint').replace('{min}', String(GRANT_NOTE_MIN))}</p></div>
      </div>
      {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
      <div className="flex justify-end"><Button type="button" disabled={!valid || mutation.isPending} loading={mutation.isPending} onClick={() => setConfirming(true)}>{t('admin.grants.credit.submit')}</Button></div>
      {result ? (
        <div className="space-y-2" role="status">
          <p className="text-sm font-medium text-success">{t('admin.grants.credit.done').replace('{owner}', result.ownerLabel)}</p>
          <StatGrid columns={3}>
            <StatCard size="sm" label={t('admin.grants.credit.granted')} value={`+${result.creditsGranted}`} tone="success" />
            <StatCard size="sm" label={t('admin.grants.credit.remaining')} value={result.remainingCredits} />
            <StatCard size="sm" label={t('admin.grants.credit.txId')} value={result.transactionId ? shortId(result.transactionId) : '—'} />
          </StatGrid>
        </div>
      ) : null}
      <ConfirmDialog open={confirming} onOpenChange={(open) => { if (!open && !mutation.isPending) setConfirming(false); }} title={t('admin.grants.credit.confirmTitle')} description={t('admin.grants.credit.confirmDescription').replace('{n}', String(amount)).replace('{owner}', owner.ownerLabel)} confirmLabel={t('admin.grants.credit.submit')} cancelLabel={t('admin.rubrics.cancel')} loading={mutation.isPending} onConfirm={submit} />
    </section>
  );
}
