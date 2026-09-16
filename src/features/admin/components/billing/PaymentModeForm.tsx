import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { CreditAccount, SetPaymentModeResult } from '../../types/adminApi.types';
import { PAYMENT_MODE_POSTPAID, PAYMENT_MODE_PREPAID, paymentModeKey } from '../../utils/adminBilling';

interface PaymentModeFormProps {
  orgId: string;
  wallet: CreditAccount | undefined;
  busy: boolean;
  errorMessage: string | null;
  result: SetPaymentModeResult | null;
  onSubmit: (input: { paymentMode: number; creditLimit?: number; note: string; allowStrandedCredits: boolean }) => void;
}

const SELECT_CLASS = 'mt-2 flex h-10 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground';

/**
 * Duyệt/đổi chế độ ví. Ba việc bản cũ thiếu: chọn chế độ dựa trên chế độ HIỆN TẠI của ví (không mặc
 * định Postpaid mù), CONFIRM nêu hậu quả trước khi gọi (đây là tiền), và kết quả hiện có cấu trúc
 * thay cho `JSON.stringify`. Form reset sau thành công để bấm lần hai không gửi lại y nguyên.
 */
export function PaymentModeForm({ orgId, wallet, busy, errorMessage, result, onSubmit }: PaymentModeFormProps) {
  const { t } = useLanguage();
  const currentMode = wallet?.paymentMode ?? PAYMENT_MODE_PREPAID;
  const [mode, setMode] = useState<number>(currentMode === PAYMENT_MODE_POSTPAID ? PAYMENT_MODE_PREPAID : PAYMENT_MODE_POSTPAID);
  const [creditLimit, setCreditLimit] = useState('');
  const [note, setNote] = useState('');
  const [allowStranded, setAllowStranded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => { setMode(currentMode === PAYMENT_MODE_POSTPAID ? PAYMENT_MODE_PREPAID : PAYMENT_MODE_POSTPAID); setNote(''); setCreditLimit(''); setAllowStranded(false); }, [orgId, currentMode]);
  useEffect(() => { if (result) { setNote(''); setCreditLimit(''); setAllowStranded(false); setConfirmOpen(false); } }, [result]);

  const limit = creditLimit.trim() ? Number(creditLimit) : undefined;
  const toPostpaid = mode === PAYMENT_MODE_POSTPAID;
  const valid = Boolean(orgId) && note.trim().length > 0 && (!toPostpaid || (Number.isFinite(limit) && (limit ?? 0) > 0));
  const strandedRisk = toPostpaid && wallet ? wallet.remainingCredits + wallet.reservedCredits > 0 : false;

  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <h2 className="text-xl font-semibold text-foreground">{t('admin.billing.modeTitle')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('admin.billing.modeDescription')}</p>
      <div className="mt-6 space-y-4">
        {wallet?.walletExists ? <p className="text-sm text-muted-foreground">{t('admin.billing.currentMode').replace('{mode}', t(paymentModeKey(currentMode)))}</p> : null}
        <div>
          <Label htmlFor="billing-mode">{t('admin.billing.mode')}</Label>
          <select id="billing-mode" value={mode} onChange={(event) => setMode(Number(event.target.value))} className={SELECT_CLASS}>
            <option value={PAYMENT_MODE_POSTPAID}>{t('admin.billing.postpaid')}</option>
            <option value={PAYMENT_MODE_PREPAID}>{t('admin.billing.prepaid')}</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{t(toPostpaid ? 'admin.billing.postpaidHint' : 'admin.billing.prepaidHint')}</p>
        </div>
        {toPostpaid ? (
          <div>
            <Label htmlFor="billing-credit-limit">{t('admin.billing.creditLimit')}</Label>
            <Input id="billing-credit-limit" type="number" min="1" value={creditLimit} onChange={(event) => setCreditLimit(event.target.value)} placeholder={t('admin.billing.creditLimitPlaceholder')} />
            <p className="mt-1 text-xs text-muted-foreground">{t('admin.billing.creditLimitHint')}</p>
          </div>
        ) : null}
        <div>
          <Label htmlFor="billing-note">{t('admin.billing.note')}</Label>
          <Textarea id="billing-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder={t('admin.billing.notePlaceholder')} />
        </div>
        {strandedRisk ? (
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={allowStranded} onChange={(event) => setAllowStranded(event.target.checked)} className="mt-1" />
            <span>{t('admin.billing.allowStrandedCredits').replace('{count}', String((wallet?.remainingCredits ?? 0) + (wallet?.reservedCredits ?? 0)))}</span>
          </label>
        ) : null}
        {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        <Button type="button" disabled={busy || !valid} loading={busy} onClick={() => setConfirmOpen(true)}>{t('admin.billing.saveMode')}</Button>
        {result ? (
          <Alert variant="success">
            <AlertDescription>
              {t('admin.billing.modeResult')
                .replace('{mode}', t(paymentModeKey(result.paymentMode)))
                .replace('{limit}', result.creditLimit === null ? '—' : String(result.creditLimit))
                .replace('{remaining}', String(result.remainingCredits))
                .replace('{reserved}', String(result.reservedCredits))}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('admin.billing.modeConfirmTitle').replace('{mode}', t(paymentModeKey(mode)))}
        description={t(toPostpaid ? 'admin.billing.modeConfirmPostpaid' : 'admin.billing.modeConfirmPrepaid').replace('{limit}', String(limit ?? ''))}
        confirmLabel={t('admin.billing.saveMode')}
        cancelLabel={t('admin.billing.cancel')}
        loading={busy}
        onConfirm={() => onSubmit({ paymentMode: mode, ...(toPostpaid ? { creditLimit: limit } : {}), note: note.trim(), allowStrandedCredits: allowStranded })}
      />
    </section>
  );
}
