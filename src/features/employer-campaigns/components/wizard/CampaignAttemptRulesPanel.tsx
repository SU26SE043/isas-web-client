import { SelectionOption } from '@/components/ui/selection-option';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import {
  CAMPAIGN_MAX_ATTEMPT_OPTIONS,
  CAMPAIGN_TIME_LIMIT_MAX_MINUTES,
  CAMPAIGN_TIME_LIMIT_MIN_MINUTES,
  estimateCampaignSitting,
} from '../../utils/campaignAttemptRules';
import { WizardNumberField } from './WizardNumberField';

export type CampaignAttemptRulesPatch = { timeLimitMinutes?: number; maxAttempts?: number };

interface CampaignAttemptRulesPanelProps {
  timeLimitMinutes: number;
  maxAttempts: number;
  /** K — số câu gốc mỗi buổi (`questionsPerSession ?? số câu đã soạn`). */
  baseQuestionCount: number;
  adaptiveEnabled: boolean;
  maxDeepPerQuestion?: number;
  invalid?: boolean;
  disabled?: boolean;
  onChange: (patch: CampaignAttemptRulesPatch) => void;
}

/**
 * ATT1 — khối "Luật làm bài" ở đầu bước 5. Đây là NGUỒN DUY NHẤT của ô thời lượng (đã gỡ khỏi bước Mời):
 * giá trị này nay là luật server áp (đồng hồ cả buổi), không còn chỉ in vào thư mời.
 * Dòng ước tính chỉ CẢNH BÁO (màu warning) khi thời lượng thấp hơn — không chặn lưu.
 */
export function CampaignAttemptRulesPanel({
  timeLimitMinutes, maxAttempts, baseQuestionCount, adaptiveEnabled, maxDeepPerQuestion, invalid, disabled, onChange,
}: CampaignAttemptRulesPanelProps) {
  const { t } = useLanguage();
  const f = 'employer.campaigns.form.attemptRules';
  const estimate = estimateCampaignSitting(baseQuestionCount, adaptiveEnabled, maxDeepPerQuestion);
  const belowEstimate = estimate.minutes > 0 && timeLimitMinutes < estimate.minutes;
  const estimateText = t(estimate.depth > 0 ? `${f}.estimateAdaptive` : `${f}.estimate`)
    .replace('{{minutes}}', String(estimate.minutes))
    .replace('{{k}}', String(estimate.baseQuestionCount))
    .replace('{{d}}', String(estimate.depth));

  return (
    <section
      aria-labelledby="campaign-attempt-rules-title"
      className="space-y-5 rounded-xl border border-satin bg-surface-overlay p-4"
      data-testid="campaign-attempt-rules"
    >
      <h3 id="campaign-attempt-rules-title" className="text-sm font-semibold text-foreground">{t(`${f}.title`)}</h3>

      <div className="space-y-2">
        <div className="max-w-sm">
          <WizardNumberField
            id="campaign-time-limit"
            label={t('employer.campaigns.form.timeLimitMinutes')}
            tag={t(`${f}.timeLimitRange`)
              .replace('{{min}}', String(CAMPAIGN_TIME_LIMIT_MIN_MINUTES))
              .replace('{{max}}', String(CAMPAIGN_TIME_LIMIT_MAX_MINUTES))}
            suffix={t('employer.campaigns.form.minutesSuffix')}
            help={t(`${f}.timeLimitHelp`)}
            value={timeLimitMinutes > 0 ? timeLimitMinutes : null}
            min={CAMPAIGN_TIME_LIMIT_MIN_MINUTES}
            max={CAMPAIGN_TIME_LIMIT_MAX_MINUTES}
            invalid={invalid}
            onChange={(value) => onChange({ timeLimitMinutes: value ?? 0 })}
          />
        </div>
        {estimate.minutes > 0 ? (
          <p
            data-testid="campaign-time-estimate"
            data-below-estimate={belowEstimate ? 'true' : 'false'}
            className={cn('text-xs leading-relaxed', belowEstimate ? 'text-warning' : 'text-muted-foreground')}
          >
            {estimateText}
            {belowEstimate ? ` ${t(`${f}.belowEstimate`)}` : null}
          </p>
        ) : null}
      </div>

      <div className="space-y-2" role="group" aria-labelledby="campaign-max-attempts-label">
        <p id="campaign-max-attempts-label" className="text-sm font-medium text-foreground">{t(`${f}.maxAttempts`)}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {CAMPAIGN_MAX_ATTEMPT_OPTIONS.map((option) => (
            <SelectionOption
              key={option}
              title={t(option === 1 ? `${f}.attemptOptionOne` : `${f}.attemptOptionMany`).replace('{{n}}', String(option))}
              selected={maxAttempts === option}
              disabled={disabled}
              showChevron={false}
              className="min-h-0 px-4 py-3"
              onClick={() => onChange({ maxAttempts: option })}
            />
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{t(`${f}.maxAttemptsHelp`)}</p>
      </div>
    </section>
  );
}
