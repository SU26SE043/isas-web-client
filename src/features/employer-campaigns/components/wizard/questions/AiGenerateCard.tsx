import { FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { effectiveMaxQuestions } from '../../../utils/campaignQuestionLimits';

interface AiGenerateCardProps {
  isDraft: boolean;
  hasJd: boolean;
  questionCount: number;
  maxQuestions: number | null;
  useDefaultCount: boolean;
  currentQuestionCount: number;
  disabled: boolean;
  isGenerating: boolean;
  onQuestionCount: (count: number) => void;
  onUseDefaultCount: (value: boolean) => void;
  onGenerate: () => void;
}

export function AiGenerateCard({
  isDraft,
  hasJd,
  questionCount,
  maxQuestions,
  useDefaultCount,
  currentQuestionCount,
  disabled,
  isGenerating,
  onQuestionCount,
  onUseDefaultCount,
  onGenerate,
}: AiGenerateCardProps) {
  const { t } = useLanguage();
  const max = effectiveMaxQuestions(maxQuestions);
  const canGenerate = isDraft && hasJd && !disabled && !isGenerating;

  return (
    <section className="space-y-4 rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="flex items-start gap-3">
        <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Sparkles className="size-4 text-foreground" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.campaignQuestions.generator.title')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.campaignQuestions.generator.description')}
          </p>
        </div>
      </div>

      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" aria-hidden />
        {hasJd
          ? t('employer.campaigns.campaignQuestions.summary.jdAvailable')
          : t('employer.campaigns.campaignQuestions.summary.jdMissing')}
      </p>

      {!isDraft ? (
        <p className="text-xs text-warning" title={t('employer.campaigns.campaignQuestions.errors.draftOnly')}>
          {t('employer.campaigns.campaignQuestions.errors.draftOnly')}
        </p>
      ) : null}
      {isDraft && !hasJd ? (
        <p className="text-xs text-warning">{t('employer.campaigns.campaignQuestions.errors.jdRequired')}</p>
      ) : null}

      <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-satin"
          checked={useDefaultCount}
          disabled={disabled || isGenerating || !isDraft}
          onChange={(e) => onUseDefaultCount(e.target.checked)}
        />
        {t('employer.campaigns.campaignQuestions.generator.useDefaultCount')}
      </label>

      <div className="space-y-2">
        <Label htmlFor="ai-question-count">
          {t('employer.campaigns.campaignQuestions.generator.countLabel')}
        </Label>
        <Input
          id="ai-question-count"
          type="number"
          min={1}
          max={max}
          className="w-36"
          disabled={disabled || isGenerating || useDefaultCount || !isDraft}
          placeholder={t('employer.campaigns.campaignQuestions.generator.countPlaceholder')}
          value={questionCount}
          onChange={(e) =>
            onQuestionCount(Math.max(1, Math.min(max, Number(e.target.value) || 1)))
          }
        />
      </div>

      {currentQuestionCount > 0 ? (
        <p className="rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-xs text-warning">
          {t('employer.campaigns.campaignQuestions.overwrite.inlineWarning').replace(
            '{{count}}',
            String(currentQuestionCount),
          )}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={!canGenerate}
        loading={isGenerating}
        title={!isDraft ? t('employer.campaigns.campaignQuestions.errors.draftOnly') : undefined}
        onClick={onGenerate}
      >
        <Sparkles className="size-4" aria-hidden />
        {isGenerating
          ? t('employer.campaigns.campaignQuestions.generator.generating')
          : currentQuestionCount > 0
            ? t('employer.campaigns.campaignQuestions.generator.regenerate')
            : t('employer.campaigns.campaignQuestions.generator.generate')}
      </Button>
    </section>
  );
}
