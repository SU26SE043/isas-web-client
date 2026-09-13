import { ArrowDown, ArrowUp, CheckCircle2, ChevronDown, Loader2, Sparkles, Trash2, User } from 'lucide-react';
import { Collapsible } from '@base-ui/react/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';

const MAX_CRITERIA_CHIPS = 2;

export interface QuestionCardHeaderProps {
  question: CampaignQuestion;
  index: number;
  total: number;
  open: boolean;
  disabled: boolean;
  /** Tên các tiêu chí câu này nhắm tới (đã resolve từ id) — chip ở hàng đầu. */
  targetNames: string[];
  hasPreviewRun: boolean;
  /** Vị trí (1-based) của câu đang có lượt chấm thử bay, nếu có — hiện trên MỌI card. */
  runningPosition: number | null;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

/** Tên tiêu chí theo id, giữ thứ tự của nhãn; id lệch phiên bản (không còn trong rubric) bị bỏ qua. */
export function resolveTargetNames(rubric: RubricCriterion[], targetIds: string[] | null | undefined): string[] {
  if (!targetIds?.length) return [];
  const byId = new Map(rubric.map((criterion) => [criterion.id, criterion.name] as const));
  return targetIds.map((id) => byId.get(id)).filter((name): name is string => Boolean(name));
}

/**
 * SC2 · T9 — hàng đầu của card: `Collapsible.Trigger` là NỘI DUNG (STT · prompt · chip); các nút lên/xuống/xoá
 * nằm NGOÀI trigger vì lồng `<button>` trong `<button>` là HTML sai và trình đọc màn hình đọc thành một nút.
 */
export function QuestionCardHeader({ question, index, total, open, disabled, targetNames, hasPreviewRun, runningPosition, onMoveUp, onMoveDown, onRemove }: QuestionCardHeaderProps) {
  const { t } = useLanguage();
  const isAi = question.source === 'ai';
  const prompt = question.prompt.trim();
  const visibleNames = targetNames.slice(0, MAX_CRITERIA_CHIPS);
  const hiddenCount = targetNames.length - visibleNames.length;

  return (
    <div className="flex items-start gap-2">
      <Collapsible.Trigger
        className="flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
      >
        <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className={cn('block text-sm text-foreground', !open && 'line-clamp-2', !prompt && 'text-muted-foreground italic')} data-testid="question-card-prompt">
            {prompt || t('employer.campaigns.questionCard.emptyPrompt')}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg border border-satin px-2 py-0.5 text-xs text-muted-foreground">
              {question.questionGroup || t('employer.campaigns.campaignQuestions.question.commonGroup')}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium', isAi ? 'border-foreground bg-foreground text-background' : 'border-satin bg-surface-base text-muted-foreground')}>
              {isAi ? <Sparkles className="size-3" aria-hidden /> : <User className="size-3" aria-hidden />}
              {isAi ? t('employer.campaigns.campaignQuestions.source.aiGenerated') : t('employer.campaigns.campaignQuestions.source.customHr')}
            </span>
            {visibleNames.map((name) => (
              <span key={name} className="rounded-lg border border-info/30 bg-info-bg px-2 py-0.5 text-xs text-info" data-testid="question-card-criterion-chip">
                {name}
              </span>
            ))}
            {hiddenCount > 0 ? (
              <span className="rounded-lg border border-info/30 bg-info-bg px-2 py-0.5 text-xs text-info" data-testid="question-card-criterion-more">
                {t('employer.campaigns.questionCard.moreCriteria').replace('{{n}}', String(hiddenCount))}
              </span>
            ) : null}
            {runningPosition != null ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" data-testid="question-card-running">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                {t('employer.campaigns.questionCard.previewRunning').replace('{{n}}', String(runningPosition))}
              </span>
            ) : hasPreviewRun ? (
              <span className="inline-flex items-center gap-1 text-xs text-success" data-testid="question-card-preview-done">
                <CheckCircle2 className="size-3" aria-hidden />
                {t('employer.campaigns.questionCard.previewDone')}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown className={cn('mt-2 size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
      </Collapsible.Trigger>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || index === 0} onClick={onMoveUp} aria-label={t('employer.campaigns.campaignQuestions.question.moveUp')}>
          <ArrowUp className="size-4" aria-hidden />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || index === total - 1} onClick={onMoveDown} aria-label={t('employer.campaigns.campaignQuestions.question.moveDown')}>
          <ArrowDown className="size-4" aria-hidden />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} onClick={onRemove} aria-label={t('employer.campaigns.campaignQuestions.question.delete')} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
