import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { CertificateCard } from '../components/CertificateCard';
import { CertificateForm } from '../components/CertificateForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Certificate } from '../types/profile.types';

export const CertificatesPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Certificate | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<Certificate, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updateCertificate(editing.id, data);
    else await profileService.addCertificate(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.certificates.title')}
      description={t('profile.certificates.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        {profile.certificates.map((item) => (
          <CertificateCard
            key={item.id}
            certificate={item}
            onEdit={() => setEditing(item)}
            onDelete={() => void profileService.deleteCertificate(item.id).then(reload)}
          />
        ))}
        {editing ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-4">
            <CertificateForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.certificates.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
