import { useLanguage } from '@/shared/languages';
import { PRACTICE_RESERVE_ESTIMATE } from '../constants';

interface ReserveSettleBannerProps {
  mode: 'reserved' | 'settled';
  reservedTokens?: number;
  actualTokens?: number;
}

export function ReserveSettleBanner({
  mode,
  reservedTokens = PRACTICE_RESERVE_ESTIMATE,
  actualTokens,
}: ReserveSettleBannerProps) {
  const { t } = useLanguage();

  const message =
    mode === 'reserved'
      ? t('payment.reserve.banner').replace('{amount}', reservedTokens.toLocaleString())
      : t('payment.settle.banner')
          .replace('{actual}', String(actualTokens ?? 0))
          .replace('{reserved}', reservedTokens.toLocaleString());

  return (
    <div
      role="status"
      className="rounded-lg border border-subtle bg-surface-raised px-4 py-3 text-sm text-foreground"
    >
      {message}
    </div>
  );
}
