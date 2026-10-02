import { Ban, BadgeCheck, Play, RotateCcw, Timer } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CandidateAttemptView } from '../utils/campaignAttemptState';
import { fillTemplate } from '../utils/campaignAttemptState';

/**
 * ATT1-F3 — luật làm bài + bốn trạng thái lượt ở trang chiến dịch của ứng viên.
 * KHÔNG đếm ngược ở đây: Campaign không biết giờ vào phòng (đồng hồ chạy từ begin trong phòng thi).
 */

interface RulesMetaProps {
  timeLimitMinutes?: number | null;
  maxAttempts?: number;
}

/** Hàng thông tin ở header: "⏱ Thời lượng 30 phút · ↻ 1 lần làm". Field vắng ⇒ không hiện. */
export function CampaignAttemptRulesMeta({ timeLimitMinutes, maxAttempts }: RulesMetaProps) {
  const { t } = useLanguage();
  return (
    <>
      {typeof timeLimitMinutes === 'number' ? (
        <span data-testid="campaign-rule-duration" className="inline-flex items-center gap-2">
          <Timer className="size-4 text-info" aria-hidden />
          {fillTemplate(t('campaigns.detail.attempt.duration'), { n: timeLimitMinutes })}
        </span>
      ) : null}
      {typeof maxAttempts === 'number' ? (
        <span data-testid="campaign-rule-attempts" className="inline-flex items-center gap-2">
          <RotateCcw className="size-4 text-info" aria-hidden />
          {fillTemplate(
            t(maxAttempts === 1 ? 'campaigns.detail.attempt.maxOne' : 'campaigns.detail.attempt.maxMany'),
            { n: maxAttempts },
          )}
        </span>
      ) : null}
    </>
  );
}

interface AttemptActionProps {
  view: CandidateAttemptView;
  isStarting: boolean;
  /** Mở hộp thoại xác nhận (① Bắt đầu / ③ Làm lại). */
  onOpenConfirm: () => void;
  /** ② Tiếp tục — gọi lại start để dựng marker, không qua hộp thoại. */
  onContinue: () => void;
  /** Lỗi start khi KHÔNG có hộp thoại mở (đường "Tiếp tục"). */
  inlineError?: string | null;
}

export function CampaignAttemptAction({ view, isStarting, onOpenConfirm, onContinue, inlineError }: AttemptActionProps) {
  const { t } = useLanguage();
  const errorLine = inlineError ? <p className="text-sm text-error" role="alert">{inlineError}</p> : null;

  if (view.kind === 'completed') {
    return (
      <p className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-success/35 bg-success/10 px-4 py-3 text-sm font-semibold text-success-light">
        <BadgeCheck className="size-4" aria-hidden />
        {t('campaigns.my.interview.completed')}
      </p>
    );
  }

  if (view.kind === 'exhausted') {
    return (
      <div data-testid="campaign-attempt-exhausted" role="status" className="rounded-xl border border-error/30 bg-error-bg px-4 py-3 text-sm">
        <p data-testid="campaign-attempt-exhausted-text" className="flex items-start gap-2 font-medium text-foreground">
          <Ban className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
          {fillTemplate(t('campaigns.detail.attempt.exhausted'), { used: view.used, max: view.max })}
        </p>
        <p className="mt-1 pl-6 text-muted-foreground">{t('campaigns.detail.attempt.contactEmployer')}</p>
      </div>
    );
  }

  if (view.kind === 'continue') {
    return (
      <div className="space-y-3">
        {view.tracked ? (
          <p data-testid="campaign-attempt-in-progress" className="inline-flex items-center gap-2 text-sm font-medium text-warning-light">
            <span className="size-2 rounded-full bg-current" aria-hidden />
            {t('campaigns.detail.attempt.inProgress')}
          </p>
        ) : null}
        <button type="button" disabled={isStarting} className="btn-primary inline-flex w-full justify-center gap-2" onClick={onContinue}>
          <Play className="size-4" aria-hidden />
          {t('campaigns.detail.continue')}
        </button>
        {errorLine}
      </div>
    );
  }

  if (view.kind === 'retry') {
    return (
      <div data-testid="campaign-attempt-retry" className="space-y-3">
        <div className="space-y-1 text-sm">
          <p data-testid="campaign-attempt-retry-ended" className="text-muted-foreground">
            {fillTemplate(t('campaigns.detail.attempt.retryEnded'), { n: view.lastAttemptNo })}
          </p>
          <p data-testid="campaign-attempt-retry-remaining" className="font-medium text-foreground">
            {fillTemplate(t('campaigns.detail.attempt.retryRemaining'), { remaining: view.remaining, max: view.max })}
          </p>
        </div>
        <button type="button" className="btn-primary inline-flex w-full justify-center gap-2" onClick={onOpenConfirm}>
          <RotateCcw className="size-4" aria-hidden />
          {fillTemplate(t('campaigns.detail.attempt.retryCta'), { n: view.attemptNo })}
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="btn-primary inline-flex w-full justify-center gap-2" onClick={onOpenConfirm}>
      <Play className="size-4" aria-hidden />
      {t('campaigns.detail.start')}
    </button>
  );
}
