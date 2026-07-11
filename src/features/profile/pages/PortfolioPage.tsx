import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { PortfolioForm } from '../components/PortfolioForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { PortfolioProject } from '../types/profile.types';

export const PortfolioPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<PortfolioProject | 'new' | null>(null);

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  const handleSave = async (data: Omit<PortfolioProject, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updatePortfolio(editing.id, data);
    else await profileService.addPortfolio(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout title={t('profile.portfolio.title')} description={t('profile.portfolio.subtitle')} completeness={completeness}>
      <div className="space-y-4">
        {profile.portfolio.length === 0 && !editing ? <p className="text-sm text-muted-foreground">{t('profile.portfolio.empty')}</p> : null}
        {profile.portfolio.map((item) => (
          <article key={item.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.techStack}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            {item.url ? <a href={item.url} className="mt-2 inline-block text-sm text-foreground underline" target="_blank" rel="noreferrer">{item.url}</a> : null}
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(item)}>{t('profile.portfolio.edit')}</button>
              <button type="button" className="btn-ghost text-error" onClick={() => void profileService.deletePortfolio(item.id).then(reload)}>{t('profile.portfolio.delete')}</button>
            </div>
          </article>
        ))}
        {editing ? <div className="rounded-xl border border-subtle bg-surface-raised p-4"><PortfolioForm initial={editing === 'new' ? undefined : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} /></div> : <button type="button" className="btn-primary" onClick={() => setEditing('new')}>{t('profile.portfolio.add')}</button>}
      </div>
    </ProfileSectionLayout>
  );
};
