import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface RoadmapNameEditorProps {
  name: string;
  isSaving: boolean;
  error?: string | null;
  onSave: (name: string) => Promise<void>;
}

export function RoadmapNameEditor({ name, isSaving, error, onSave }: RoadmapNameEditorProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const startEditing = () => {
    setDraft(name);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(name);
    setEditing(false);
  };

  const save = async () => {
    if (!draft.trim() || isSaving) return;
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch {
      // The parent owns the visible error state; keep the editor open.
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="relative heading-primary text-4xl text-foreground sm:text-5xl">{name}</h1>
          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2 text-xs"
            onClick={startEditing}
            aria-label={t('practice.learningPath.rename')}
          >
            <Pencil className="size-4" aria-hidden />
            {t('practice.learningPath.rename')}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-error" role="alert">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="roadmap-name-editor">
          {t('practice.learningPath.rename')}
        </label>
        <input
          id="roadmap-name-editor"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isSaving}
          autoFocus
          className="min-w-0 flex-1 rounded-xl border border-satin bg-surface-overlay px-3 py-2 text-2xl font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-4xl"
        />
        <button type="button" className="btn-primary text-xs" onClick={() => void save()} disabled={isSaving || !draft.trim()}>
          {isSaving ? t('practice.learningPath.saving') : t('practice.learningPath.saveName')}
        </button>
        <button type="button" className="btn-ghost inline-flex items-center gap-1 text-xs" onClick={cancelEditing} disabled={isSaving}>
          <X className="size-4" aria-hidden />
          {t('practice.learningPath.cancelRename')}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-error" role="alert">{error}</p> : null}
    </div>
  );
}
