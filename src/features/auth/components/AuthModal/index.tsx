import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { SignUpOrgForm } from './SignUpOrgForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthOverlay } from './AuthOverlay';
import { useLanguage } from '../../../../shared/languages';
import {
  backdropVariants,
  modalShellVariants,
  modalTransition,
  panelTransition,
} from './authModal.animations';

export type AuthModalView = 'login' | 'signup' | 'signup-org';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthModalView;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOrgSignUp, setIsOrgSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSignUpClick = useCallback(() => {
    setIsSignUp(true);
    setIsOrgSignUp(false);
    setIsForgotPassword(false);
  }, []);

  const handleSignInClick = useCallback(() => {
    setIsSignUp(false);
    setIsOrgSignUp(false);
    setIsForgotPassword(false);
  }, []);

  const handleOrgSignUpClick = useCallback(() => {
    setIsSignUp(true);
    setIsOrgSignUp(true);
    setIsForgotPassword(false);
  }, []);

  const handleCandidateSignUpClick = useCallback(() => {
    setIsSignUp(true);
    setIsOrgSignUp(false);
    setIsForgotPassword(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialView === 'signup' || initialView === 'signup-org');
      setIsOrgSignUp(initialView === 'signup-org');
      setIsForgotPassword(false);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (!isOpen) {
      const timer = window.setTimeout(() => {
        setIsSignUp(false);
        setIsOrgSignUp(false);
        setIsForgotPassword(false);
      }, reducedMotion ? 0 : 550);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleClose]);

  const dialogLabel = isSignUp
    ? isOrgSignUp
      ? t('auth.signUpOrgTitle')
      : t('auth.signUpTitle')
    : t('auth.signInTitle');

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="auth-modal-backdrop"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md"
            variants={backdropVariants(reducedMotion)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={modalTransition(reducedMotion)}
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              key="auth-modal-shell"
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
              className="pointer-events-auto relative flex h-[550px] w-full max-w-[800px] overflow-hidden rounded-xl surface-elevated"
              variants={modalShellVariants(reducedMotion)}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={modalTransition(reducedMotion)}
              onClick={(event) => event.stopPropagation()}
            >
            <button
              type="button"
              onClick={handleClose}
              className={`absolute top-4 right-4 z-50 rounded-full p-2 transition-colors focus-ring ${
                isSignUp ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-foreground'
              }`}
              aria-label={t('auth.close')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              className="absolute top-0 left-0 z-10 h-full w-1/2 bg-surface-raised"
              animate={{ x: isSignUp ? '100%' : '0%' }}
              transition={panelTransition(reducedMotion)}
            >
              <SignInForm
                isSignUp={isSignUp}
                isForgotPassword={isForgotPassword}
                onForgotPasswordClick={() => setIsForgotPassword(true)}
                onLoginSuccess={handleClose}
                reducedMotion={reducedMotion}
              />

              <ForgotPasswordForm
                isSignUp={isSignUp}
                isForgotPassword={isForgotPassword}
                onBackToSignInClick={() => setIsForgotPassword(false)}
                reducedMotion={reducedMotion}
              />

              <SignUpForm
                isSignUp={isSignUp}
                isOrgSignUp={isOrgSignUp}
                onRegisterSuccess={handleSignInClick}
                onOrgSignUpClick={handleOrgSignUpClick}
                reducedMotion={reducedMotion}
              />

              <SignUpOrgForm
                isSignUp={isSignUp}
                isOrgSignUp={isOrgSignUp}
                onRegisterSuccess={handleSignInClick}
                onCandidateSignUpClick={handleCandidateSignUpClick}
                reducedMotion={reducedMotion}
              />
            </motion.div>

            <AuthOverlay
              isSignUp={isSignUp}
              onSignUpClick={handleSignUpClick}
              onSignInClick={handleSignInClick}
              reducedMotion={reducedMotion}
            />
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
