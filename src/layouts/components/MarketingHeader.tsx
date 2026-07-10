import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { AvatarDropdown } from '@/features/auth/components/AvatarDropdown';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { LanguageToggle } from '../LanguageToggle';
import { MarketingMobileNav } from './MarketingMobileNav';

const desktopNavLinks = [
  { href: '/', labelKey: 'nav.home', isHash: false },
  { href: '/#features', labelKey: 'nav.features', isHash: true },
  { href: '/pricing', labelKey: 'nav.pricing', isHash: false },
  { href: '/enterprise', labelKey: 'nav.enterprise', isHash: false },
] as const;

export const MarketingHeader: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-subtle bg-surface-base/80 backdrop-blur-xl">
        <div className="page-container">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex shrink-0 items-center focus-ring rounded-md">
              <img
                alt="ISAS Logo"
                className="h-8 w-auto object-contain"
                src="/logo-horizontal-white.png"
              />
            </Link>

            <nav className="hidden items-center gap-6 lg:gap-8 md:flex" aria-label={t('nav.main')}>
              {desktopNavLinks.map((item) =>
                item.isHash ? (
                  <a key={item.labelKey} className="nav-link focus-ring rounded-md" href={item.href}>
                    {t(item.labelKey)}
                  </a>
                ) : (
                  <Link key={item.labelKey} className="nav-link focus-ring rounded-md" to={item.href}>
                    {t(item.labelKey)}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-secondary hidden sm:inline-flex"
                  >
                    {t('nav.signIn')}
                  </button>
                  <Link to="/register" className="btn-primary hidden sm:inline-flex">
                    {t('nav.getStarted')}
                  </Link>
                </>
              )}
              <button
                type="button"
                className="btn-ghost inline-flex size-9 items-center justify-center p-0 md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-marketing-nav"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                <span className="sr-only">{t('nav.mobileMenu')}</span>
                {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        <MarketingMobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onSignIn={() => setIsAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
        />
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
