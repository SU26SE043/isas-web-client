import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../shared/languages';
import { overlayPanelVariants, panelTransition } from './authModal.animations';

interface AuthOverlayProps {
  isSignUp: boolean;
  onSignUpClick: () => void;
  onSignInClick: () => void;
  reducedMotion: boolean | null;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({
  isSignUp,
  onSignUpClick,
  onSignInClick,
  reducedMotion,
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      className={`absolute top-0 left-1/2 z-20 h-full w-1/2 overflow-hidden ${
        isSignUp ? 'bg-surface-raised text-white' : 'bg-surface-overlay text-foreground'
      }`}
      animate={{ x: isSignUp ? '-100%' : '0%' }}
      transition={panelTransition(reducedMotion)}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

      <div className="relative h-full w-full">
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center"
          variants={overlayPanelVariants(reducedMotion)}
          initial={false}
          custom={1}
          animate={isSignUp ? 'inactive' : 'active'}
        >
          <h1 className="text-4xl heading-primary mb-4">{t('auth.helloTitle')}</h1>
          <p className="text-base text-muted-foreground mb-10 font-medium leading-relaxed">
            {t('auth.helloDescription')}
          </p>
          <button
            type="button"
            onClick={onSignUpClick}
            className="btn-secondary uppercase tracking-wider px-14"
          >
            {t('auth.signUp')}
          </button>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center"
          variants={overlayPanelVariants(reducedMotion)}
          initial={false}
          custom={-1}
          animate={isSignUp ? 'active' : 'inactive'}
        >
          <h1 className="text-4xl heading-primary mb-4">{t('auth.welcomeBackTitle')}</h1>
          <p className="text-base text-white/80 mb-10 font-medium leading-relaxed">
            {t('auth.welcomeBackDescription')}
          </p>
          <button
            type="button"
            onClick={onSignInClick}
            className="btn-secondary uppercase tracking-wider px-14"
          >
            {t('auth.signInTitle')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
