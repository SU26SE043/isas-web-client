import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EditableRubricCriterion, RubricCriterionResponse } from '../types/rubric.types';
import { useLanguage } from '@/shared/languages';

function matchFor(defaultCriterion: RubricCriterionResponse, custom: EditableRubricCriterion[]) {
  return custom.find((item) => item.serverId === defaultCriterion.id)
    ?? custom.find((item) => item.name.trim().toLocaleLowerCase() === defaultCriterion.name.trim().toLocaleLowerCase());
}

function levelsDiffer(defaultCriterion: RubricCriterionResponse, custom?: EditableRubricCriterion) {
  const normalize = (levels: RubricCriterionResponse['levels']) => (levels ?? [])
    .map(({ score, descriptor }) => ({ score, descriptor: descriptor.trim() }))
    .sort((a, b) => a.score - b.score);
  return !custom || JSON.stringify(normalize(defaultCriterion.levels)) !== JSON.stringify(normalize(custom.levels));
}

export function DefaultRubricDiffDialog({
  open, onOpenChange, isLoading, error, defaultCriteria, customCriteria, version,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  error: boolean;
  defaultCriteria: RubricCriterionResponse[];
  customCriteria: EditableRubricCriterion[];
  version?: number;
}) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{t('rubrics.defaultDiff.title')}</DialogTitle><DialogDescription>{t('rubrics.defaultDiff.description').replace('{version}', String(version ?? '—'))}</DialogDescription></DialogHeader>
        {isLoading ? <p role="status" className="text-sm text-muted-foreground">{t('rubrics.defaultDiff.loading')}</p> : null}
        {error ? <p role="alert" className="text-sm text-error">{t('rubrics.defaultDiff.error')}</p> : null}
        {!isLoading && !error ? <div className="space-y-2">
          {defaultCriteria.map((criterion) => {
            const own = matchFor(criterion, customCriteria);
            const differs = !own || own.name !== criterion.name || own.description !== (criterion.description ?? '') || own.weightPercent !== Math.round(criterion.weight * 10000) / 100 || own.maxScore !== criterion.maxScore || levelsDiffer(criterion, own);
            return <div key={criterion.id} className="grid gap-2 rounded-xl border border-satin bg-surface-raised p-3 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">{t('rubrics.defaultDiff.default')}</p><p className="font-medium">{criterion.name}</p><p className="text-sm text-muted-foreground">{criterion.description || '—'} · {Math.round(criterion.weight * 100)}%</p><ul className="mt-1 space-y-1 text-xs text-muted-foreground">{criterion.levels?.map((level) => <li key={level.score}>{level.score}: {level.descriptor}</li>)}</ul></div>
              <div><p className="text-xs text-muted-foreground">{t('rubrics.defaultDiff.custom')}</p><p className="font-medium">{own?.name || t('rubrics.defaultDiff.removed')}</p><p className="text-sm text-muted-foreground">{own ? `${own.description || '—'} · ${own.weightPercent}%` : '—'}</p><ul className="mt-1 space-y-1 text-xs text-muted-foreground">{own?.levels?.map((level) => <li key={level.score}>{level.score}: {level.descriptor}</li>)}</ul><span className="text-xs">{t(differs ? 'rubrics.defaultDiff.changed' : 'rubrics.defaultDiff.same')}</span></div>
            </div>;
          })}
          {customCriteria.filter((criterion) => !defaultCriteria.some((item) => item.id === criterion.serverId || item.name.trim().toLocaleLowerCase() === criterion.name.trim().toLocaleLowerCase())).map((criterion) => <div key={criterion.clientId} className="rounded-xl border border-satin bg-surface-raised p-3"><p className="text-xs text-muted-foreground">{t('rubrics.defaultDiff.custom')}</p><p className="font-medium">{criterion.name}</p><p className="text-sm text-muted-foreground">{criterion.description || '—'} · {criterion.weightPercent}% · {t('rubrics.defaultDiff.added')}</p></div>)}
        </div> : null}
      </DialogContent>
    </Dialog>
  );
}
