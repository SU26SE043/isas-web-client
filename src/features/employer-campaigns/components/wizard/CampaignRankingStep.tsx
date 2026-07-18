import { Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RankedCandidate } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignRankingStepProps {
  ranked: RankedCandidate[];
  threshold: number;
  error?: string | null;
  onThreshold: (threshold: number) => void;
  onSimulateCvRanking: () => void;
  onToggleCandidate: (id: string) => void;
  onSelectAboveThreshold: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignRankingStep({
  ranked,
  threshold,
  error,
  onThreshold,
  onSimulateCvRanking,
  onToggleCandidate,
  onSelectAboveThreshold,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignRankingStepProps) {
  const { t } = useLanguage();
  const selectedCount = ranked.filter((row) => row.selected).length;
  const aboveThreshold = ranked.filter((row) => row.overallMatch >= threshold).length;
  const avgMatch =
    ranked.length === 0
      ? 0
      : Math.round(ranked.reduce((sum, row) => sum + row.overallMatch, 0) / ranked.length);

  return (
    <SectionPanel
      icon={<Trophy className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.ranking')}
      description={t('employer.campaigns.wizard.steps.rankingDesc')}
      footer={
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.wizard.selectedCount').replace('{count}', String(selectedCount))}
          </p>
          <CampaignWizardNav
            onBack={onBack}
            onNext={onNext}
            onSaveDraft={onSaveDraft}
            isSaving={isSaving}
          />
        </div>
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: t('employer.campaigns.wizard.ranking.total'), value: String(ranked.length) },
            { label: t('employer.campaigns.wizard.ranking.above'), value: String(aboveThreshold) },
            { label: t('employer.campaigns.wizard.ranking.selected'), value: String(selectedCount) },
            { label: t('employer.campaigns.wizard.ranking.avg'), value: `${avgMatch}%` },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-satin bg-surface-overlay px-3 py-3"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="match-threshold">{t('employer.campaigns.form.matchThreshold')}</Label>
            <Input
              id="match-threshold"
              type="number"
              min={0}
              max={100}
              className="w-28"
              value={threshold}
              onChange={(e) => onThreshold(Number(e.target.value) || 0)}
            />
          </div>
          <button type="button" className="btn-secondary" onClick={onSelectAboveThreshold}>
            {t('employer.campaigns.wizard.selectAboveThreshold')}
          </button>
          <button type="button" className="btn-ghost" onClick={onSimulateCvRanking}>
            {t('employer.campaigns.wizard.rerunRanking')}
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-satin">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t('employer.campaigns.wizard.select')}</th>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">
                  {t('employer.campaigns.detail.candidateName')}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t('employer.campaigns.detail.candidateEmail')}
                </th>
                <th className="px-3 py-2 font-medium">{t('employer.campaigns.form.overallMatch')}</th>
                <th className="px-3 py-2 font-medium">
                  {t('employer.campaigns.form.technicalMatch')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[...ranked]
                .sort((a, b) => b.overallMatch - a.overallMatch)
                .map((row, index) => (
                  <tr key={row.id} className="border-b border-satin last:border-0">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => onToggleCandidate(row.id)}
                        aria-label={row.name}
                        className="size-4 rounded border-satin"
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-2 text-foreground">{row.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                    <td className="px-3 py-2 text-foreground">{row.overallMatch}%</td>
                    <td className="px-3 py-2 text-foreground">{row.technicalMatch}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionPanel>
  );
}
