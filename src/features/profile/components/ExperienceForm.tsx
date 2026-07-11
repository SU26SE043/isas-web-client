import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { Experience } from '../types/profile.types';

type ExperienceFormState = Omit<Experience, 'id'>;

const emptyExperience = (): ExperienceFormState => ({
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

interface ExperienceFormProps {
  initial?: Experience;
  onSubmit: (data: ExperienceFormState) => Promise<void>;
  onCancel: () => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<ExperienceFormState>(initial ? { ...initial } : emptyExperience());
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.company.trim() || !form.title.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      {(['company', 'title', 'startDate', 'endDate'] as const).map((key) => (
        <label key={key} className="block">
          <span className="text-label text-muted-foreground">{t(`profile.experience.${key === 'title' ? 'jobTitle' : key}`)}</span>
          <input
            className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
            value={form[key] ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
            required={key === 'company' || key === 'title'}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isCurrent} onChange={(event) => setForm((prev) => ({ ...prev, isCurrent: event.target.checked }))} />
        {t('profile.experience.current')}
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">{t('profile.experience.description')}</span>
        <textarea className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm" rows={3} value={form.description ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? t('profile.common.saving') : t('profile.experience.save')}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('profile.experience.cancel')}</button>
      </div>
    </form>
  );
};
