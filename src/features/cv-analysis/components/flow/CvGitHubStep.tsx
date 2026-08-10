import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { RepoAnalysisResponse } from '@/features/repo-analysis/types/repoAnalysis.types';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvGitHubStepProps {
  repoUrl: string;
  repoAnalysis: RepoAnalysisResponse | null;
  error: string | null;
  isAnalyzing: boolean;
  onRepoUrlChange: (value: string) => void;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function CvGitHubStep({
  repoUrl,
  repoAnalysis,
  error,
  isAnalyzing,
  onRepoUrlChange,
  onSkip,
  onNext,
  onBack,
}: CvGitHubStepProps) {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('cv.step.github')} description={t('cv.stepDesc.github')}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-satin bg-white/[0.04] p-4">
          <GitBranch className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t('cv.github.title')}</p>
            <p className="text-sm leading-6 text-muted-foreground">{t('cv.github.description')}</p>
          </div>
        </div>

        <label className="block space-y-2 text-sm font-medium" htmlFor="cv-github-url">
          {t('cv.github.urlLabel')}
          <span className="font-normal text-muted-foreground"> ({t('cv.optional')})</span>
          <Input
            id="cv-github-url"
            type="url"
            value={repoUrl}
            onChange={(event) => onRepoUrlChange(event.target.value)}
            placeholder={t('cv.github.urlPlaceholder')}
            disabled={isAnalyzing}
            aria-invalid={Boolean(error)}
          />
        </label>

        {repoAnalysis ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4" role="status">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <GitBranch className="size-4" aria-hidden />
              {t('cv.github.completed')}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {repoAnalysis.repoOwner}/{repoAnalysis.repoName}
            </p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="btn-ghost text-sm" onClick={onSkip} disabled={isAnalyzing}>
            {t('cv.github.skip')}
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isAnalyzing}>
              {t('cv.back')}
            </Button>
            <Button type="button" onClick={onNext} loading={isAnalyzing}>
              {t('cv.next')}
            </Button>
          </div>
        </div>
      </div>
    </CvFlowSectionCard>
  );
}
