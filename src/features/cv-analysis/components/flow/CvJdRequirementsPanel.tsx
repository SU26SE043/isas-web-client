import { CheckCircle2, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { RequirementInput } from '../../types/cvAnalysis.types';

export interface EditableRequirementGroups {
  mustHave: RequirementInput[];
  niceToHave: RequirementInput[];
}

interface CvJdRequirementsPanelProps {
  requirements: EditableRequirementGroups;
  onChange: (requirements: EditableRequirementGroups) => void;
}

type RequirementGroup = keyof EditableRequirementGroups;

export function CvJdRequirementsPanel({ requirements, onChange }: CvJdRequirementsPanelProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableRequirementGroups>(requirements);
  const groups: Array<{ key: RequirementGroup; title: string }> = [
    { key: 'mustHave', title: t('cv.requirements.mustHave') },
    { key: 'niceToHave', title: t('cv.requirements.niceToHave') },
  ];
  const total = requirements.mustHave.length + requirements.niceToHave.length;

  useEffect(() => {
    if (!isEditing) setDraft(requirements);
  }, [isEditing, requirements]);

  const updateItem = (group: RequirementGroup, index: number, text: string) => {
    setDraft({
      ...draft,
      [group]: draft[group].map((item, itemIndex) =>
        itemIndex === index ? { ...item, text } : item,
      ),
    });
  };

  const addItem = (group: RequirementGroup) => {
    setDraft({ ...draft, [group]: [...draft[group], { text: '' }] });
  };

  const removeItem = (group: RequirementGroup, index: number) => {
    setDraft({ ...draft, [group]: draft[group].filter((_, itemIndex) => itemIndex !== index) });
  };

  return (
    <section className="rounded-xl border border-satin bg-white/[0.04] p-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <ListChecks className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{t('cv.requirements.title')}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('cv.requirements.count').replace('{count}', String(total))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isEditing ? t('cv.requirements.editHint') : t('cv.requirements.viewHint')}
          </p>
        </div>
        {!isEditing ? (
          <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditing(true)}>
            <Pencil aria-hidden />
            {t('cv.requirements.edit')}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {groups.map((group) => (
          <fieldset key={group.key} className="min-w-0">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title} ({(isEditing ? draft : requirements)[group.key].length})
            </legend>
            <div className="mt-2 space-y-2">
              {(isEditing ? draft : requirements)[group.key].map((item, index) => (
                <div key={`${group.key}-${index}`} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                  {isEditing ? (
                    <>
                      <Input
                        value={item.text}
                        onChange={(event) => updateItem(group.key, index, event.target.value)}
                        aria-label={`${group.title} ${index + 1}`}
                        maxLength={500}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(group.key, index)}
                        aria-label={t('cv.requirements.remove')}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </>
                  ) : (
                    <span className="min-w-0 text-sm text-foreground [overflow-wrap:anywhere]">{item.text}</span>
                  )}
                </div>
              ))}
              {(isEditing ? draft : requirements)[group.key].length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('cv.requirements.empty')}</p>
              ) : null}
            </div>
            {isEditing ? (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => addItem(group.key)}>
                <Plus aria-hidden />
                {t('cv.requirements.add')}
              </Button>
            ) : null}
          </fieldset>
        ))}
      </div>

      {isEditing ? (
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-satin pt-4">
          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
            {t('cv.requirements.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onChange(draft);
              setIsEditing(false);
            }}
          >
            {t('cv.requirements.save')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
