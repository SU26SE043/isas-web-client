import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { CertificateForm } from '../components/CertificateForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Certificate } from '../types/profile.types';

export const CertificatesPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Certificate | 'new' | null>(null);

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  const handleSave = async (data: Omit<Certificate, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updateCertificate(editing.id, data);
    else await profileService.addCertificate(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout title={t('profile.certificates.title')} description={t('profile.certificates.subtitle')} completeness={completeness}>
      <div className="space-y-4">
        {profile.certificates.length === 0 && !editing ? <p className="text-sm text-muted-foreground">{t('profile.certificates.empty')}</p> : null}
        {profile.certificates.map((item) => (
          <article key={item.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.issuer} · {item.issueDate}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(item)}>{t('profile.certificates.edit')}</button>
              <button type="button" className="btn-ghost text-error" onClick={() => void profileService.deleteCertificate(item.id).then(reload)}>{t('profile.certificates.delete')}</button>
            </div>
          </article>
        ))}
        {editing ? <div className="rounded-xl border border-subtle bg-surface-raised p-4"><CertificateForm initial={editing === 'new' ? undefined : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} /></div> : <button type="button" className="btn-primary" onClick={() => setEditing('new')}>{t('profile.certificates.add')}</button>}
      </div>
    </ProfileSectionLayout>
  );
};
