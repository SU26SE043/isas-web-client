import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { getProfileInitials } from './getProfileInitials';

interface CandidateProfileHeaderProps {
  fullName: string;
  title?: string;
  location?: string;
  onEditClick: () => void;
}

export const CandidateProfileHeader: React.FC<CandidateProfileHeaderProps> = ({
  fullName,
  title,
  location,
  onEditClick,
}) => {
  const { t } = useLanguage();
  const initials = getProfileInitials(fullName);

  return (
    <header className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <div
        className="h-24 bg-gradient-to-r from-surface-highlight via-surface-overlay to-surface-highlight sm:h-32"
        aria-hidden
      />
      <div className="px-4 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div
              className="flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-surface-raised bg-surface-elevated sm:size-28"
              aria-hidden
            >
              <span className="text-2xl font-semibold text-foreground sm:text-3xl">{initials}</span>
            </div>
            <div className="min-w-0 pb-0 sm:pb-1">
              <h1 className="heading-primary truncate text-2xl sm:text-3xl">{fullName}</h1>
              <p className="mt-1 text-sm font-medium text-foreground sm:text-base">
                {title || t('profile.view.notSet')}
              </p>
              {location ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{location}</span>
                </p>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={onEditClick} className="btn-secondary w-full sm:w-auto">
            {t('profile.editProfile')}
          </button>
        </div>
      </div>
    </header>
  );
};
