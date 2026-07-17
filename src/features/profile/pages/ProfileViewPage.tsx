import React, { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EditProfileModal } from '@/features/auth/components/EditProfileModal';
import { useInterviewFiles } from '@/features/cv-analysis/hooks/useInterviewFiles';
import {
  CandidateProfileHeader,
  ProfilePageHeader,
} from '../components/profile-view/CandidateProfileHeader';
import { ProfileBasicInfoCard } from '../components/profile-view/ProfileBasicInfoCard';
import { ProfileUploadedFilesSection } from '../components/profile-view/ProfileUploadedFilesSection';
import { ProfileViewLoading } from '../components/profile-view/ProfileViewLoading';
import { countProfileFilesByType } from '../components/profile-view/profileFilesFilter';

export const ProfileViewPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { files, isLoading: isFilesLoading, error, reload } = useInterviewFiles();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fileCounts = useMemo(() => countProfileFilesByType(files), [files]);

  if (isLoading || !user) {
    return <ProfileViewLoading />;
  }

  return (
    <div className="dashboard-content min-h-full">
      <ProfilePageHeader onEditClick={() => setIsEditModalOpen(true)} />

      <div className="mx-auto max-w-6xl space-y-4">
        <CandidateProfileHeader
          fullName={user.fullName || user.email}
          title={user.title}
          email={user.email}
          memberSince={user.createdAt}
          cvCount={fileCounts.cv}
          jdCount={fileCounts.jd}
        />
        <ProfileBasicInfoCard user={user} />
        <ProfileUploadedFilesSection
          files={files}
          isLoading={isFilesLoading}
          error={error}
          reload={reload}
        />
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
