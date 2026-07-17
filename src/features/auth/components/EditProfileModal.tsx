import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]">
      <div className="bg-surface-raised rounded-lg shadow-sm w-full max-w-[480px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-subtle bg-surface-base">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-raised border border-subtle text-muted-foreground">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">{t('profile.editInfo')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-50"
            aria-label={t('profile.cancel')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                className="w-full px-4 py-2.5 border border-default rounded-md focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-satin transition-all text-foreground disabled:opacity-50"
                placeholder={t('profile.fullNamePlaceholder')}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                className="w-full px-4 py-2.5 border border-default rounded-md focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-satin transition-all text-foreground disabled:opacity-50"
                placeholder={t('profile.locationPlaceholder')}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                className="w-full px-4 py-2.5 border border-default rounded-md focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-satin transition-all text-foreground disabled:opacity-50"
                placeholder={t('profile.titlePlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 mt-8 pt-5 border-t border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium bg-surface-overlay text-muted-foreground rounded-md hover:bg-surface-elevated transition-colors"
              disabled={isLoading}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden>
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
                    className="w-4 h-4"
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
      </div>
    </div>
  );
};
