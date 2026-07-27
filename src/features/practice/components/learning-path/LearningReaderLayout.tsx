import { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { AlertCircle, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import {
  LearningWorkspaceProvider,
  useLearningWorkspace,
} from '../../context/LearningWorkspaceContext';
import { LearningSidebar } from './LearningSidebar';

function LearningReaderShell() {
  const { lessonId } = useParams();
  const { t } = useLanguage();
  const { roadmap, isLoading, error, errorStatus, reload } = useLearningWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loading')}</span>
      </div>
    );
  }

  if (error || !roadmap) {
    const isNotFound = errorStatus === 404;
    const isForbidden = errorStatus === 403;
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          variant={isForbidden ? 'no-permission' : 'no-results'}
          title={
            isNotFound
              ? t('practice.learningPath.errorNotFoundTitle')
              : isForbidden
                ? t('practice.learningPath.errorForbiddenTitle')
                : t('practice.learningPath.errorTitle')
          }
          description={
            isNotFound
              ? t('practice.learningPath.errorNotFound')
              : isForbidden
                ? t('practice.learningPath.errorForbidden')
                : t('practice.learningPath.error')
          }
          action={
            isNotFound || isForbidden ? (
              <Link to="/candidate/learning" className="btn-secondary inline-flex">
                {t('practice.learningPath.backToDashboard')}
              </Link>
            ) : (
              <Button type="button" onClick={() => void reload()}>
                <AlertCircle className="size-4" aria-hidden />
                {t('practice.learningPath.retry')}
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div
        className={cn(
          'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden transition-[width] duration-300 lg:block',
          sidebarOpen ? 'w-72' : 'w-0',
        )}
      >
        {sidebarOpen ? (
          <LearningSidebar roadmap={roadmap} currentLessonId={lessonId} />
        ) : null}
      </div>

      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          className="absolute left-3 top-3 z-20 hidden rounded-lg border border-subtle bg-surface-elevated p-2 text-muted-foreground transition hover:text-foreground lg:inline-flex"
          aria-pressed={sidebarOpen}
          aria-label={
            sidebarOpen
              ? t('practice.learningPath.hideSidebar')
              : t('practice.learningPath.showSidebar')
          }
          onClick={() => setSidebarOpen((value) => !value)}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" aria-hidden />
          ) : (
            <PanelLeft className="size-4" aria-hidden />
          )}
        </button>

        <details className="border-b border-subtle lg:hidden">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
            {t('practice.learningPath.sidebarLessons')}
          </summary>
          <div className="max-h-[50vh] overflow-y-auto border-t border-subtle">
            <LearningSidebar roadmap={roadmap} currentLessonId={lessonId} />
          </div>
        </details>

        <Outlet />
      </div>
    </div>
  );
}

/** Theory / practice launchers / report — Learning sidebar, no system nav. */
export function LearningReaderLayout() {
  const { roadmapId = '' } = useParams();

  return (
    <LearningWorkspaceProvider roadmapId={roadmapId}>
      <LearningReaderShell />
    </LearningWorkspaceProvider>
  );
}
