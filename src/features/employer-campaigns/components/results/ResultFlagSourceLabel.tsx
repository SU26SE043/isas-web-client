import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../types/campaign.api.types';

export function ResultFlagSourceLabel({ flag }: { flag: CampaignResultFlag }) {
  if (flag.source !== 'Server') return null;
  return <RecordedBySystemBadge />;
}

/** Nhãn "Hệ thống ghi nhận" — cờ server tự suy ra, ứng viên không chặn được (MON1-B4). */
export function RecordedBySystemBadge() {
  const { t } = useLanguage();
  return (
    <span className="frame-satin-soft ml-2 inline-flex rounded-full px-2 py-0.5 align-middle text-[11px] font-medium text-muted-foreground">
      {t('employer.campaigns.results.flags.recordedBySystem')}
    </span>
  );
}
