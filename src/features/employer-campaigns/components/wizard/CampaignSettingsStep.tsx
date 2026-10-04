import { Settings } from 'lucide-react';
import { SelectionOption } from '@/components/ui/selection-option';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignSettingsState } from '../../types/campaignWizard.types';
import {
  calculateAdaptiveQuestionBudget,
  deriveCampaignMaxQuestions,
} from '../../utils/campaignAdaptiveBudget';
import { isValidCampaignTimeLimit } from '../../utils/campaignAttemptRules';
import { CampaignAttemptRulesPanel, type CampaignAttemptRulesPatch } from './CampaignAttemptRulesPanel';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

const ADAPTIVE_PRESETS = [
  { key: 'off', followUps: 0 },
  { key: 'light', followUps: 1 },
  { key: 'deep', followUps: 5 },
] as const;

interface CampaignSettingsStepProps {
  settings: CampaignSettingsState;
  /** ATT1 — "Luật làm bài" sống ở `info` (gửi lên cùng metadata), nhưng ô nhập nằm ở bước này. */
  timeLimitMinutes: number;
  maxAttempts: number;
  onRulesChange: (patch: CampaignAttemptRulesPatch) => void;
  error?: string | null;
  onChange: (patch: Partial<CampaignSettingsState>) => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
  questionCount?: number;
}

function ToggleRow({
  id,
  checked,
  label,
  disabled,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
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
      </div>
    </div>
  );
}

export function CampaignSettingsStep({
  settings,
  timeLimitMinutes,
  maxAttempts,
  onRulesChange,
  error,
  onChange,
  onBack,
  onNext,
  isSaving,
  questionCount = 0,
}: CampaignSettingsStepProps) {
  const { t } = useLanguage();
  const adaptiveBudget = calculateAdaptiveQuestionBudget(
    questionCount,
    settings.maxDeepPerQuestion,
    settings.adaptiveEnabled,
  );
  const derivedMaxQuestions = deriveCampaignMaxQuestions(
    questionCount,
    settings.adaptiveEnabled,
    settings.maxDeepPerQuestion,
  );
  const baseQuestionCount = Number.isFinite(questionCount) ? Math.max(0, Math.floor(questionCount)) : 0;

  return (
    <SectionPanel
      icon={<Settings className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.settings')}
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

        <CampaignAttemptRulesPanel
          timeLimitMinutes={timeLimitMinutes}
          maxAttempts={maxAttempts}
          baseQuestionCount={questionCount}
          adaptiveEnabled={settings.adaptiveEnabled}
          maxDeepPerQuestion={settings.maxDeepPerQuestion}
          invalid={Boolean(error) && !isValidCampaignTimeLimit(timeLimitMinutes)}
          disabled={isSaving}
          onChange={onRulesChange}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <ToggleRow
            id="settings-anti-cheat"
            checked={settings.antiCheatEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.antiCheat')}
            onChange={(antiCheatEnabled) => onChange({ antiCheatEnabled })}
          />
          <ToggleRow
            id="settings-face-verify"
            checked={settings.faceVerifyEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.faceVerify')}
            onChange={(faceVerifyEnabled) => onChange({ faceVerifyEnabled })}
          />
          <ToggleRow
            id="settings-adaptive"
            checked={settings.adaptiveEnabled}
            disabled={isSaving}
            label={t('employer.campaigns.form.adaptive')}
            onChange={(adaptiveEnabled) => onChange({ adaptiveEnabled })}
          />
        </section>

        {settings.adaptiveEnabled ? (
          <section className="grid gap-4 rounded-xl border border-satin bg-surface-overlay p-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-foreground">{t('employer.campaigns.form.adaptiveDepth')}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {ADAPTIVE_PRESETS.map((preset) => {
                  const depth = preset.key === 'light' ? 1 : preset.key === 'deep' ? 3 : 0;
                  return (
                    <SelectionOption
                      key={preset.key}
                      title={t(`employer.campaigns.form.adaptivePreset.${preset.key}`)}
                      description={`d=${depth}`}
                      selected={settings.maxDeepPerQuestion === depth}
                      disabled={isSaving}
                      onClick={() => onChange({ maxDeepPerQuestion: depth, maxFollowUps: preset.followUps })}
                      showChevron={false}
                    />
                  );
                })}
              </div>
              {adaptiveBudget.exceedsLimit ? (
                <p role="alert" className="text-sm text-warning">
                  {t('employer.campaigns.form.adaptiveBudgetWarning').replace(
                    '{max}',
                    String(adaptiveBudget.maxBaseQuestionCount),
                  )}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-max-follow-ups">{t('employer.campaigns.form.maxFollowUps')}</Label>
              <Input
                id="settings-max-follow-ups"
                type="number"
                min={0}
                max={20}
                step={1}
                disabled={isSaving}
                value={settings.maxFollowUps}
                onChange={(e) =>
                  onChange({ maxFollowUps: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
            <DerivedMaxQuestionsSummary
              baseQuestionCount={baseQuestionCount}
              derivedMaxQuestions={derivedMaxQuestions}
              adaptiveEnabled={settings.adaptiveEnabled}
              maxDeepPerQuestion={settings.maxDeepPerQuestion}
              t={t}
            />
          </section>
        ) : (
          <section className="max-w-sm rounded-xl border border-satin bg-surface-overlay p-4">
            <DerivedMaxQuestionsSummary
              baseQuestionCount={baseQuestionCount}
              derivedMaxQuestions={derivedMaxQuestions}
              adaptiveEnabled={settings.adaptiveEnabled}
              maxDeepPerQuestion={settings.maxDeepPerQuestion}
              t={t}
            />
          </section>
        )}
      </div>
    </SectionPanel>
  );
}

function DerivedMaxQuestionsSummary({
  baseQuestionCount,
  derivedMaxQuestions,
  adaptiveEnabled,
  maxDeepPerQuestion,
  t,
}: {
  baseQuestionCount: number;
  derivedMaxQuestions: number;
  adaptiveEnabled: boolean;
  maxDeepPerQuestion?: number;
  t: (key: string) => string;
}) {
  const hasQuestions = baseQuestionCount > 0;
  const depth = adaptiveEnabled ? Math.max(0, Math.floor(maxDeepPerQuestion ?? 0)) : 0;
  return (
    <div aria-live="polite" className="space-y-1">
      <p className="text-sm font-medium text-foreground">{t('employer.campaigns.form.maxQuestionsDerivedLabel')}</p>
      <p className="text-lg font-semibold text-foreground">
        {hasQuestions
          ? t('employer.campaigns.form.maxQuestionsDerivedValue').replace('{{count}}', String(derivedMaxQuestions))
          : t('employer.campaigns.form.maxQuestionsDerivedEmpty')}
      </p>
      <p className="text-xs text-muted-foreground">
        {hasQuestions
          ? t(depth > 0
            ? 'employer.campaigns.form.maxQuestionsDerivedFormula'
            : 'employer.campaigns.form.maxQuestionsDerivedBaseFormula')
              .replace('{{base}}', String(baseQuestionCount))
              .replace('{{depth}}', String(depth))
          : t('employer.campaigns.form.maxQuestionsDerivedEmptyHelp')}
      </p>
    </div>
  );
}
