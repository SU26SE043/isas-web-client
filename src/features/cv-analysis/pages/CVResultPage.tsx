import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CVResultBottomPanel } from '../components/CVResultBottomPanel';
import { CVResultLeftPanel } from '../components/CVResultLeftPanel';
import { CVResultRightPanel } from '../components/CVResultRightPanel';
import { CvProfileMappingPanel } from '@/features/profile/components/CvProfileMappingPanel';
import { useCvAnalysisResult } from '../hooks/useCvAnalysisResult';

export const CVResultPage: React.FC = () => {
  const { t } = useLanguage();
  const { result, isLoading, error } = useCvAnalysisResult();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base px-4">
        <p className="body-text text-center">{t('cv.analysisFailed')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content min-h-full pb-12">
      <div className="page-container max-w-none px-0 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CVResultLeftPanel result={result} />
          <CVResultRightPanel result={result} />
        </div>
        <CvProfileMappingPanel result={result} />
        <CVResultBottomPanel />
      </div>
    </div>
  );
};
