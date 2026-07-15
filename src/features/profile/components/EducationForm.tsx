import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { Education } from '../types/profile.types';

type EducationFormState = Omit<Education, 'id'>;

const emptyEducation = (): EducationFormState => ({
  school: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

interface EducationFormProps {
  initial?: Education;
  onSubmit: (data: EducationFormState) => Promise<void>;
  onCancel: () => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<EducationFormState>(
    initial ? { ...initial } : emptyEducation(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.school.trim() || !form.degree.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      {(['school', 'degree', 'fieldOfStudy', 'startDate', 'endDate'] as const).map((key) => (
        <label key={key} className="block">
          <span className="text-label text-muted-foreground">{t(`profile.education.${key === 'fieldOfStudy' ? 'field' : key}`)}</span>
          <input
            className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
            value={form[key] ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
            required={key === 'school' || key === 'degree'}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={(event) => setForm((prev) => ({ ...prev, isCurrent: event.target.checked }))}
        />
        {t('profile.education.current')}
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">{t('profile.education.description')}</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
          rows={3}
          value={form.description ?? ''}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? t('profile.common.saving') : t('profile.education.save')}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('profile.education.cancel')}</button>
      </div>
    </form>
  );
};
