import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { usePlansForOwner } from '../../hooks/useAdminGrants';
import type { SubscriptionGrantInput, SubscriptionGrantResult } from '../../types/adminApi.types';
import { SUBSCRIPTION_DAYS_MAX, localToIso, useIdempotencyKey } from '../../utils/adminGrants';
import { interviewFundingKey, subscriptionSourceKey, subscriptionStatusKey } from '../../utils/adminBilling';
import { EMPTY_OWNER, OwnerPicker, type OwnerSelection } from '../common/OwnerPicker';
import { SELECT_CLASS } from '../common/OrgPicker';

/**
 * Cấp thuê bao tay (AdminGrant). Gói lọc theo chủ ví (Cá nhân ⇒ B2C, Tổ chức ⇒ B2B — BE 400 nếu lệch).
 * BE trả 400 nguyên câu cho 3 ca thật (key rỗng · gói lệch đối tượng · CHỦ VÍ CHƯA CÓ VÍ) — hiện thẳng,
 * kèm gợi ý cho ca thứ ba vì admin sẽ gặp với org mới. BE KHÔNG lưu người cấp cho thuê bao (khác credit).
 */
export function GrantSubscriptionForm({ mutation }: { mutation: UseMutationResult<SubscriptionGrantResult, unknown, SubscriptionGrantInput> }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [owner, setOwner] = useState<OwnerSelection>(EMPTY_OWNER);
  const [planId, setPlanId] = useState('');
  const [days, setDays] = useState('30');
  const [activatedAt, setActivatedAt] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<(SubscriptionGrantResult & { ownerLabel: string; planName: string }) | null>(null);
  const plans = usePlansForOwner(owner.ownerType);
  const plan = plans.data?.find((p) => p.id === planId) ?? null;
  const duration = Number(days);
  const { key, rotate } = useIdempotencyKey(JSON.stringify([owner.ownerType, owner.ownerId, planId, duration, activatedAt]));
  const valid = Boolean(owner.ownerId) && Boolean(plan) && Number.isInteger(duration) && duration >= 1 && duration <= SUBSCRIPTION_DAYS_MAX;
  const errorMessage = mutation.isError ? getApiErrorMessage(mutation.error, t('admin.grants.error.default')) : null;
  const walletHint = errorMessage && /credit account/i.test(errorMessage) ? t('admin.grants.sub.error.noWalletHint') : null;
  const when = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

  const submit = () => mutation.mutate({ ownerType: owner.ownerType, ownerId: owner.ownerId, planId, durationDays: duration, ...(localToIso(activatedAt) ? { activatedAt: localToIso(activatedAt) } : {}), idempotencyKey: key }, {
    onSuccess: (data) => { setResult({ ...data, ownerLabel: owner.ownerLabel, planName: plan?.name ?? planId }); setPlanId(''); setActivatedAt(''); rotate(); setConfirming(false); },
    onError: () => setConfirming(false),
  });

  return (
    <section className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-labelledby="grant-sub-title">
      <div><h2 id="grant-sub-title" className="text-base font-medium text-foreground">{t('admin.grants.sub.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.grants.sub.description')}</p></div>
      <OwnerPicker value={owner} onChange={(next) => { setOwner(next); setPlanId(''); setResult(null); mutation.reset(); }} disabled={mutation.isPending} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)]">
        <div className="space-y-1.5"><Label htmlFor="grant-plan">{t('admin.grants.sub.plan')}</Label>
          <select id="grant-plan" className={SELECT_CLASS} value={planId} disabled={mutation.isPending || plans.isLoading} onChange={(event) => setPlanId(event.target.value)}>
            <option value="">{plans.isLoading ? t('admin.picker.org.loading') : t('admin.grants.sub.planPlaceholder')}</option>
            {(plans.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code}) · {t(interviewFundingKey(p.interviewFunding))}{p.monthlyQuota ? ` ${p.monthlyQuota}` : ''}</option>)}
          </select>
          {plans.isError ? <p className="text-xs text-error">{t('admin.grants.sub.plansError')}</p> : null}
        </div>
        <div className="space-y-1.5"><Label htmlFor="grant-days">{t('admin.grants.sub.days')}</Label><Input id="grant-days" type="number" inputMode="numeric" min={1} max={SUBSCRIPTION_DAYS_MAX} value={days} disabled={mutation.isPending} onChange={(event) => setDays(event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="grant-activated">{t('admin.grants.sub.activatedAt')}</Label><Input id="grant-activated" type="datetime-local" value={activatedAt} disabled={mutation.isPending} onChange={(event) => setActivatedAt(event.target.value)} /><p className="text-xs text-muted-foreground">{t('admin.grants.sub.activatedAtHint')}</p></div>
      </div>
      {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}{walletHint ? ` ${walletHint}` : ''}</AlertDescription></Alert> : null}
      <div className="flex justify-end"><Button type="button" disabled={!valid || mutation.isPending} loading={mutation.isPending} onClick={() => setConfirming(true)}>{t('admin.grants.sub.submit')}</Button></div>
      {result ? (
        <div className="space-y-2 rounded-xl border border-satin bg-surface-overlay/60 p-4 text-sm" role="status">
          <p className="font-medium text-success">{t('admin.grants.sub.done').replace('{owner}', result.ownerLabel).replace('{plan}', result.planName)}</p>
          <p className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{result.tierCode}</Badge>
            <Badge variant="success">{t(subscriptionStatusKey(result.status))}</Badge>
            <Badge variant="outline">{t(subscriptionSourceKey(result.source))}</Badge>
            <span className="text-muted-foreground">{when(result.activatedAt)} → {when(result.expiresAt)}</span>
          </p>
        </div>
      ) : null}
      <ConfirmDialog open={confirming} onOpenChange={(open) => { if (!open && !mutation.isPending) setConfirming(false); }} title={t('admin.grants.sub.confirmTitle')} description={t('admin.grants.sub.confirmDescription').replace('{plan}', plan?.name ?? '').replace('{days}', String(duration)).replace('{owner}', owner.ownerLabel)} confirmLabel={t('admin.grants.sub.submit')} cancelLabel={t('admin.rubrics.cancel')} loading={mutation.isPending} onConfirm={submit} />
    </section>
  );
}
