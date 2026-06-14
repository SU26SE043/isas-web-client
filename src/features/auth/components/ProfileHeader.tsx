import React from 'react';
import { useLanguage } from '../../../shared/languages';

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  onEditClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ fullName, email, onEditClick }) => {
  const { t } = useLanguage();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 1);
  };

  return (
    <div className="bg-[#FFF8E7] rounded-2xl p-8 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-slate-600">{getInitials(fullName)}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-9 h-9 bg-yellow-400 rounded-full border-3 border-white flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{fullName}</h1>
            <p className="text-slate-600">{email}</p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-900 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          {t('profile.editProfile')}
        </button>
      </div>
    </div>
  );
};