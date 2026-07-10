import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { ExperienceForm } from '../components/ExperienceForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Experience } from '../types/profile.types';

export const ExperiencePage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Experience | 'new' | null>(null);

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  const handleSave = async (data: Omit<Experience, 'id'>) => {
    if (editing && editing !== 'new') {
      await profileService.updateExperience(editing.id, data);
    } else {
      await profileService.addExperience(data);
    }
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout title={t('profile.experience.title')} description={t('profile.experience.subtitle')} completeness={completeness}>
      <div className="space-y-4">
        {profile.experiences.length === 0 && !editing ? <p className="text-sm text-muted-foreground">{t('profile.experience.empty')}</p> : null}
        {profile.experiences.map((item) => (
          <article key={item.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
            <h3 className="font-semibold text-foreground">{item.title} — {item.company}</h3>
            <p className="text-sm text-muted-foreground">{item.startDate} — {item.isCurrent ? t('profile.experience.current') : item.endDate}</p>
            {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(item)}>{t('profile.experience.edit')}</button>
              <button type="button" className="btn-ghost text-error" onClick={() => void profileService.deleteExperience(item.id).then(reload)}>{t('profile.experience.delete')}</button>
            </div>
          </article>
        ))}
        {editing ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-4">
            <ExperienceForm initial={editing === 'new' ? undefined : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>{t('profile.experience.add')}</button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
