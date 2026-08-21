import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

type StartErrorUi = 'forbidden' | 'not_found' | 'ai_failed' | 'generic' | null;

interface LearningWaitingStartPanelProps {
  questionCount: number;
  isStarting: boolean;
  startError: StartErrorUi;
  creditOpen: boolean;
  onCreditOpenChange: (open: boolean) => void;
  onStart: () => void;
  canStart: boolean;
  isReady: boolean;
  hasSufficientTokens: boolean;
  creditsRemaining: number;
}

export function LearningWaitingStartPanel({
  questionCount,
  isStarting,
  startError,
  creditOpen,
  onCreditOpenChange,
  onStart,
  canStart,
  isReady,
  hasSufficientTokens,
  creditsRemaining,
}: LearningWaitingStartPanelProps) {
  const { t } = useLanguage();
  const handleStart = () => {
    if (!hasSufficientTokens) {
      onCreditOpenChange(true);
      return;
    }
    onStart();
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('practice.flow.waiting.learningHint')}</p>
        {!isReady ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('practice.flow.waiting.polling')}
          </div>
        ) : null}
        {isReady && questionCount > 0 ? (
          <p className="text-sm text-foreground">
            {t('practice.flow.waiting.readyPreview').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        <button
          type="button"
          className="btn-primary inline-flex items-center justify-center gap-2"
          disabled={isStarting || !canStart || !isReady}
          onClick={handleStart}
        >
          {isStarting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {isStarting
            ? t('practice.learningPath.startingPractice')
            : t('practice.flow.waiting.start')}
        </button>
        {startError ? (
          <div className="space-y-3" role="alert">
            <p className="text-sm text-error">
              {startError === 'forbidden'
                ? t('practice.learningPath.errorForbidden')
                : startError === 'not_found'
                  ? t('practice.learningPath.errorNotFound')
                  : startError === 'ai_failed'
                    ? t('practice.learningPath.lessonAiError')
                    : t('practice.learningPath.startError')}
            </p>
            <Button type="button" variant="outline" onClick={onStart} disabled={isStarting}>
              <AlertCircle className="size-4" aria-hidden />
              {t('practice.learningPath.retry')}
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={creditOpen} onOpenChange={onCreditOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('practice.learningPath.insufficientCreditsTitle')}</DialogTitle>
            <DialogDescription>
              {t('practice.learningPath.creditWarningDescription')
                .replace('{cost}', '1')
                .replace('{balance}', creditsRemaining.toLocaleString())}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onCreditOpenChange(false)}>
              {t('practice.learningPath.keepLearning')}
            </Button>
            <Link to="/candidate/credits" className="btn-primary inline-flex">
              {t('practice.learningPath.buyCredits')}
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onCreditOpenChange(false);
                onStart();
              }}
            >
              {t('practice.learningPath.continueAnyway')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
