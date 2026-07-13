import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthModalTabs, type AuthTab } from './AuthModalTabs';
import { useLanguage } from '../../../../shared/languages';
import { cn } from '@/lib/utils';
import {
  backdropVariants,
  contentSlideVariants,
  heightTransition,
  modalOpenTransition,
  modalShellVariants,
} from './authModal.animations';
import { useAuthModalFocusTrap } from './useAuthModalFocusTrap';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
  redirectFrom?: string;
  sessionExpired?: boolean;
  registeredEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
  redirectFrom,
  sessionExpired = false,
  registeredEmail,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [direction, setDirection] = useState(0);
  const [autoFocusOnOpen, setAutoFocusOnOpen] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const isSignUp = activeTab === 'signup';
  const showTabs = !isForgotPassword;
  const contentKey = isForgotPassword ? 'forgot' : activeTab;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleTabChange = useCallback((tab: AuthTab) => {
    setAutoFocusOnOpen(false);
    setDirection(tab === 'signup' ? 1 : -1);
    setActiveTab(tab);
    setIsForgotPassword(false);
  }, []);

  const handleSignInTab = useCallback(() => {
    setAutoFocusOnOpen(false);
    setDirection(-1);
    setActiveTab('login');
    setIsForgotPassword(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView === 'signup' ? 'signup' : 'login');
      setIsForgotPassword(false);
      setDirection(0);
      setAutoFocusOnOpen(true);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (!isOpen) {
      const timer = window.setTimeout(() => {
        setActiveTab('login');
        setIsForgotPassword(false);
        setDirection(0);
      }, reducedMotion ? 0 : 450);
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

  useAuthModalFocusTrap(modalRef, isOpen, autoFocusOnOpen);

  const dialogLabel = isForgotPassword
    ? t('auth.forgotTitle')
    : isSignUp
      ? t('auth.signUpTitle')
      : t('auth.signInTitle');

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="auth-modal-backdrop"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            variants={backdropVariants(reducedMotion)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={modalOpenTransition(reducedMotion)}
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              ref={modalRef}
              key="auth-modal-shell"
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
              className={cn(
                'pointer-events-auto relative w-full max-w-[460px] overflow-hidden',
                'rounded-2xl border border-default bg-surface-elevated/95 shadow-lg backdrop-blur-xl',
              )}
              variants={modalShellVariants(reducedMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={modalOpenTransition(reducedMotion)}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-overlay hover:text-foreground focus-ring"
                aria-label={t('auth.close')}
              >
                <XIcon className="size-5" aria-hidden />
              </button>

              <div className="px-6 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
                {showTabs ? (
                  <AuthModalTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    reducedMotion={reducedMotion}
                  />
                ) : null}

                <motion.div
                  layout
                  transition={heightTransition(reducedMotion)}
                  className="grid overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1"
                >
                  <AnimatePresence initial={false} custom={direction} mode="sync">
                    <motion.div
                      key={contentKey}
                      custom={direction}
                      variants={contentSlideVariants(reducedMotion)}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      role="tabpanel"
                      id={`auth-panel-${contentKey}`}
                      aria-labelledby={showTabs ? `auth-tab-${activeTab}` : undefined}
                      className="col-start-1 row-start-1"
                    >
                        {isForgotPassword ? (
                          <ForgotPasswordForm
                            onBackToSignInClick={handleSignInTab}
                            reducedMotion={reducedMotion}
                          />
                        ) : isSignUp ? (
                          <SignUpForm
                            onRegisterSuccess={handleSignInTab}
                            reducedMotion={reducedMotion}
                          />
                        ) : (
                          <SignInForm
                            onForgotPasswordClick={() => {
                              setAutoFocusOnOpen(false);
                              setIsForgotPassword(true);
                            }}
                            onLoginSuccess={handleClose}
                            reducedMotion={reducedMotion}
                            redirectFrom={redirectFrom}
                            sessionExpired={sessionExpired}
                            registeredEmail={registeredEmail}
                          />
                        )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
