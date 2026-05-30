import React from 'react';
import { useLanguage } from '../../../../shared/languages';

interface AuthOverlayProps {
  isSignUp: boolean;
  onSignUpClick: () => void;
  onSignInClick: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ isSignUp, onSignUpClick, onSignInClick }) => {
  const { t } = useLanguage();

  return (
    <div className={`absolute top-0 left-1/2 w-1/2 h-full transition-all duration-700 ease-in-out z-20 overflow-hidden ${isSignUp ? '-translate-x-full bg-brand-green text-white' : 'translate-x-0 bg-brand-yellow text-brand-green'}`}>
      
      {/* Overlay Background Pattern (Optional styling) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative w-full h-full">
        {/* Right Overlay Panel (For Sign In mode) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 text-center transition-all duration-700 delay-100 ${isSignUp ? 'translate-x-[20%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <h1 className="text-4xl font-extrabold mb-4">{t('auth.helloTitle')}</h1>
          <p className="text-base text-brand-green/80 mb-10 font-medium leading-relaxed">
            {t('auth.helloDescription')}
          </p>
          <button 
            onClick={onSignUpClick}
            className="bg-brand-green text-brand-yellow px-14 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-green-light active:scale-95 transition-all shadow-lg shadow-brand-green/30"
          >
            {t('auth.signUp')}
          </button>
        </div>

        {/* Left Overlay Panel (For Sign Up mode) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 text-center transition-all duration-700 delay-100 ${isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>
          <h1 className="text-4xl font-extrabold mb-4">{t('auth.welcomeBackTitle')}</h1>
          <p className="text-base text-white/80 mb-10 font-medium leading-relaxed">
            {t('auth.welcomeBackDescription')}
          </p>
          <button 
            onClick={onSignInClick}
            className="bg-brand-yellow text-brand-green px-14 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-yellow-dark active:scale-95 transition-all shadow-lg shadow-brand-yellow/30"
          >
            {t('auth.signInTitle')}
          </button>
        </div>
      </div>
    </div>
  );
};
