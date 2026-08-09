import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

export type SessionResultErrorKind =
  | 'invalidSession'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'notReady'
  | 'generationFailed'
  | 'capacity'
  | 'system'
  | 'noQuestions';

export function SessionResultErrorState({
  kind,
  onRetry,
}: {
  kind: SessionResultErrorKind;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();

  const copy: Record<SessionResultErrorKind, { title: string; description: string }> = {
    invalidSession: {
      title: t('practice.result.invalidSessionTitle'),
      description: t('practice.result.invalidSessionDescription'),
    },
    unauthorized: {
      title: t('practice.result.unauthorizedTitle'),
      description: t('practice.result.unauthorizedDescription'),
    },
    forbidden: {
      title: t('practice.result.forbiddenTitle'),
      description: t('practice.result.forbiddenDescription'),
    },
    notFound: {
      title: t('practice.result.notFoundTitle'),
      description: t('practice.result.notFoundDescription'),
    },
    notReady: {
      title: t('practice.result.notReadyTitle'),
      description: t('practice.result.notReadyDescription'),
    },
    generationFailed: {
      title: t('practice.result.generationFailedTitle'),
      description: t('practice.result.generationFailedDescription'),
    },
    capacity: {
      title: t('practice.result.loadErrorTitle'),
      description: t('practice.errors.platformCapacity'),
    },
    system: {
      title: t('practice.result.loadErrorTitle'),
      description: t('practice.result.loadErrorDescription'),
    },
    noQuestions: {
      title: t('practice.result.noQuestionsTitle'),
      description: t('practice.result.noQuestionsDescription'),
    },
  };

  const { title, description } = copy[kind];

  return (
    <div className="page-container page-section flex min-h-[50vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <AlertCircle className="mx-auto size-10 text-error" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center gap-3">
          {(kind === 'system' || kind === 'capacity') && onRetry ? (
            <Button type="button" onClick={onRetry}>
              {t('practice.result.retry')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            render={<Link to="/candidate/practice/history" />}
          >
            {t('practice.result.backToHistory')}
          </Button>
        </div>
      </div>
    </div>
  );
}
