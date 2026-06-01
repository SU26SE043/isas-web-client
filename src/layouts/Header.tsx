import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthModal } from '../features/auth/components/AuthModal';
import { AvatarDropdown } from '../features/auth/components/AvatarDropdown';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useLanguage } from '../shared/languages';
import { LanguageToggle } from './LanguageToggle';

export const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-milk/95 backdrop-blur-md">
        <div className="w-full px-6 lg:px-20 xl:px-32">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img alt="ISAS Logo" className="h-40 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0uiSmzxRAhvuypS8dnkXlByzB6ZActi4ZbzHfz46HjXli05zlL9fuVAnZ9hYqMCkx7re4gFO0tQSJL9t3gkXuq_JEMueNfJARZfxFSuhJ-Wc_9zSUQxx7vqJHYvSn5kHmWXjZ_NNFIgwsTfytR2edioszKgT6lESc4KMv9kElcWs3yHu7lCq4Cac67dy9TcSfu-80svuU65RrDJGg6CUfE6MD5hLeonAooKw4av-2takrkboPK0pX0MnuFoD" />
              </Link>
            </div>

            {/* Menu Links */}
            <div className="hidden md:flex space-x-10 items-center">
              <Link className="text-lg text-black hover:text-pine transition-colors font-medium heading-secondary" to="/">{t('nav.home')}</Link>
              <Link className="text-lg text-black hover:text-pine transition-colors font-medium heading-secondary" to="/dashboard">{t('nav.dashboard')}</Link>
              <Link className="text-lg text-black hover:text-pine transition-colors font-medium heading-secondary" to="/profile">{t('nav.profile')}</Link>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-white text-pine border-2 border-white rounded-lg px-[22px] py-[10px] font-bold hover:bg-white/90 transition-all"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-primary"
                  >
                    {t('nav.getStarted')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
