import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { EducationForm } from '../components/EducationForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Education } from '../types/profile.types';

export const EducationPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Education | 'new' | null>(null);

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  const handleSave = async (data: Omit<Education, 'id'>) => {
    if (editing && editing !== 'new') {
      await profileService.updateEducation(editing.id, data);
    } else {
      await profileService.addEducation(data);
    }
    setEditing(null);
    await reload();
  };

  const handleDelete = async (id: string) => {
    await profileService.deleteEducation(id);
    await reload();
  };

  return (
    <ProfileSectionLayout title={t('profile.education.title')} description={t('profile.education.subtitle')} completeness={completeness}>
      <div className="space-y-4">
        {profile.education.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">{t('profile.education.empty')}</p>
        ) : (
          profile.education.map((item) => (
            <article key={item.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
              <h3 className="font-semibold text-foreground">{item.degree} — {item.school}</h3>
              <p className="text-sm text-muted-foreground">{item.fieldOfStudy} · {item.startDate} — {item.isCurrent ? t('profile.education.current') : item.endDate}</p>
              {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => setEditing(item)}>{t('profile.education.edit')}</button>
                <button type="button" className="btn-ghost text-error" onClick={() => void handleDelete(item.id)}>{t('profile.education.delete')}</button>
              </div>
            </article>
          ))
        )}
        {editing ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-4">
            <EducationForm initial={editing === 'new' ? undefined : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>{t('profile.education.add')}</button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
