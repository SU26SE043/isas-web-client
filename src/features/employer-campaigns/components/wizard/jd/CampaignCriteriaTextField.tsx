import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { MAX_CRITERIA_TEXT_LENGTH } from '../../../utils/validateCampaignWizard';

interface CampaignCriteriaTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Freeform criteria notes captured alongside the JD (step 1) — maps to API `criteriaText`. */
export function CampaignCriteriaTextField({
  value,
  onChange,
  disabled = false,
}: CampaignCriteriaTextFieldProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 rounded-2xl border border-satin bg-surface-overlay p-4">
      <Label htmlFor="campaign-criteria-text">{t('employer.campaigns.wizard.criteriaTextLabel')}</Label>
      <textarea
        id="campaign-criteria-text"
        rows={4}
        value={value}
        maxLength={MAX_CRITERIA_TEXT_LENGTH}
        disabled={disabled}
        placeholder={t('employer.campaigns.wizard.criteriaTextPlaceholder')}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] w-full resize-y rounded-xl border border-satin bg-surface-base px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition focus-visible:border-[var(--border-focus)]"
      />
      <p className="text-right text-xs text-muted-foreground">{value.length}/{MAX_CRITERIA_TEXT_LENGTH.toLocaleString()}</p>
    </div>
  );
}
