import { Camera, CheckSquare, Clock, Sun } from 'lucide-react';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';

const CHECKLIST = [
  { key: 'practice.flow.prepare.checkQuiet', icon: Sun },
  { key: 'practice.flow.prepare.checkCamera', icon: Camera },
  { key: 'practice.flow.prepare.checkTime', icon: Clock },
] as const;

interface PreparationChecklistStepProps {
  consentAccepted: boolean;
  consentKey: string;
  canContinue: boolean;
  consentDisabled?: boolean;
  onCancel: () => void;
  onConsentChange: (checked: boolean) => void;
  onContinue: () => void;
}

export function PreparationChecklistStep({
  consentAccepted,
  consentKey,
  canContinue,
  consentDisabled = false,
  onCancel,
  onConsentChange,
  onContinue,
}: PreparationChecklistStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<CheckSquare className="size-4" aria-hidden />}
      footer={
        <FlowWizardNav
          backLabel={t('practice.flow.cancel')}
          nextLabel={t('practice.flow.continue')}
          onBack={onCancel}
          onNext={onContinue}
          nextDisabled={!canContinue}
        />
      }
    >
      <ul className="divide-y divide-[color-mix(in_srgb,var(--isas-silver-200)_16%,transparent)]">
        {CHECKLIST.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <span className="frame-satin-soft mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">{t(key)}</p>
          </li>
        ))}
      </ul>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-satin bg-white/[0.03] px-4 py-3.5">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-satin bg-surface-overlay accent-white"
          checked={consentAccepted}
          disabled={consentDisabled}
          onChange={(event) => onConsentChange(event.target.checked)}
        />
        <span className="text-sm font-medium text-foreground">{t(consentKey)}</span>
      </label>
    </SectionPanel>
  );
}
