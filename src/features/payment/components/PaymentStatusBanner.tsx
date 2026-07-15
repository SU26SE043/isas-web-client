import { useLanguage } from '@/shared/languages';

type PaymentBannerVariant = 'success' | 'error' | 'pending';

interface PaymentStatusBannerProps {
  variant: PaymentBannerVariant;
  title?: string;
  description?: string;
}

const variantClass: Record<PaymentBannerVariant, string> = {
  success: 'border-success/20 bg-success-bg text-success',
  error: 'border-error/20 bg-error-bg text-error',
  pending: 'border-subtle bg-surface-overlay text-foreground',
};

export function PaymentStatusBanner({ variant, title, description }: PaymentStatusBannerProps) {
  const { t } = useLanguage();

  return (
    <div className={['rounded-xl border px-4 py-3', variantClass[variant]].join(' ')}>
      <p className="font-semibold">{title ?? t(`payment.callback.${variant}Title`)}</p>
      {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
    </div>
  );
}
