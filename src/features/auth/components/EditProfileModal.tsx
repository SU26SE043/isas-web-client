import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/app-modal';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import type { UpdateProfileRequest } from '../types/auth.types';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { useLanguage } from '../../../shared/languages';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function toProfileFormState(user: {
  fullName?: string;
  location?: string;
  title?: string;
}): Required<Pick<UpdateProfileRequest, 'fullName' | 'location' | 'title'>> {
  return {
    fullName: user.fullName ?? '',
    location: user.location ?? '',
    title: user.title ?? '',
  };
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(toProfileFormState(user ?? {}));

  useEffect(() => {
    if (!isOpen || !user) return;
    setFormData(toProfileFormState(user));
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload: UpdateProfileRequest = {
      fullName: formData.fullName?.trim() || null,
      location: formData.location?.trim() || null,
      title: formData.title?.trim() || null,
    };

    try {
      setIsLoading(true);
      // PUT ignores response body; service re-fetches GET /me and returns the fresh user.
      const updatedUser = await authService.updateProfile(payload);
      setUser(updatedUser);
      toast.success(t('profile.updateSuccess'));
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('profile.updateError')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      closeLabel={t('profile.cancel')}
      ariaLabel={t('profile.editInfo')}
      contentClassName="max-w-[480px] gap-0 overflow-hidden p-0 sm:max-w-[480px]"
    >
      <div className="flex items-center gap-3 border-b border-subtle bg-surface-base px-6 py-5 pr-16">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-subtle bg-surface-raised text-muted-foreground">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">{t('profile.editInfo')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <svg
                className="h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {t('profile.fullName')}
            </label>
            <input
              type="text"
              value={formData.fullName ?? ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-default px-4 py-2.5 text-foreground transition-all focus:border-satin focus:outline-none focus:ring-4 focus:ring-white/10 disabled:opacity-50"
              placeholder={t('profile.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <svg
                className="h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {t('profile.location')}
            </label>
            <input
              type="text"
              value={formData.location ?? ''}
              onChange={(e) => handleChange('location', e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-default px-4 py-2.5 text-foreground transition-all focus:border-satin focus:outline-none focus:ring-4 focus:ring-white/10 disabled:opacity-50"
              placeholder={t('profile.locationPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <svg
                className="h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              {t('profile.title')}
            </label>
            <input
              type="text"
              value={formData.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-default px-4 py-2.5 text-foreground transition-all focus:border-satin focus:outline-none focus:ring-4 focus:ring-white/10 disabled:opacity-50"
              placeholder={t('profile.titlePlaceholder')}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-subtle pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-surface-overlay px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated"
            disabled={isLoading}
          >
            {t('profile.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('profile.saving')}
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {t('profile.saveChanges')}
              </>
            )}
          </button>
        </div>
      </form>
    </AppModal>
  );
};
