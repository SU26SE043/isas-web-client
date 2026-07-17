import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EditProfileModal } from '@/features/auth/components/EditProfileModal';
import { useUploadedCvFiles } from '@/features/cv-analysis/hooks/useUploadedCvFiles';
import { useLanguage } from '@/shared/languages';
import { CandidateProfileHeader } from '../components/profile-view/CandidateProfileHeader';
import { ProfileBasicInfoCard } from '../components/profile-view/ProfileBasicInfoCard';
import { ProfileUploadedCvSection } from '../components/profile-view/ProfileUploadedCvSection';
import { ProfileViewLoading } from '../components/profile-view/ProfileViewLoading';

export const ProfileViewPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();
  const { files, isLoading: cvLoading } = useUploadedCvFiles();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading || !user) {
    return <ProfileViewLoading />;
  }

  return (
    <div className="dashboard-content min-h-full">
      <header className="mb-6 space-y-1">
        <p className="text-label text-muted-foreground">{t('profile.breadcrumb')}</p>
        <h1 className="heading-primary text-2xl text-foreground">{t('profile.view.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('profile.view.subtitleSimple')}</p>
      </header>

      <div className="mx-auto max-w-4xl space-y-4">
        <CandidateProfileHeader
          fullName={user.fullName || t('profile.view.notSet')}
          title={user.title}
          location={user.location}
          onEditClick={() => setIsEditModalOpen(true)}
        />
        <ProfileBasicInfoCard user={user} />
        <ProfileUploadedCvSection files={files} isLoading={cvLoading} />
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
