import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignSettingsState } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignSettingsStepProps {
  settings: CampaignSettingsState;
  error?: string | null;
  onChange: (patch: Partial<CampaignSettingsState>) => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

function ToggleRow({
  id,
  checked,
  label,
  help,
  disabled,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  help: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-satin bg-surface-overlay px-4 py-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 rounded border-satin"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="mt-1 text-xs text-muted-foreground">{help}</p>
      </div>
    </div>
  );
}

export function CampaignSettingsStep({
  settings,
  error,
  onChange,
  onBack,
  onNext,
  isSaving,
}: CampaignSettingsStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Settings className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.settings')}
      description={t('employer.campaigns.wizard.steps.settingsDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={isSaving}
          backDisabled={isSaving}
        />
      }
    >
      <div className="space-y-6">
        {error ? <FieldError message={error} /> : null}

        <section className="grid gap-4 md:grid-cols-2">
          <ToggleRow
            id="settings-anti-cheat"
            checked={settings.antiCheatEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.antiCheat')}
            help={t('employer.campaigns.form.antiCheatHelp')}
            onChange={(antiCheatEnabled) => onChange({ antiCheatEnabled })}
          />
          <ToggleRow
            id="settings-face-verify"
            checked={settings.faceVerifyEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.faceVerify')}
            help={t('employer.campaigns.form.faceVerifyHelp')}
            onChange={(faceVerifyEnabled) => onChange({ faceVerifyEnabled })}
          />
          <ToggleRow
            id="settings-adaptive"
            checked={settings.adaptiveEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.adaptive')}
            help={t('employer.campaigns.form.adaptiveHelp')}
            onChange={(adaptiveEnabled) => onChange({ adaptiveEnabled })}
          />
        </section>

        {settings.adaptiveEnabled ? (
          <section className="grid gap-4 rounded-xl border border-satin bg-surface-overlay p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-max-follow-ups">{t('employer.campaigns.form.maxFollowUps')}</Label>
              <Input
                id="settings-max-follow-ups"
                type="number"
                min={0}
                disabled={isSaving}
                value={settings.maxFollowUps}
                onChange={(e) =>
                  onChange({ maxFollowUps: Math.max(0, Number(e.target.value) || 0) })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('employer.campaigns.form.maxFollowUpsHelp')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-max-questions">{t('employer.campaigns.form.maxQuestionsSetting')}</Label>
              <Input
                id="settings-max-questions"
                type="number"
                min={0}
                max={20}
                disabled={isSaving}
                value={settings.maxQuestions}
                onChange={(e) =>
                  onChange({
                    maxQuestions: Math.min(20, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('employer.campaigns.form.maxQuestionsSettingHelp')}
              </p>
            </div>
          </section>
        ) : (
          <section className="max-w-sm space-y-2 rounded-xl border border-satin bg-surface-overlay p-4">
            <Label htmlFor="settings-max-questions">{t('employer.campaigns.form.maxQuestionsSetting')}</Label>
            <Input
              id="settings-max-questions"
              type="number"
              min={0}
              max={20}
              disabled={isSaving}
              value={settings.maxQuestions}
              onChange={(e) =>
                onChange({
                  maxQuestions: Math.min(20, Math.max(0, Number(e.target.value) || 0)),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('employer.campaigns.form.maxQuestionsSettingHelp')}
            </p>
          </section>
        )}
      </div>
    </SectionPanel>
  );
}
