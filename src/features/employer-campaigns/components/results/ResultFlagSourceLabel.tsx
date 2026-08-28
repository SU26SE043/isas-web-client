import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../types/campaign.api.types';

export function ResultFlagSourceLabel({ flag }: { flag: CampaignResultFlag }) {
  const { t } = useLanguage();

  if (flag.source !== 'Server') return null;

  return (
    <span className="frame-satin-soft ml-2 inline-flex rounded-full px-2 py-0.5 align-middle text-[11px] font-medium text-muted-foreground">
      {t('employer.campaigns.results.flags.recordedBySystem')}
    </span>
  );
}
