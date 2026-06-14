import React from 'react';
import { useLanguage } from '../../../shared/languages';

interface PersonalInfoCardProps {
  location?: string;
  title?: string;
  onEditClick: () => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ location, title, onEditClick }) => {
  const { t } = useLanguage();

  const EditButton = () => (
    <button onClick={onEditClick} className="p-1 hover:bg-gray-100 rounded transition-colors">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('profile.additionalInfo')}</h2>
      <div className="space-y-6">
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm font-medium text-slate-900">{t('profile.location')}</span>
            </div>
            <EditButton />
          </div>
          <p className="text-sm font-medium text-slate-900">{location || t('profile.notUpdated')}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="text-sm font-medium text-slate-900">{t('profile.title')}</span>
            </div>
            <EditButton />
          </div>
          <p className="text-sm font-medium text-slate-900">{title || t('profile.notUpdated')}</p>
        </div>
      </div>
    </div>
  );
};