import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

import { EditProfileModal } from '../components/EditProfileModal';
import { ProfileHeader } from '../components/ProfileHeader';
import { AccountInfoCard } from '../components/AccountInfoCard';
import { PersonalInfoCard } from '../components/PersonalInfoCard';
import { SecurityCard } from '../components/SecurityCard';
import { SecurityAlertCard } from '../components/SecurityAlertCard';
import { useLanguage } from '../../../shared/languages';

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  const { t } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSuccess = () => {
    console.log('Profile updated successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-subtle"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('profile.userNotFound')}</h2>
          <p className="text-muted-foreground">{t('profile.pleaseLoginAgain')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen surface-base">
      <div className="page-container dashboard-content">
        <ProfileHeader
          fullName={user.fullName}
          email={user.email}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AccountInfoCard
              userId={user.id}
              email={user.email}
              role={user.role}
              createdAt={user.createdAt}
              onCopyId={() => copyToClipboard(user.id)}
            />
          </div>

          <div className="space-y-6">
            <PersonalInfoCard
              location={user.location}
              title={user.title}
              onEditClick={() => setIsEditModalOpen(true)}
            />
            <SecurityCard />
            <SecurityAlertCard />
          </div>

        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </main>
  );
};