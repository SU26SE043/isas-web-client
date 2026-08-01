import { Link, Outlet } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useLanguage } from '@/shared/languages';
import { LanguageToggle } from './LanguageToggle';

/** Full Learning workspace chrome — no candidate system sidebar. */
export function LearningLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen surface-page">
      <header className="sticky top-0 z-40 border-b border-subtle bg-surface-base/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/candidate/learning" className="focus-ring shrink-0 rounded-md">
              <BrandLogo className="h-7" />
            </Link>
            <span className="hidden truncate text-sm font-medium text-muted-foreground sm:inline">
              {t('practice.learningPath.title')}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LanguageToggle compact />
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
