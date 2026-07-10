import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

interface MarketingMobileNavProps {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
  isAuthenticated: boolean;
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
  onSignIn,
  isAuthenticated,
}) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <nav
      id="mobile-marketing-nav"
      className="border-t border-subtle bg-surface-base md:hidden"
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
          <li className="pt-2">
            <button type="button" className="btn-secondary w-full" onClick={() => { onSignIn(); onClose(); }}>
              {t('nav.signIn')}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
