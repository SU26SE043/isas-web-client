import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { AuthModal } from '../features/auth/components/AuthModal';
import { AvatarDropdown } from '../features/auth/components/AvatarDropdown';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getProfileHomePath } from '../features/auth/utils/getPostLoginPath';
import { UserRole } from '../features/auth/types/auth.types';
import { useLanguage } from '../shared/languages';
import { LanguageToggle } from './LanguageToggle';

export const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const openAuth = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const profilePath = getProfileHomePath(user?.role ?? UserRole.GUEST);

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
              {isAuthenticated ? (
                <Link className="nav-link focus-ring rounded-md" to={profilePath}>
                  {t('nav.profile')}
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="btn-secondary hidden sm:inline-flex"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button type="button" onClick={() => openAuth('signup')} className="btn-primary">
                    {t('nav.signUp')}
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
        initialView={authView}
      />
    </>
  );
};
