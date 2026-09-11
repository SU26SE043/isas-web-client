import { Lock, Plus } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { CampaignRubricCriterionCard } from './criteria/CampaignRubricCriterionCard';
import { criteriaLockCopyKey, type CriteriaLockReason } from './criteria/criteriaLock';
import { CRITERIA_HEADER_PADDING, CRITERIA_ROW_GRID } from './criteria/criteriaRowGrid';

// Luật khoá nay sống ở `criteria/criteriaLock` vì popup chi tiết cũng đọc nó; giữ
// re-export ở đây để call site cũ không phải đổi đường import.
export { criteriaLockCopyKey };
export type { CriteriaLockReason };

interface CampaignCriteriaManualListProps {
  rubric: RubricCriterion[];
  disabled?: boolean;
  lockReason?: CriteriaLockReason;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
}

function createEmptyCriterion(): RubricCriterion {
  return {
    id: `new-${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    description: '',
    weight: 0,
    maxScore: 10,
  };
}

export function CampaignCriteriaManualList({
  rubric,
  disabled,
  lockReason,
  onChangeRubric,
}: CampaignCriteriaManualListProps) {
  const { t } = useLanguage();
  const isLocked = Boolean(disabled);
  const showLockNote = isLocked && rubric.length > 0;
  const lockNote = t(criteriaLockCopyKey(lockReason)).replace(
    '{{action}}',
    t('employer.campaigns.wizard.criteriaCustomize'),
  );

  const updateCriterion = (index: number, patch: Partial<RubricCriterion>) => {
    onChangeRubric(
      rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

  return (
    <>
      {showLockNote ? <div id="campaign-rubric-lock-note" role="status" className="frame-satin-soft mb-3 flex items-start gap-2.5 rounded-xl bg-surface-overlay/60 px-3.5 py-2.5">
        <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{t('employer.campaigns.wizard.rubric.lockedTitle')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{lockNote}</p>
        </div>
      </div> : null}

      {rubric.length > 0 ? <div className={cn('mb-3 hidden gap-3 text-caption text-muted-foreground lg:grid', CRITERIA_ROW_GRID, CRITERIA_HEADER_PADDING)}>
        <span>{t('employer.campaigns.wizard.rubric.colCriterion')}</span>
        <span>{t('employer.campaigns.wizard.rubric.colWeight')}</span>
        <span>{t('employer.campaigns.wizard.rubric.colMaxScore')}</span>
        <span className="sr-only">{t('employer.campaigns.wizard.rubric.remove')}</span>
      </div> : <div className="frame-satin rounded-2xl border border-dashed border-satin bg-surface-raised/60 px-5 py-6 text-center" role="status">
        <h3 className="text-base font-semibold text-foreground">{t('employer.campaigns.wizard.rubric.emptyTitle')}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('employer.campaigns.wizard.rubric.emptyDescription')}</p>
        <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
          <div className="frame-satin-soft rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{t('employer.campaigns.wizard.rubric.emptyStandardTitle')}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('employer.campaigns.wizard.rubric.emptyStandardHint')}</p>
          </div>
          <div className="frame-satin-soft rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{t('employer.campaigns.wizard.rubric.emptyManualTitle')}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('employer.campaigns.wizard.rubric.emptyManualHint')}</p>
          </div>
        </div>
      </div>}

      {/* Margin âm bù đúng phần padding nên bật/tắt khoá KHÔNG làm nhảy layout.
          `cursor-not-allowed` phải nằm ở lớp bọc: `Input` primitive có
          `disabled:pointer-events-none` ⇒ con trỏ của chính ô nhập không bao giờ hiện. */}
      <div
        aria-describedby={showLockNote ? 'campaign-rubric-lock-note' : undefined}
        className={cn(
          '-mx-2 space-y-3 rounded-xl px-2 py-2 transition-colors duration-200 ease-out',
          isLocked && 'cursor-not-allowed bg-surface-overlay/40',
        )}
      >
        {rubric.map((criterion, index) => (
          <CampaignRubricCriterionCard
            key={criterion.id}
            criterion={criterion}
            index={index}
            disabled={isLocked}
            lockReason={lockReason}
            onChange={(patch) => updateCriterion(index, patch)}
            onRemove={() => onChangeRubric(rubric.filter((item) => item.id !== criterion.id))}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={isLocked}
        onClick={() => onChangeRubric([...rubric, createEmptyCriterion()])}
        className={cn(
          'mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-satin px-4 py-5 text-center transition-[background-color,border-color,opacity] duration-200 ease-out',
          // Khi khoá thì KHÔNG phát ra class `hover:*`. Giữ chúng thì `:hover` vẫn khớp
          // trên nút disabled ⇒ nút sáng lên lúc rê chuột ⇒ trông vẫn bấm được.
          isLocked
            ? 'cursor-not-allowed bg-surface-overlay/40 opacity-60'
            : 'bg-transparent hover:border-[var(--satin-border-hover)] hover:bg-surface-overlay',
        )}
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          {isLocked ? <Lock className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {t('employer.campaigns.wizard.rubric.add')}
        </span>
        {isLocked ? <span className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.rubric.addLocked')}</span> : null}
      </button>
    </>
  );
}
