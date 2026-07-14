import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AvatarDropdown } from '@/features/auth/components/AvatarDropdown';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { BrandLogo } from '@/components/BrandLogo';
import { LanguageToggle } from '../LanguageToggle';
import { MarketingMobileNav } from './MarketingMobileNav';
import { useMarketingAuthModal } from '../MarketingAuthModalProvider';

const desktopNavLinks = [
  { href: '/', labelKey: 'nav.home', isHash: false },
  { href: '/#features', labelKey: 'nav.features', isHash: true },
  { href: '/pricing', labelKey: 'nav.pricing', isHash: false },
  { href: '/enterprise', labelKey: 'nav.enterprise', isHash: false },
] as const;

export const MarketingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { openAuthModal } = useMarketingAuthModal();

  return (
    <>
      <header className="glass-topbar sticky top-0 z-50 border-b">
        <div className="page-container">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex shrink-0 items-center focus-ring rounded-md">
              <BrandLogo />
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
                    onClick={() => openAuthModal('login')}
                    className="btn-secondary hidden sm:inline-flex"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="btn-primary hidden sm:inline-flex"
                  >
                    {t('nav.getStarted')}
                  </button>
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
          isAuthenticated={isAuthenticated}
          onSignInClick={() => openAuthModal('login')}
          onSignUpClick={() => openAuthModal('signup')}
        />
      </header>
    </>
  );
};
