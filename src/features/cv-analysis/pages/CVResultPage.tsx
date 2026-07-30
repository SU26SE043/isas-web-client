import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisLandingHero } from '../components/report/CvAnalysisLandingHero';
import { StrengthCard } from '../components/report/StrengthCard';
import { WeaknessCard } from '../components/report/WeaknessCard';
import { SuggestionCard } from '../components/report/SuggestionCard';
import { JDMatchCard } from '../components/report/JDMatchCard';
import { CV_ANALYSIS_ID_KEY, CV_ANALYSIS_META_KEY } from '../hooks/useCvAnalysisFlow';
import { useCvAnalysisResult } from '../hooks/useCvAnalysisResult';
import type { AnalysisFileMeta } from '../types/cvAnalysis.types';

function readMeta(): AnalysisFileMeta | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CV_ANALYSIS_META_KEY) ?? sessionStorage.getItem(CV_ANALYSIS_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalysisFileMeta;
  } catch {
    return null;
  }
}

function readStoredAnalysisId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(CV_ANALYSIS_ID_KEY) ?? sessionStorage.getItem(CV_ANALYSIS_ID_KEY) ?? undefined;
}

/** Landing-page report driven by GET /practice/cv-analysis/{id}. */
export const CVResultPage: React.FC = () => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const analysisIdFromQuery = params.get('analysisId') ?? undefined;
  const analysisId = analysisIdFromQuery ?? readStoredAnalysisId();
  const meta = useMemo(() => readMeta(), []);

  const { result, isLoading, error } = useCvAnalysisResult(analysisId);

  useEffect(() => {
    if (!analysisIdFromQuery) return;
    localStorage.setItem(CV_ANALYSIS_ID_KEY, analysisIdFromQuery);
    sessionStorage.removeItem(CV_ANALYSIS_ID_KEY);
  }, [analysisIdFromQuery]);

  const toastShownRef = React.useRef(false);

  useEffect(() => {
    if (!isLoading && (error || !result) && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(error === 'missing' ? t('cv.landing.missingId') : error || t('cv.analysisFailed'));
    }
    if (result) toastShownRef.current = false;
  }, [error, isLoading, result, t]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-surface-base">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center gap-3 px-4">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('cv.landing.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-full bg-surface-base">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="heading-primary text-3xl text-foreground">{t('cv.reportTitle')}</h1>
          <p className="body-text text-error">
            {error === 'missing' ? t('cv.landing.missingId') : error || t('cv.analysisFailed')}
          </p>
          <Link to="/candidate/cv/analysis" className="btn-primary rounded-md">
            {t('cv.startNewAnalysis')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-y-auto bg-surface-base">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <CvAnalysisLandingHero result={result} meta={meta} />

        {result.jdMatch ? <JDMatchCard jdMatch={result.jdMatch} /> : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <StrengthCard strengths={result.strengths} />
          <WeaknessCard weaknesses={result.weaknesses} />
        </div>

        <SuggestionCard suggestions={result.suggestions} />
      </div>
    </div>
  );
};
