import { useEffect, useId } from 'react';
import { Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useCampaignDeployOptionsStore } from '../../../stores/campaignDeployOptionsStore';
import {
  resolveStartNowOnDeploy,
  startNowBlocker,
  startNowChoiceKey,
  type StartNowBlocker,
} from '../../../utils/campaignStartNow';

export interface StartNowOnDeployState {
  /** Giá trị sẽ gửi cho deploy (blocker thắng → HR tick → mặc định D-6). */
  checked: boolean;
  blocker: StartNowBlocker | null;
  /** HR đã đụng checkbox chưa — để nói "bật sẵn vì ≤24h" chỉ khi đó là mặc định. */
  touched: boolean;
  setChecked: (checked: boolean) => void;
}

/**
 * Nguồn sự thật cho "Mở ngay khi triển khai" ở bước Review. Gọi ở `CampaignReviewStep` (để tóm
 * tắt lịch đổi theo) rồi truyền xuống `CampaignReviewDeployOptions` (thuần hiển thị).
 *
 * `status: 'active'` vì lúc start-now chạy thì publish đã xong (thứ tự publish → start-now → mời);
 * blocker thật ở đây là CÓ CA (D-3 "mở sớm phải nhìn ca") và ĐÃ TỚI GIỜ. Blocker được ghi vào
 * store để `handleFinalSubmit` không gửi start-now dù HR từng tick trước khi thêm ca.
 */
export function useStartNowOnDeploy({ campaignId, startsAt, slotCount }: { campaignId?: string; startsAt: string; slotCount: number }): StartNowOnDeployState {
  const key = startNowChoiceKey(campaignId, startsAt);
  const choice = useCampaignDeployOptionsStore((state) => (state.key === key ? state.choice : null));
  const setChoice = useCampaignDeployOptionsStore((state) => state.setChoice);
  const setBlocked = useCampaignDeployOptionsStore((state) => state.setBlocked);
  const blocker = startNowBlocker({ status: 'active', startsAt, slotCount });
  const blocked = blocker !== null;
  useEffect(() => {
    setBlocked(key, blocked);
  }, [blocked, key, setBlocked]);
  return {
    checked: resolveStartNowOnDeploy({ choice, blocked, startsAt }),
    blocker,
    touched: choice !== null,
    setChecked: (next) => setChoice(key, next),
  };
}

interface CampaignReviewDeployOptionsProps {
  startNow: StartNowOnDeployState;
  slotCount: number;
  formattedStart: string;
  disabled?: boolean;
}

export function CampaignReviewDeployOptions({ startNow, slotCount, formattedStart, disabled = false }: CampaignReviewDeployOptionsProps) {
  const { t } = useLanguage();
  const id = useId();
  const { checked, blocker, touched, setChecked } = startNow;
  const reason = blocker === 'hasSlots'
    ? t('employer.campaigns.wizard.deploy.startNowBlockedHasSlots').replace('{{n}}', String(slotCount))
    : blocker === 'notFuture'
      ? t('employer.campaigns.wizard.deploy.startNowBlockedNotFuture').replace('{{start}}', formattedStart)
      : null;
  return (
    <section className="frame-satin rounded-xl bg-surface-overlay p-4" aria-labelledby={`${id}-title`}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 size-4 rounded border-satin"
          checked={checked}
          disabled={disabled || blocker !== null}
          aria-describedby={`${id}-desc`}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <div className="min-w-0 space-y-1">
          <Label htmlFor={id} id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="size-4 text-info" aria-hidden />
            {t('employer.campaigns.wizard.deploy.startNowLabel')}
          </Label>
          <p id={`${id}-desc`} className="text-sm text-muted-foreground">
            {t('employer.campaigns.wizard.deploy.startNowDescription').replace('{{start}}', formattedStart)}
          </p>
          {reason ? <p className="text-sm text-warning" data-testid="start-now-blocked">{reason}</p> : null}
          {!blocker && checked && !touched ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.deploy.startNowDefaultHint')}</p> : null}
        </div>
      </div>
    </section>
  );
}
