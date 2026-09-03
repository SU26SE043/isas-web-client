import * as React from 'react';
import { ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { SelectionOption } from '@/components/ui/selection-option';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { campaignCriteriaService, type CampaignCriteriaPreview } from '../../services/campaignCriteria.service';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricTotalWeight } from './criteria/CampaignRubricTotalWeight';

interface CampaignCriteriaStepV2Props { rubric: RubricCriterion[]; contextLabel: string; error?: string | null; onChangeRubric: (rubric: RubricCriterion[]) => void; onReset: () => void; onBack: () => void; onNext: () => void; isSaving?: boolean; }

function previewToRubric(preview: CampaignCriteriaPreview): RubricCriterion[] { return preview.criteria.map((item, index) => ({ id: item.id || `system-${index + 1}`, name: item.name, description: '', weight: item.weight <= 1 ? item.weight * 100 : item.weight, maxScore: 10, minPct: null, levels: item.levels.length ? item.levels : undefined })); }

export function CampaignCriteriaStepV2({ rubric, contextLabel, error, onChangeRubric, onReset, onBack, onNext, isSaving }: CampaignCriteriaStepV2Props) {
  const { t, language } = useLanguage();
  const [source, setSource] = React.useState<'manual' | 'system'>('manual');
  const [preview, setPreview] = React.useState<CampaignCriteriaPreview | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every((item) => Number.isInteger(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10);
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const canNext = weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving;
  const openSystemPreview = async () => { setSource('system'); setLoading(true); try { setPreview(await campaignCriteriaService.preview(contextLabel, language)); setPreviewOpen(true); } finally { setLoading(false); } };
  const usePreview = () => { if (preview) onChangeRubric(previewToRubric(preview)); setPreviewOpen(false); };

  return <SectionPanel icon={<ClipboardList className="size-4" aria-hidden />} title={t('employer.campaigns.wizard.steps.criteria')} headerAside={<CampaignRubricTotalWeight totalWeight={totalWeight} totalMaxScore={totalMaxScore} weightValid={weightValid} maxScoreValid={maxScoreValid} resetDisabled={Boolean(isSaving)} onReset={onReset} />} footer={<CampaignWizardNav onBack={onBack} onNext={onNext} isSaving={isSaving} nextDisabled={!canNext} />}>
    <div className="space-y-6">
      {error ? <FieldError message={error} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <SelectionOption title={t('employer.campaigns.wizard.criteriaSource.manual')} description={t('employer.campaigns.wizard.criteriaSource.manualDesc')} selected={source === 'manual'} onClick={() => setSource('manual')} showChevron={false} />
        <SelectionOption title={t('employer.campaigns.wizard.criteriaSource.system')} description={t('employer.campaigns.wizard.criteriaSource.systemDesc')} selected={source === 'system'} onClick={() => void openSystemPreview()} showChevron={false} disabled={loading} icon={loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />} />
      </div>
      <CampaignCriteriaManualList rubric={rubric} contextLabel={contextLabel} disabled={Boolean(isSaving)} onChangeRubric={onChangeRubric} />
    </div>
    <AppModal open={previewOpen} onClose={() => setPreviewOpen(false)} size="md" ariaLabel={t('employer.campaigns.wizard.criteriaPreview.title')}>
      <div className="space-y-4"><div><h2 className="text-lg font-semibold text-foreground">{t('employer.campaigns.wizard.criteriaPreview.title')}</h2><p className="text-sm text-muted-foreground">{contextLabel} · {language.toUpperCase()}</p></div>
        {preview?.criteria.length ? <div className="max-h-[50vh] space-y-2 overflow-y-auto">{preview.criteria.map((item) => <div key={item.id} className="frame-satin rounded-lg px-3 py-2"><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-foreground">{item.name}</span><span className="text-muted-foreground">{Math.round((item.weight <= 1 ? item.weight * 100 : item.weight) * 10) / 10}% · {item.levelCount} {t('employer.campaigns.wizard.criteriaPreview.levels')}</span></div></div>)}</div> : <Alert variant="info"><AlertDescription>{t('employer.campaigns.wizard.criteriaPreview.empty')}</AlertDescription></Alert>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('ds.common.cancel')}</Button><Button onClick={usePreview} disabled={!preview?.criteria.length}>{t('employer.campaigns.wizard.criteriaPreview.use')}</Button></div>
      </div>
    </AppModal>
  </SectionPanel>;
}
