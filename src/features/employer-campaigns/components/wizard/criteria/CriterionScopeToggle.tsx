import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { RubricScoringScope } from '../../../types/campaignManagement.types';

interface CriterionScopeToggleProps {
  /** Vắng (chưa đọc qua mapper) coi như 'Always' — khớp mặc định server (INT-18). */
  scope?: RubricScoringScope;
  disabled?: boolean;
  onChange: (scope: RubricScoringScope) => void;
}

/**
 * SC2 — công tắc phạm vi chấm của MỘT tiêu chí, tách riêng khỏi `CampaignRubricCriterionCard`
 * (card đã sát trần 250 dòng). 'Always' = chấm mọi câu trả lời (mặc định, an toàn). 'WhenTargeted'
 * = CHỈ chấm khi có câu hỏi nhắm tới tiêu chí này (`CampaignQuestion.targetCriterionIds`) — không
 * câu nào nhắm tới thì tiêu chí bị LOẠI khỏi điểm tổng, KHÔNG tính 0 (INT-18). Tooltip (native
 * `title`, không phải overlay hẹn giờ) nói rõ hệ quả đó ngay trên công tắc.
 */
export function CriterionScopeToggle({ scope, disabled = false, onChange }: CriterionScopeToggleProps) {
  const { t } = useLanguage();
  const isAlways = scope !== 'WhenTargeted';
  const hint = t('employer.campaigns.wizard.rubric.scope.hint');
  // Bấm lại segment đang chọn thì KHÔNG phát `onChange`: wizard đánh dấu `autosaveStatus: 'dirty'` ("Chưa lưu")
  // ở mọi lần setRubric — một cú bấm không đổi gì mà nhãn đổi là báo oan.
  const select = (next: RubricScoringScope) => {
    if (next === (isAlways ? 'Always' : 'WhenTargeted')) return;
    onChange(next);
  };

  const optionClass = (active: boolean) =>
    cn(
      'rounded-lg px-2 py-1 text-xs font-medium transition-colors duration-200 ease-out',
      active ? 'bg-surface-raised text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      disabled && 'cursor-not-allowed opacity-60',
    );

  return (
    <div title={hint} className="inline-flex shrink-0 rounded-lg border border-satin bg-surface-overlay/70 p-0.5">
      <button
        type="button"
        aria-pressed={isAlways}
        disabled={disabled}
        onClick={() => select('Always')}
        className={optionClass(isAlways)}
      >
        {t('employer.campaigns.wizard.rubric.scope.always')}
      </button>
      <button
        type="button"
        aria-pressed={!isAlways}
        disabled={disabled}
        onClick={() => select('WhenTargeted')}
        className={optionClass(!isAlways)}
      >
        {t('employer.campaigns.wizard.rubric.scope.whenTargeted')}
      </button>
    </div>
  );
}
