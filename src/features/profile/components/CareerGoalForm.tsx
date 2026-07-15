import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '../services/profile.service';
import type { CareerGoal } from '../types/profile.types';

interface CareerGoalFormProps {
  initial?: CareerGoal;
  onSaved: () => void;
}

export const CareerGoalForm: React.FC<CareerGoalFormProps> = ({ initial, onSaved }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<CareerGoal>({
    targetRole: initial?.targetRole ?? '',
    targetIndustry: initial?.targetIndustry ?? '',
    expectedSalary: initial?.expectedSalary ?? '',
    preferredLocation: initial?.preferredLocation ?? '',
    summary: initial?.summary ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.targetRole.trim() || !form.targetIndustry.trim()) {
      toast.error(t('profile.common.required'));
      return;
    }
    setIsSaving(true);
    try {
      await profileService.updateCareerGoal(form);
      toast.success(t('profile.careerGoal.saved'));
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const fields: Array<{ key: keyof CareerGoal; label: string; required?: boolean; multiline?: boolean }> = [
    { key: 'targetRole', label: t('profile.careerGoal.targetRole'), required: true },
    { key: 'targetIndustry', label: t('profile.careerGoal.targetIndustry'), required: true },
    { key: 'expectedSalary', label: t('profile.careerGoal.expectedSalary') },
    { key: 'preferredLocation', label: t('profile.careerGoal.preferredLocation') },
    { key: 'summary', label: t('profile.careerGoal.summary'), multiline: true },
  ];

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {fields.map((field) => (
        <label key={field.key} className="block">
          <span className="text-label text-muted-foreground">{field.label}</span>
          {field.multiline ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
              rows={4}
              value={form[field.key] ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
              value={form[field.key] ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
              required={field.required}
            />
          )}
        </label>
      ))}
      <button type="submit" className="btn-primary" disabled={isSaving}>
        {isSaving ? t('profile.common.saving') : t('profile.careerGoal.save')}
      </button>
    </form>
  );
};
