import { ArrowDown, ArrowUp, Sparkles, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';

interface CampaignQuestionCardProps {
  question: CampaignQuestion;
  index: number;
  total: number;
  disabled?: boolean;
  onChangePrompt: (prompt: string) => void;
  onToggleRequired: (isRequired: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function CampaignQuestionCard({
  question,
  index,
  total,
  disabled = false,
  onChangePrompt,
  onToggleRequired,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CampaignQuestionCardProps) {
  const { t } = useLanguage();
  const isAi = question.source === 'ai';

  return (
    <li className="space-y-3 rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="frame-satin-soft flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          {question.questionGroup ? <span className="rounded-md border border-satin px-2 py-0.5 text-xs text-muted-foreground">{question.questionGroup}</span> : null}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
              isAi
                ? 'border-satin bg-white/[0.06] text-foreground'
                : 'border-satin bg-surface-base text-muted-foreground',
            )}
          >
            {isAi ? <Sparkles className="size-3" aria-hidden /> : <User className="size-3" aria-hidden />}
            {isAi
              ? t('employer.campaigns.campaignQuestions.source.aiGenerated')
              : t('employer.campaigns.campaignQuestions.source.customHr')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled || index === 0}
            onClick={onMoveUp}
            aria-label={t('employer.campaigns.campaignQuestions.question.moveUp')}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled || index === total - 1}
            onClick={onMoveDown}
            aria-label={t('employer.campaigns.campaignQuestions.question.moveDown')}
          >
            <ArrowDown className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onRemove}
            aria-label={t('employer.campaigns.campaignQuestions.question.delete')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`q-${question.id}`} className="sr-only">
          {t('employer.campaigns.campaignQuestions.question.contentLabel')}
        </Label>
        <textarea
          id={`q-${question.id}`}
          rows={3}
          disabled={disabled}
          className="w-full whitespace-normal rounded-lg border border-satin bg-surface-base px-3 py-2 text-sm outline-none transition focus-visible:border-[var(--border-focus)]"
          style={{ overflowWrap: 'anywhere' }}
          value={question.prompt}
          placeholder={t('employer.campaigns.campaignQuestions.question.contentPlaceholder')}
          onChange={(e) => onChangePrompt(e.target.value)}
        />
      </div>

      <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-satin"
          disabled={disabled}
          checked={question.isRequired}
          onChange={(e) => onToggleRequired(e.target.checked)}
        />
        {question.isRequired
          ? t('employer.campaigns.campaignQuestions.question.required')
          : t('employer.campaigns.campaignQuestions.question.optional')}
      </label>
    </li>
  );
}
