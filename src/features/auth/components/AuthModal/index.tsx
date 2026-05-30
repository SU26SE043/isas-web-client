import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthOverlay } from './AuthOverlay';
import { useLanguage } from '../../../../shared/languages';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Background */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[800px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex z-10">
        
        {/* Close Button (Absolute positioned on top of everything) */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-50 p-2 rounded-full transition-colors ${isSignUp ? 'text-slate-400 hover:text-brand-green' : 'text-white/80 hover:text-white'} `}
          aria-label={t('auth.close')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* --- Form Container (Moves Left <-> Right) --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full bg-white transition-transform duration-700 ease-in-out z-10 ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
          
          <SignInForm 
            isSignUp={isSignUp} 
            isForgotPassword={isForgotPassword} 
            onForgotPasswordClick={() => setIsForgotPassword(true)} 
          />

          <ForgotPasswordForm 
            isSignUp={isSignUp} 
            isForgotPassword={isForgotPassword} 
            onBackToSignInClick={() => setIsForgotPassword(false)} 
          />

          <SignUpForm 
            isSignUp={isSignUp} 
          />

        </div>

        {/* --- Overlay Container (Moves Right <-> Left) --- */}
        <AuthOverlay 
          isSignUp={isSignUp}
          onSignUpClick={() => { setIsSignUp(true); setIsForgotPassword(false); }}
          onSignInClick={() => { setIsSignUp(false); setIsForgotPassword(false); }}
        />

      </div>
    </div>
  );
};
