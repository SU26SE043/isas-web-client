import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

interface MarketingMobileNavProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const navLinks = [
  { href: '/', labelKey: 'nav.home', isHash: false },
  { href: '/#features', labelKey: 'nav.features', isHash: true },
  { href: '/pricing', labelKey: 'nav.pricing', isHash: false },
  { href: '/enterprise', labelKey: 'nav.enterprise', isHash: false },
] as const;

export const MarketingMobileNav: React.FC<MarketingMobileNavProps> = ({
  open,
  onClose,
  isAuthenticated,
  onSignInClick,
  onSignUpClick,
}) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <nav
      id="mobile-marketing-nav"
      className="border-t border-subtle bg-surface-base/80 backdrop-blur-md md:hidden"
      aria-label={t('nav.mobileMenu')}
    >
      <ul className="page-container flex flex-col gap-1 py-4">
        {navLinks.map((item) => (
          <li key={item.labelKey}>
            {item.isHash ? (
              <a
                href={item.href}
                className="nav-link focus-ring block rounded-md px-2 py-3"
                onClick={onClose}
              >
                {t(item.labelKey)}
              </a>
            ) : (
              <Link
                to={item.href}
                className="nav-link focus-ring block rounded-md px-2 py-3"
                onClick={onClose}
              >
                {t(item.labelKey)}
              </Link>
            )}
          </li>
        ))}
        {!isAuthenticated && (
          <li className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => {
                onClose();
                onSignInClick();
              }}
            >
              {t('nav.signIn')}
            </button>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => {
                onClose();
                onSignUpClick();
              }}
            >
              {t('nav.signUp')}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
