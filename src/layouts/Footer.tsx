import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../shared/languages';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-subtle bg-surface-sunken">
      <div className="page-container page-section pb-10">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-1">
            <img
              alt="ISAS Logo"
              className="mb-6 h-8 w-auto object-contain"
              src="/logo-horizontal-white.png"
            />
            <p className="body-text max-w-sm text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-label mb-4">{t('footer.products')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.aiInterview')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.cvAnalysis')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.tests')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.community')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-label mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.guide')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-label mb-4">{t('footer.newsletter')}</h4>
            <p className="body-text mb-4 text-sm">{t('footer.newsletterDescription')}</p>
            <form className="flex flex-col gap-2">
              <input
                className="rounded-lg border border-default bg-surface-overlay px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
                placeholder={t('footer.emailPlaceholder')}
                type="email"
              />
              <button className="btn-primary w-full" type="submit">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-subtle pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2024 ISAS Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="transition-colors hover:text-foreground" to="#">
              Facebook
            </Link>
            <Link className="transition-colors hover:text-foreground" to="#">
              LinkedIn
            </Link>
            <Link className="transition-colors hover:text-foreground" to="#">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
