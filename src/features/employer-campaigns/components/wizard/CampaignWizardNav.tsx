import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface CampaignWizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  saveDisabled?: boolean;
  publishDisabled?: boolean;
  isSaving?: boolean;
  isPublishing?: boolean;
  showPublish?: boolean;
  className?: string;
}

export function CampaignWizardNav({
  onBack,
  onNext,
  onSaveDraft,
  onPublish,
  nextLabel,
  backDisabled = false,
  nextDisabled = false,
  saveDisabled = false,
  publishDisabled = false,
  isSaving = false,
  isPublishing = false,
  showPublish = false,
  className,
}: CampaignWizardNavProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'mt-auto flex flex-col-reverse gap-3 border-t border-satin pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
        className,
      )}
    >
      <button type="button" className="btn-secondary" disabled={backDisabled} onClick={onBack}>
        {t('employer.campaigns.wizard.previous')}
      </button>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {onSaveDraft ? (
          <button
            type="button"
            className="btn-secondary"
            disabled={saveDisabled || isSaving || isPublishing}
            onClick={onSaveDraft}
          >
            {isSaving ? t('employer.campaigns.wizard.saving') : t('employer.campaigns.wizard.save')}
          </button>
        ) : null}

        {showPublish && onPublish ? (
          <button
            type="button"
            className="btn-primary"
            disabled={publishDisabled || isSaving || isPublishing}
            onClick={onPublish}
          >
            {isPublishing
              ? t('employer.campaigns.wizard.publishing')
              : t('employer.campaigns.wizard.publish')}
          </button>
        ) : onNext ? (
          <button
            type="button"
            className="btn-primary"
            disabled={nextDisabled || isSaving || isPublishing}
            onClick={onNext}
          >
            {nextLabel ?? t('employer.campaigns.wizard.next')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
