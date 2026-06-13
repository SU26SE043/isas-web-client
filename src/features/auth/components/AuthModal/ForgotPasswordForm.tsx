import React, { useState } from 'react';
import { useLanguage } from '../../../../shared/languages';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../../../shared/api';

interface ForgotPasswordFormProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onBackToSignInClick: () => void;
}

type ForgotPasswordStep = 'email' | 'otp' | 'reset';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ isSignUp, isForgotPassword, onBackToSignInClick }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError(t('auth.loginRequired')); // Can reuse or add a specific 'Please enter email'
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email: email.trim() });
      setStep('otp');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send reset link'));
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
      await authService.resetPassword({ email: email.trim(), newPassword });
      setSuccess(t('auth.resetSuccess'));
      // Optional: reset state and go back to sign in after a delay
      setTimeout(() => {
        handleBack();
      }, 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccess('');
    onBackToSignInClick();
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 delay-100 ${(!isSignUp && isForgotPassword) ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-[10%]'}`}>
      
      {step === 'email' && (
        <>
          <h1 className="text-4xl font-extrabold mb-4 text-slate-800 tracking-tight">{t('auth.forgotTitle')}</h1>
          <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
            {t('auth.forgotDescription')}
          </p>
          
          <input 
            className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400" 
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-500 w-full mb-4 font-medium">{error}</p>}
          {!error && <div className="h-6"></div>}

          <button 
            onClick={handleSendEmail}
            disabled={isLoading}
            className="bg-pine text-white px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-pine/90 active:scale-95 transition-all shadow-lg shadow-pine/30 w-full mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.sendingLink') : t('auth.sendLink')}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h1 className="text-4xl font-extrabold mb-4 text-slate-800 tracking-tight">{t('auth.verifyOtpTitle')}</h1>
          <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
            {t('auth.verifyOtpDescription')}
          </p>
          
          <input 
            className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-500 focus:outline-none" 
            value={email}
            disabled
          />

          <input 
            className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400" 
            placeholder={t('auth.otpPlaceholder')}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-500 w-full mb-4 font-medium">{error}</p>}
          {!error && <div className="h-6"></div>}

          <button 
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="bg-pine text-white px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-pine/90 active:scale-95 transition-all shadow-lg shadow-pine/30 w-full mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.verifying') : t('auth.verify')}
          </button>
        </>
      )}

      {step === 'reset' && (
        <>
          <h1 className="text-4xl font-extrabold mb-4 text-slate-800 tracking-tight">{t('auth.resetPasswordTitle')}</h1>
          <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
            {t('auth.resetPasswordDescription')}
          </p>
          
          <input 
            className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-500 focus:outline-none" 
            value={email}
            disabled
          />

          <input 
            type="password"
            className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400" 
            placeholder={t('auth.newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading || !!success}
          />
          {error && <p className="text-xs text-red-500 w-full mb-4 font-medium">{error}</p>}
          {success && <p className="text-xs text-pine w-full mb-4 font-medium">{success}</p>}
          {!error && !success && <div className="h-6"></div>}

          <button 
            onClick={handleResetPassword}
            disabled={isLoading || !!success}
            className="bg-pine text-white px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-pine/90 active:scale-95 transition-all shadow-lg shadow-pine/30 w-full mb-6 disabled:opacity-70"
          >
            {isLoading ? t('auth.resetting') : t('auth.reset')}
          </button>
        </>
      )}

      <button 
        onClick={(e) => { e.preventDefault(); handleBack(); }}
        className="text-sm font-medium text-slate-500 hover:text-pine transition-colors flex items-center space-x-2 mt-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{t('auth.backToSignIn')}</span>
      </button>
    </div>
  );
};
