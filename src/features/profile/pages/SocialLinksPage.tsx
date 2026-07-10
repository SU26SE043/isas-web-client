import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { SocialLinks } from '../types/profile.types';

export const SocialLinksPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [links, setLinks] = useState<SocialLinks>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) setLinks(profile.socialLinks);
  }, [profile]);

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  const fields: Array<keyof SocialLinks> = ['linkedin', 'github', 'website', 'twitter'];

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await profileService.updateSocialLinks(links);
      toast.success(t('profile.social.saved'));
      await reload();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileSectionLayout title={t('profile.social.title')} description={t('profile.social.subtitle')} completeness={completeness}>
      <form onSubmit={(event) => void handleSave(event)} className="rounded-xl border border-subtle bg-surface-raised p-6 space-y-4">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="text-label text-muted-foreground">{t(`profile.social.${field}`)}</span>
            <input
              className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
              value={links[field] ?? ''}
              onChange={(event) => setLinks((prev) => ({ ...prev, [field]: event.target.value }))}
            />
          </label>
        ))}
        <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? t('profile.common.saving') : t('profile.social.save')}</button>
      </form>
    </ProfileSectionLayout>
  );
};
