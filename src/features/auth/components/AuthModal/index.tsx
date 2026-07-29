import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AppModal } from '@/components/ui/app-modal';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { SignUpOrgForm } from './SignUpOrgForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthOverlay } from './AuthOverlay';
import { useLanguage } from '../../../../shared/languages';
import { panelTransition } from './authModal.animations';

export type AuthModalView = 'login' | 'signup' | 'signup-org';

type AuthPanel = 'signin' | 'signup' | 'signup-org' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthModalView;
}

function resolvePanel(isSignUp: boolean, isOrgSignUp: boolean, isForgotPassword: boolean): AuthPanel {
  if (!isSignUp && isForgotPassword) return 'forgot';
  if (isSignUp && isOrgSignUp) return 'signup-org';
  if (isSignUp) return 'signup';
  return 'signin';
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

  const activePanel = resolvePanel(isSignUp, isOrgSignUp, isForgotPassword);

  const dialogLabel =
    activePanel === 'signup-org'
      ? t('auth.signUpOrgTitle')
      : activePanel === 'signup'
        ? t('auth.signUpTitle')
        : activePanel === 'forgot'
          ? t('auth.forgotTitle')
          : t('auth.signInTitle');

  return (
    <AppModal
      open={isOpen}
      onClose={handleClose}
      size="auth"
      closeOnBackdrop={false}
      closeOnEscape
      showCloseButton
      closeLabel={t('auth.close')}
      ariaLabel={dialogLabel}
      closeButtonClassName={
        isSignUp
          ? 'border-satin text-muted-foreground hover:text-foreground'
          : 'border-satin text-white/80 hover:text-foreground'
      }
    >
      <div className="relative flex h-full min-h-0 w-full overflow-hidden rounded-2xl surface-elevated">
        <motion.div
          className="absolute top-0 left-0 z-10 h-full w-1/2 bg-surface-raised"
          animate={{ x: isSignUp ? '100%' : '0%' }}
          transition={panelTransition(reducedMotion)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {activePanel === 'signin' ? (
              <SignInForm
                key="signin"
                onForgotPasswordClick={() => setIsForgotPassword(true)}
                onLoginSuccess={handleClose}
                reducedMotion={reducedMotion}
              />
            ) : null}

            {activePanel === 'forgot' ? (
              <ForgotPasswordForm
                key="forgot"
                onBackToSignInClick={() => setIsForgotPassword(false)}
                reducedMotion={reducedMotion}
              />
            ) : null}

            {activePanel === 'signup' ? (
              <SignUpForm
                key="signup"
                onRegisterSuccess={handleSignInClick}
                onOrgSignUpClick={handleOrgSignUpClick}
                reducedMotion={reducedMotion}
              />
            ) : null}

            {activePanel === 'signup-org' ? (
              <SignUpOrgForm
                key="signup-org"
                onRegisterSuccess={handleSignInClick}
                onCandidateSignUpClick={handleCandidateSignUpClick}
                reducedMotion={reducedMotion}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <AuthOverlay
          isSignUp={isSignUp}
          onSignUpClick={handleSignUpClick}
          onSignInClick={handleSignInClick}
          reducedMotion={reducedMotion}
        />
      </div>
    </AppModal>
  );
};
