import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { PortfolioGallery } from '../components/PortfolioGallery';
import { PortfolioForm } from '../components/PortfolioForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { PortfolioProject } from '../types/profile.types';

export const PortfolioPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<PortfolioProject | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<PortfolioProject, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updatePortfolio(editing.id, data);
    else await profileService.addPortfolio(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.portfolio.title')}
      description={t('profile.portfolio.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        <PortfolioGallery
          items={profile.portfolio}
          onEdit={setEditing}
          onDelete={(id) => void profileService.deletePortfolio(id).then(reload)}
        />
        {editing ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-4">
            <PortfolioForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.portfolio.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
