import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EditProfileModal } from '@/features/auth/components/EditProfileModal';
import { useLanguage } from '@/shared/languages';
import { useProfile } from '../hooks/useProfile';
import { CandidateProfileHeader } from '../components/profile-view/CandidateProfileHeader';
import { ProfileAboutSection } from '../components/profile-view/ProfileAboutSection';
import { ProfileExperienceSection } from '../components/profile-view/ProfileExperienceSection';
import { ProfileEducationSection } from '../components/profile-view/ProfileEducationSection';
import { ProfileSkillsSection } from '../components/profile-view/ProfileSkillsSection';
import { ProfileCertificationsSection } from '../components/profile-view/ProfileCertificationsSection';
import { ProfileProjectsSection } from '../components/profile-view/ProfileProjectsSection';
import { ProfileContactSection } from '../components/profile-view/ProfileContactSection';
import { ProfileSidebar } from '../components/profile-view/ProfileSidebar';
import { ProfileViewLoading } from '../components/profile-view/ProfileViewLoading';

export const ProfileViewPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, fetchUser } = useAuth();
  const { profile, completeness, isLoading } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading || !profile || !completeness) {
    return <ProfileViewLoading />;
  }

  return (
    <div className="dashboard-content min-h-full">
      <p className="text-label mb-4 text-muted-foreground">{t('profile.breadcrumb')}</p>

      <div className="space-y-4">
        <CandidateProfileHeader
          fullName={user?.fullName ?? t('profile.view.notSet')}
          title={user?.title}
          location={user?.location}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          <aside className="order-1 lg:order-2">
            <ProfileSidebar completeness={completeness} />
          </aside>

          <main className="order-2 space-y-4 lg:order-1">
            <ProfileAboutSection careerGoal={profile.careerGoal} />
            <ProfileExperienceSection experiences={profile.experiences} />
            <ProfileEducationSection education={profile.education} />
            <ProfileSkillsSection skills={profile.skills} />
            <ProfileCertificationsSection certificates={profile.certificates} />
            <ProfileProjectsSection portfolio={profile.portfolio} />
            <ProfileContactSection socialLinks={profile.socialLinks} />
          </main>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => void fetchUser()}
      />
    </div>
  );
};
