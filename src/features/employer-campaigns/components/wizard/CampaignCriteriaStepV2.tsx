import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { SelectionOption } from '@/components/ui/selection-option';
import { SectionPanel } from '@/components/ui/section-panel';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import { getApiStatusCode } from '@/shared/api/apiError';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { campaignCriteriaService, type CampaignCriteriaPreview } from '../../services/campaignCriteria.service';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricTotalWeight } from './criteria/CampaignRubricTotalWeight';

interface Props { rubric: RubricCriterion[]; campaignId: string | null; isDraftEditable: boolean; jobCategory: string | null; contextLabel: string; error?: string | null; onChangeRubric: (rubric: RubricCriterion[]) => void; onReset: () => void; onBack: () => void; onNext: () => void; isSaving?: boolean; }

export function previewToRubric(preview: CampaignCriteriaPreview): RubricCriterion[] { return preview.criteria.map((item, index) => ({ id: item.id || `system-${index + 1}`, name: item.name, description: item.description, weight: item.weight <= 1 ? item.weight * 100 : item.weight, maxScore: item.maxScore, minPct: null, levels: item.levels.length ? item.levels : undefined })); }
function visibleLevels(levels: CampaignCriteriaPreview['criteria'][number]['levels']) { return levels.length <= 3 ? levels : [levels[0], levels[Math.floor(levels.length / 2)], levels[levels.length - 1]].filter((level, index, values) => values.findIndex((item) => item.score === level.score) === index); }

export function CampaignCriteriaStepV2({ rubric, campaignId, isDraftEditable, jobCategory: initialJobCategory, contextLabel, error, onChangeRubric, onReset, onBack, onNext, isSaving }: Props) {
  const { t, language } = useLanguage();
  const [source, setSource] = React.useState<'manual' | 'system'>('manual');
  const [jobCategory, setJobCategory] = React.useState(initialJobCategory ?? '');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const criteriaQuery = useQuery({ queryKey: ['system-default-rubric', jobCategory, language], queryFn: () => campaignCriteriaService.preview(jobCategory, language), enabled: rubric.length === 0 && jobCategory !== '' });
  const preview = criteriaQuery.data ?? null;
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every((item) => Number.isInteger(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10);
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const canNext = weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving;
  const errorStatus = criteriaQuery.error ? getApiStatusCode(criteriaQuery.error) : undefined;

  const applyPreview = async () => {
    if (!preview) return;
    setApplying(true); setLocalError(null);
    try {
      const applied = campaignId && isDraftEditable ? await campaignCriteriaService.applyToCampaign(campaignId, jobCategory, language) : preview;
      onChangeRubric(previewToRubric(applied)); setConfirmOpen(false); setPreviewOpen(false);
    } catch { setLocalError(t('employer.campaigns.wizard.criteriaPreview.applyError')); }
    finally { setApplying(false); }
  };
  const usePreview = () => { if (rubric.length > 0 || campaignId) setConfirmOpen(true); else void applyPreview(); };

  return <SectionPanel icon={<ClipboardList className="size-4" aria-hidden />} title={t('employer.campaigns.wizard.steps.criteria')} headerAside={<CampaignRubricTotalWeight totalWeight={totalWeight} totalMaxScore={totalMaxScore} weightValid={weightValid} maxScoreValid={maxScoreValid} resetDisabled={Boolean(isSaving)} onReset={onReset} />} footer={<CampaignWizardNav onBack={onBack} onNext={onNext} isSaving={isSaving} nextDisabled={!canNext} />}>
    <div className="space-y-6">
      {error ? <FieldError message={error} /> : null}{localError ? <Alert variant="error"><AlertDescription>{localError}</AlertDescription></Alert> : null}
      <div className="frame-satin rounded-lg bg-surface-overlay p-3"><label htmlFor="campaign-job-category" className="text-sm font-medium text-foreground">{t('employer.campaigns.wizard.criteriaPreview.jobCategory')}</label><select id="campaign-job-category" value={jobCategory} onChange={(event) => { setJobCategory(event.target.value); setPreviewOpen(false); }} className="mt-2 h-10 w-full rounded-md border border-satin bg-surface-base px-3 text-sm text-foreground"><option value="">{t('employer.campaigns.wizard.criteriaPreview.jobCategoryPlaceholder')}</option><option value="BA">BA</option><option value="BE">BE</option><option value="FE">FE</option></select><p className="mt-1 text-xs text-muted-foreground">{t('employer.campaigns.wizard.criteriaPreview.jobCategoryHelp')}</p></div>
      {criteriaQuery.isError ? <Alert variant="error"><AlertDescription><div>{(errorStatus === 404 ? t('employer.campaigns.wizard.criteriaPreview.notFound') : t('employer.campaigns.wizard.criteriaPreview.loadFailed')).replace('{{job}}', jobCategory)}</div><div className="mt-2 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => void criteriaQuery.refetch()}>{t('employer.campaigns.wizard.criteriaPreview.retry')}</Button><Button type="button" size="sm" variant="ghost" onClick={() => setSource('manual')}>{t('employer.campaigns.wizard.criteriaPreview.manualFallback')}</Button></div></AlertDescription></Alert> : null}
      <div className="rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-xs text-muted-foreground">{t('employer.campaigns.wizard.rubric.summary').replace('{{anchors}}', String(rubric.filter((item) => item.levels?.length).length)).replace('{{total}}', String(rubric.length)).replace('{{floors}}', String(rubric.filter((item) => item.minPct != null).length))}</div>
      <div className="grid gap-3 md:grid-cols-2"><SelectionOption title={t('employer.campaigns.wizard.criteriaSource.manual')} description={t('employer.campaigns.wizard.criteriaSource.manualDesc')} selected={source === 'manual'} onClick={() => setSource('manual')} showChevron={false} /><SelectionOption title={t('employer.campaigns.wizard.criteriaSource.system')} description={t('employer.campaigns.wizard.criteriaSource.systemDesc')} selected={source === 'system'} onClick={() => { setSource('system'); setPreviewOpen(true); }} showChevron={false} disabled={criteriaQuery.isFetching || !jobCategory} icon={criteriaQuery.isFetching ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />} /></div>
      <CampaignCriteriaManualList rubric={rubric} contextLabel={contextLabel} disabled={Boolean(isSaving)} onChangeRubric={onChangeRubric} />
    </div>
    <AppModal open={previewOpen} onClose={() => setPreviewOpen(false)} size="md" ariaLabel={t('employer.campaigns.wizard.criteriaPreview.title')}><div className="space-y-4"><div><h2 className="text-lg font-semibold text-foreground">{t('employer.campaigns.wizard.criteriaPreview.title')}</h2><p className="text-sm text-muted-foreground">{t('employer.campaigns.wizard.criteriaPreview.forJob').replace('{{job}}', jobCategory)} · {language.toUpperCase()}</p></div>{preview?.criteria.length ? <div className="max-h-[50vh] space-y-3 overflow-y-auto">{preview.criteria.map((item) => <div key={item.id} className="frame-satin rounded-lg px-3 py-2"><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-foreground">{item.name}</span><span className="text-muted-foreground">{Math.round((item.weight <= 1 ? item.weight * 100 : item.weight) * 10) / 10}% · {t('employer.campaigns.wizard.criteriaPreview.scale').replace('{{score}}', String(item.maxScore))}</span></div>{item.description ? <p className="mt-1 text-xs text-muted-foreground">{item.description}</p> : null}{item.levels.length ? <div className="mt-2 space-y-1 border-t border-satin pt-2 text-xs text-foreground">{visibleLevels(item.levels).map((level) => <p key={level.score}><span className="font-medium">{t('employer.campaigns.wizard.criteriaPreview.level').replace('{{score}}', String(level.score))}</span> {level.descriptor}</p>)}</div> : <p className="mt-2 text-xs text-muted-foreground">{t('employer.campaigns.wizard.criteriaPreview.noLevels')}</p>}</div>)}</div> : <Alert variant="info"><AlertDescription>{t('employer.campaigns.wizard.criteriaPreview.empty')}</AlertDescription></Alert>}{preview ? <div className="space-y-2 text-xs text-muted-foreground"><p>{t('employer.campaigns.wizard.criteriaPreview.systemCaveat')}</p><p>{t('employer.campaigns.wizard.criteriaPreview.manualEqual')}</p></div> : null}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('ds.common.cancel')}</Button><Button onClick={usePreview} disabled={!preview?.criteria.length || applying}>{applying ? t('employer.campaigns.wizard.criteriaPreview.applying') : t('employer.campaigns.wizard.criteriaPreview.use')}</Button></div></div></AppModal>
    <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title={t('employer.campaigns.wizard.criteriaPreview.replaceTitle')} description={t(campaignId ? 'employer.campaigns.wizard.criteriaPreview.activeWarning' : 'employer.campaigns.wizard.criteriaPreview.replaceDescription').replace('{{count}}', String(rubric.length))} confirmLabel={t('employer.campaigns.wizard.criteriaPreview.replace')} cancelLabel={t('ds.common.cancel')} destructive onConfirm={() => void applyPreview()} />
  </SectionPanel>;
}
