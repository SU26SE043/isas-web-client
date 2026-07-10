import React, { useState } from 'react';
import { useLanguage } from '../../../shared/languages';
import { ChangePasswordModal } from './ChangePasswordModal';
import { getRoleColor, getRoleDisplayName } from '../utils/rolePermissions';
import type { UserRoleType } from '../types/auth.types';

interface AccountInfoCardProps {
  userId: string;
  email: string;
  role: UserRoleType;
  createdAt: string;
  onCopyId: () => void;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hasBorder?: boolean;
}> = ({ icon, label, value, hasBorder = true }) => (
  <div className={`flex items-center justify-between py-4 ${hasBorder ? 'border-b border-subtle' : ''}`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-base flex items-center justify-center">{icon}</div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    <div>{value}</div>
  </div>
);

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  userId,
  email,
  role,
  createdAt,
  onCopyId,
}) => {
  const { t } = useLanguage();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const shortenId = (id: string) => {
    if (!id || id.length < 12) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  return (
    <div className="bg-surface-raised rounded-xl border border-subtle p-8">
      <h2 className="text-xl font-bold text-foreground mb-6">{t('profile.accountInfo')}</h2>
      <div className="space-y-5">
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            </svg>
          }
          label={t('profile.accountId')}
          value={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium font-mono text-foreground">{shortenId(userId)}</span>
              <button onClick={onCopyId} className="p-1 hover:bg-surface-overlay rounded transition-colors" title="Copy">
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          }
        />
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          }
          label={t('profile.role')}
          value={
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getRoleColor(role)}`}>
              {getRoleDisplayName(role)}
            </span>
          }
        />
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
            </svg>
          }
          label={t('profile.email')}
          value={<span className="text-sm font-medium text-foreground">{email}</span>}
        />
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label={t('profile.createdAt')}
          value={<span className="text-sm font-medium text-foreground">{formatDate(createdAt)}</span>}
        />
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
              <path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          }
          label={t('profile.securityLabel')}
          value={
            <button onClick={() => setIsChangePasswordOpen(true)} className="text-sm font-medium text-white hover:text-muted-foreground flex items-center gap-1">
              {t('profile.change')}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          }
        />
        <InfoRow
          icon={
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          }
          label={t('profile.language')}
          value={
            <button className="text-sm font-medium text-foreground flex items-center gap-1">
              {t('profile.vietnamese')}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          }
          hasBorder={false}
        />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        email={email}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
