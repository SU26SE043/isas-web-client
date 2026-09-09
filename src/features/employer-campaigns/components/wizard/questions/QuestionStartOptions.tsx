import { FileSpreadsheet, PenLine, Sparkles } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface QuestionStartOptionsProps {
  hasJd: boolean;
  disabled?: boolean;
  onGenerateAi: () => void;
  onImportCsv?: () => void;
  onAddManual: () => void;
}

export function QuestionStartOptions({
  hasJd,
  disabled = false,
  onGenerateAi,
  onImportCsv,
  onAddManual,
}: QuestionStartOptionsProps) {
  const { t } = useLanguage();
  const options = [
    {
      key: 'ai',
      icon: Sparkles,
      title: t('employer.campaigns.campaignQuestions.start.ai'),
      description: hasJd
        ? t('employer.campaigns.campaignQuestions.start.aiHint')
        : t('employer.campaigns.campaignQuestions.start.aiNeedsJd'),
      onClick: onGenerateAi,
      disabled: disabled || !hasJd,
    },
    {
      key: 'csv',
      icon: FileSpreadsheet,
      title: t('employer.campaigns.campaignQuestions.start.csv'),
      description: t('employer.campaigns.campaignQuestions.start.csvHint'),
      onClick: onImportCsv,
      disabled: disabled || !onImportCsv,
    },
    {
      key: 'manual',
      icon: PenLine,
      title: t('employer.campaigns.campaignQuestions.start.manual'),
      description: t('employer.campaigns.campaignQuestions.start.manualHint'),
      onClick: onAddManual,
      disabled,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map(({ key, icon: Icon, title, description, onClick, disabled: optionDisabled }) => (
        <button
          key={key}
          type="button"
          disabled={optionDisabled}
          onClick={onClick}
          className={cn(
            'frame-satin flex min-h-36 flex-col items-start rounded-xl bg-surface-overlay p-4 text-left transition-colors hover:bg-surface-raised',
            optionDisabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="frame-satin-soft flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="mt-4 text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</span>
        </button>
      ))}
    </div>
  );
}
