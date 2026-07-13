import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { AuthModal } from '../features/auth/components/AuthModal';
import { AvatarDropdown } from '../features/auth/components/AvatarDropdown';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useLanguage } from '../shared/languages';
import { LanguageToggle } from './LanguageToggle';

export const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-subtle bg-surface-base/80 backdrop-blur-xl">
        <div className="page-container">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link to="/" className="flex shrink-0 items-center focus-ring rounded-md">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
              <Link className="nav-link focus-ring rounded-md" to="/">
                {t('nav.home')}
              </Link>
              <Link className="nav-link focus-ring rounded-md" to="/candidate/profile">
                {t('nav.profile')}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalView('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="btn-secondary hidden sm:inline-flex"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalView('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="btn-primary"
                  >
                    {t('nav.getStarted')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </>
  );
};
