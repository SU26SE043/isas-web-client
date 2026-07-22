import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/shared/api';
import { useLanguage } from '@/shared/languages';
import { authService } from '../services/authService';
import { validatePassword } from '../utils/passwordPolicy';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetState = useCallback(() => {
    setOldPassword('');
    setNewPassword('');
    setError('');
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isLoading, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!oldPassword) {
      setError(t('auth.oldPasswordRequired'));
      return;
    }
    if (!validatePassword(newPassword).valid) {
      setError(t('auth.passwordComplexity'));
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.changePasswordFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-label={t('auth.close')}
      />
      <section
        className="frame-satin surface-elevated relative w-full max-w-md rounded-xl p-6 shadow-xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div className="mb-6">
          <h2 id="change-password-title" className="text-2xl font-bold text-foreground">
            {t('profile.change')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.changePasswordDescription')}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="old-password">{t('auth.oldPassword')}</Label>
            <Input
              id="old-password"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              disabled={isLoading || success}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t('auth.newPasswordPlaceholder')}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isLoading || success}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? <Alert variant="success">{t('auth.passwordUpdated')}</Alert> : null}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
              {success ? t('auth.close') : t('profile.cancel')}
            </Button>
            {!success ? (
              <Button type="submit" className="flex-1" loading={isLoading}>
                {isLoading ? t('auth.changingPassword') : t('profile.change')}
              </Button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
