import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignHardFiltersState } from '../../types/campaignWizard.types';

interface CampaignHardFilterSectionProps {
  value: CampaignHardFiltersState;
  onChange: (patch: Partial<CampaignHardFiltersState>) => void;
}

function parseList(value: string): string[] {
  return Array.from(
    new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)),
  );
}

export function CampaignHardFilterSection({ value, onChange }: CampaignHardFilterSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="frame-satin space-y-4 rounded-xl bg-surface-raised p-4">
      <div className="flex items-start gap-3">
        <Filter className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.wizard.hardFilters.title')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('employer.campaigns.wizard.hardFilters.description')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="campaign-required-skills">
            {t('employer.campaigns.wizard.hardFilters.requiredSkills')}
          </Label>
          <Input
            id="campaign-required-skills"
            value={value.requiredSkills.join(', ')}
            placeholder={t('employer.campaigns.wizard.hardFilters.listPlaceholder')}
            onChange={(event) =>
              onChange({ requiredSkills: parseList(event.target.value), requiredSkillsTouched: true })
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.wizard.hardFilters.requiredSkillsHint')}
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="campaign-keywords-any">
            {t('employer.campaigns.wizard.hardFilters.keywordsAny')}
          </Label>
          <Input
            id="campaign-keywords-any"
            value={value.keywordsAny.join(', ')}
            placeholder={t('employer.campaigns.wizard.hardFilters.listPlaceholder')}
            onChange={(event) =>
              onChange({ keywordsAny: parseList(event.target.value), keywordsAnyTouched: true })
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.wizard.hardFilters.keywordsAnyHint')}
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="campaign-min-years">
            {t('employer.campaigns.wizard.hardFilters.minYearsExperience')}
          </Label>
          <Input
            id="campaign-min-years"
            type="number"
            min={0}
            step={1}
            value={value.minYearsExperience ?? ''}
            placeholder={t('employer.campaigns.wizard.hardFilters.minYearsPlaceholder')}
            onChange={(event) => {
              const raw = event.target.value;
              onChange({
                minYearsExperience: raw === '' ? null : Number(raw),
                minYearsExperienceTouched: true,
              });
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.wizard.hardFilters.minYearsHint')}
          </p>
        </div>
      </div>
    </section>
  );
}
