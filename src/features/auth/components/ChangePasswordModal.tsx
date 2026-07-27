import React, { useState } from 'react';
import { useLanguage } from '../../../shared/languages';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../../../shared/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

type ChangePasswordStep = 'confirm' | 'otp' | 'reset';

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, email, onClose }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<ChangePasswordStep>('confirm');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email: email.trim() });
      setStep('otp');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.verifyOtp({ email: email.trim(), otp: otp.trim() });
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError(t('auth.passwordRequireNumber'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      setSuccess(t('auth.resetSuccess'));
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-surface-raised rounded-xl shadow-md p-8 max-w-md w-full">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-overlay transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'confirm' && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('profile.security')}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Xác nhận thay đổi mật khẩu cho tài khoản {email}
            </p>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="btn-primary w-full mb-3 disabled:opacity-70"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
            <button
              onClick={handleClose}
              className="text-muted-foreground px-6 py-3 rounded-xl font-medium w-full hover:bg-surface-overlay transition-colors"
            >
              Hủy
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth.verifyOtpTitle')}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('auth.verifyOtpDescription')}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-surface-overlay border border-subtle rounded-xl text-sm text-muted-foreground"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">OTP</label>
              <input
                type="text"
                placeholder={t('auth.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-surface-overlay border border-default rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-xs text-error mb-4 font-medium">{error}</p>}
            {!error && <div className="h-5"></div>}

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="btn-primary w-full mb-3 disabled:opacity-70"
            >
              {isLoading ? t('auth.verifying') : t('auth.verify')}
            </button>
            <button
              onClick={handleClose}
              className="text-muted-foreground px-6 py-3 rounded-xl font-medium w-full hover:bg-surface-overlay transition-colors"
            >
              Hủy
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth.resetPasswordTitle')}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('auth.resetPasswordDescription')}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-surface-overlay border border-subtle rounded-xl text-sm text-muted-foreground"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || !!success}
                  className="w-full px-4 py-2.5 bg-surface-overlay border border-default rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-error mb-4 font-medium">{error}</p>}
            {success && <p className="text-xs text-foreground mb-4 font-medium">{success}</p>}
            {!error && !success && <div className="h-5"></div>}

            <button
              onClick={handleResetPassword}
              disabled={isLoading || !!success}
              className="btn-primary w-full mb-3 disabled:opacity-70"
            >
              {isLoading ? t('auth.resetting') : t('auth.reset')}
            </button>
            {!success && (
              <button
                onClick={handleClose}
                className="text-muted-foreground px-6 py-3 rounded-xl font-medium w-full hover:bg-surface-overlay transition-colors"
              >
                Hủy
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
