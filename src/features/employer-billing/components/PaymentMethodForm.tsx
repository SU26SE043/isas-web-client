import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { BillingPaymentMethod, PaymentMethodInput } from '../types/employerBilling.types';

interface PaymentMethodFormProps {
  paymentMethod: BillingPaymentMethod | null;
  onSave: (input: PaymentMethodInput) => Promise<unknown>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-error">{message}</p> : null;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function passesLuhn(value: string) {
  const digits = digitsOnly(value);
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function futureExpiry(value: string) {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiryDate = new Date(year, month, 0, 23, 59, 59);
  return expiryDate > new Date();
}

export function PaymentMethodForm({ paymentMethod, onSave }: PaymentMethodFormProps) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        holderName: z.string().min(2, t('employerBilling.form.validation.required')),
        cardNumber: z.string().refine(passesLuhn, t('employerBilling.form.validation.cardNumber')),
        expiry: z.string().refine(futureExpiry, t('employerBilling.form.validation.expiry')),
        cvc: z.string().regex(/^\d{3,4}$/, t('employerBilling.form.validation.cvc')),
      }),
    [t],
  );

  const form = useForm<PaymentMethodInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      holderName: paymentMethod?.holderName ?? '',
      cardNumber: '',
      expiry: paymentMethod?.expiry ?? '',
      cvc: '',
    },
  });

  const submit = form.handleSubmit(async (values) => {
    setSaved(false);
    await onSave(values);
    setSaved(true);
    form.reset({ holderName: values.holderName, cardNumber: '', expiry: values.expiry, cvc: '' });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {paymentMethod ? (
        <div className="rounded-lg border border-subtle bg-surface-overlay p-4">
          <p className="text-sm font-medium text-foreground">{t('employerBilling.form.currentMethod')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {paymentMethod.brand.toUpperCase()} **** {paymentMethod.last4} · {paymentMethod.expiry}
          </p>
        </div>
      ) : null}

      {saved ? (
        <Alert variant="success">
          <AlertDescription>{t('employerBilling.form.saved')}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="holderName">{t('employerBilling.form.holderName')}</Label>
          <Input id="holderName" aria-invalid={!!form.formState.errors.holderName} {...form.register('holderName')} />
          <FieldError message={form.formState.errors.holderName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardNumber">{t('employerBilling.form.cardNumber')}</Label>
          <Input id="cardNumber" inputMode="numeric" placeholder="4242 4242 4242 4242" aria-invalid={!!form.formState.errors.cardNumber} {...form.register('cardNumber')} />
          <FieldError message={form.formState.errors.cardNumber?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry">{t('employerBilling.form.expiry')}</Label>
          <Input id="expiry" placeholder="MM/YY" aria-invalid={!!form.formState.errors.expiry} {...form.register('expiry')} />
          <FieldError message={form.formState.errors.expiry?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc">{t('employerBilling.form.cvc')}</Label>
          <Input id="cvc" inputMode="numeric" aria-invalid={!!form.formState.errors.cvc} {...form.register('cvc')} />
          <FieldError message={form.formState.errors.cvc?.message} />
        </div>
      </div>

      <Button type="submit" loading={form.formState.isSubmitting}>
        <Save aria-hidden />
        {t('employerBilling.form.save')}
      </Button>
    </form>
  );
}
