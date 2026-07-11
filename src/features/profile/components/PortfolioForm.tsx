import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { PortfolioProject } from '../types/profile.types';

type PortfolioFormState = Omit<PortfolioProject, 'id'>;

const emptyProject = (): PortfolioFormState => ({
  title: '',
  description: '',
  url: '',
  techStack: '',
});

interface PortfolioFormProps {
  initial?: PortfolioProject;
  onSubmit: (data: PortfolioFormState) => Promise<void>;
  onCancel: () => void;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<PortfolioFormState>(initial ? { ...initial } : emptyProject());
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form onSubmit={(event) => { event.preventDefault(); setIsSaving(true); void onSubmit(form).finally(() => setIsSaving(false)); }} className="space-y-3">
      {(['title', 'description', 'url', 'techStack'] as const).map((key) => (
        <label key={key} className="block">
          <span className="text-label text-muted-foreground">{t(`profile.portfolio.${key === 'title' ? 'projectTitle' : key}`)}</span>
          {key === 'description' ? (
            <textarea className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm" rows={3} value={form[key] ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} required />
          ) : (
            <input className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm" value={form[key] ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} required={key === 'title'} />
          )}
        </label>
      ))}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? t('profile.common.saving') : t('profile.portfolio.save')}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('profile.portfolio.cancel')}</button>
      </div>
    </form>
  );
};
