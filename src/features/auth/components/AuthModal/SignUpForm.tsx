import React, { useState } from 'react';
import { getApiErrorMessage, getApiStatusCode } from '../../../../shared/api';
import { useLanguage } from '../../../../shared/languages';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

interface SignUpFormProps {
  isSignUp: boolean;
  onRegisterSuccess: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ isSignUp, onRegisterSuccess }) => {
  const { t } = useLanguage();
  const { fetchUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setStatusMessage(t('auth.registerRequired'));
      return;
    }

    if (password.length < 6) {
      setStatusMessage(t('auth.passwordMinLength'));
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      await authService.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
      });
      await fetchUser();
      setStatusMessage(t('auth.registerSuccess'));
      onRegisterSuccess();
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      // Handle email already in use (400 Conflict)
      if (statusCode === 400) {
        setStatusMessage(t('auth.emailAlreadyUsed'));
      } else {
        setStatusMessage(getApiErrorMessage(error, t('auth.registerFailed')));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 delay-100 ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-[10%]'}`}
    >
      <h1 className="text-4xl font-extrabold mb-6 text-slate-800 tracking-tight">{t('auth.signUpTitle')}</h1>
      
      {/* Google Login */}
      <div className="w-full mb-6">
        <button className="w-full h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-pine hover:text-pine hover:bg-pine/5 transition-colors font-bold space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Google</span>
        </button>
      </div>

      <span className="text-xs text-slate-400 mb-6 font-medium">{t('auth.signUpSubtitle')}</span>
      
      <input 
        className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400" 
        placeholder={t('auth.fullNamePlaceholder')}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
      />
      <input 
        className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400" 
        placeholder="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />
      <input 
        className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pine/30 transition-all placeholder:text-slate-400"
        type="password" 
        placeholder={t('auth.password')}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />

      <p className={`min-h-5 mb-3 text-xs font-bold text-center ${statusMessage === t('auth.registerSuccess') ? 'text-pine' : 'text-red-500'}`}>
        {statusMessage}
      </p>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-milk text-pine px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-milk/90 active:scale-95 transition-all shadow-lg shadow-milk/30 w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('auth.registering') : t('auth.signUp')}
      </button>
    </form>
  );
};
