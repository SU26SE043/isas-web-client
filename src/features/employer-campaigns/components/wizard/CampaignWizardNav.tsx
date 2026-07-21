import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface CampaignWizardNavProps {
  onBack?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onPublish?: () => void;
  nextLabel?: string;
  backLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  publishDisabled?: boolean;
  isSaving?: boolean;
  isPublishing?: boolean;
  showPublish?: boolean;
  className?: string;
}

export function CampaignWizardNav({
  onBack,
  onCancel,
  onNext,
  onPublish,
  nextLabel,
  backLabel,
  backDisabled = false,
  nextDisabled = false,
  publishDisabled = false,
  isSaving = false,
  isPublishing = false,
  showPublish = false,
  className,
}: CampaignWizardNavProps) {
  const { t } = useLanguage();
  const leftAction = onCancel ?? onBack;
  const leftLabel =
    backLabel ??
    (onCancel ? t('employer.campaigns.wizard.cancel') : t('employer.campaigns.wizard.previous'));

  return (
    <div
      className={cn(
        'mt-auto flex flex-col-reverse gap-3 border-t border-satin pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
        className,
      )}
    >
      {leftAction ? (
        <button
          type="button"
          className="btn-secondary"
          disabled={backDisabled || isSaving || isPublishing}
          onClick={leftAction}
        >
          {leftLabel}
        </button>
      ) : (
        <span />
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {showPublish && onPublish ? (
          <button
            type="button"
            className="btn-primary"
            disabled={publishDisabled || isSaving || isPublishing}
            onClick={onPublish}
          >
            {isPublishing
              ? t('employer.campaigns.wizard.publishing')
              : isSaving
                ? t('employer.campaigns.wizard.savingProgress')
                : t('employer.campaigns.wizard.publishCampaign')}
          </button>
        ) : onNext ? (
          <button
            type="button"
            className="btn-primary"
            disabled={nextDisabled || isSaving || isPublishing}
            onClick={onNext}
          >
            {isSaving
              ? (nextLabel ?? t('employer.campaigns.wizard.savingProgress'))
              : (nextLabel ?? t('employer.campaigns.wizard.next'))}
          </button>
        ) : null}
      </div>
    </div>
  );
}
