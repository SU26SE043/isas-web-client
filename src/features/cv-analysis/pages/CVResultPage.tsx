import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisStepper } from '../components/CvAnalysisStepper';
import { ReportHeader } from '../components/report/ReportHeader';
import { SummaryCard } from '../components/report/SummaryCard';
import { StrengthCard } from '../components/report/StrengthCard';
import { WeaknessCard } from '../components/report/WeaknessCard';
import { SuggestionCard } from '../components/report/SuggestionCard';
import { JDMatchCard } from '../components/report/JDMatchCard';
import { ReportHistoryList } from '../components/report/ReportHistoryList';
import { CV_ANALYSIS_ID_KEY, CV_ANALYSIS_META_KEY } from '../hooks/useCvAnalysisFlow';
import { useCvAnalysisResult } from '../hooks/useCvAnalysisResult';
import type { AnalysisFileMeta } from '../types/cvAnalysis.types';
import { buildCvTimelineStatuses } from '../utils/cvTimelineStatus';

function readMeta(): AnalysisFileMeta | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CV_ANALYSIS_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalysisFileMeta;
  } catch {
    return null;
  }
}

export const CVResultPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const analysisIdFromQuery = params.get('analysisId') ?? undefined;
  const analysisId =
    analysisIdFromQuery ??
    (typeof window !== 'undefined' ? sessionStorage.getItem(CV_ANALYSIS_ID_KEY) ?? undefined : undefined);

  const meta = useMemo(() => readMeta(), []);

  const { result, history, isLoading, isHistoryLoading, error, selectFromHistory } =
    useCvAnalysisResult(analysisId);

  const timelineStatuses = useMemo(() => {
    if (isLoading) {
      return buildCvTimelineStatuses({
        activeIndex: 4,
        isProcessing: true,
      });
    }
    if (error || !result) {
      return buildCvTimelineStatuses({
        activeIndex: 4,
        failedStep: 'report',
      });
    }
    return buildCvTimelineStatuses({
      activeIndex: 5,
    });
  }, [error, isLoading, result]);

  useEffect(() => {
    if (analysisIdFromQuery) {
      sessionStorage.setItem(CV_ANALYSIS_ID_KEY, analysisIdFromQuery);
    }
  }, [analysisIdFromQuery]);

  const toastShownRef = React.useRef(false);

  useEffect(() => {
    if (!isLoading && (error || !result) && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(error || t('cv.analysisFailed'));
    }
    if (result) {
      toastShownRef.current = false;
    }
  }, [error, isLoading, result, t]);

  if (isLoading) {
    return (
      <div className="dashboard-content min-h-full pb-12">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="heading-primary text-3xl tracking-tight">{t('cv.reportTitle')}</h1>
            <p className="body-text mt-2 max-w-2xl">{t('cv.reportDescription')}</p>
          </div>
          <CvAnalysisStepper currentStep="report" statuses={timelineStatuses} />
        </div>
        <div className="flex min-h-[40vh] items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-info" aria-hidden />
          <span className="sr-only">{t('ds.loading.page')}</span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="dashboard-content min-h-full pb-12">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="heading-primary text-3xl tracking-tight">{t('cv.reportTitle')}</h1>
            <p className="body-text mt-2 max-w-2xl">{t('cv.reportDescription')}</p>
          </div>
          <CvAnalysisStepper
            currentStep="report"
            statuses={timelineStatuses}
            failedStep="report"
          />
        </div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="body-text text-error">{error || t('cv.analysisFailed')}</p>
          <Link to="/candidate/cv/analysis" className="btn-primary">
            {t('cv.startNewAnalysis')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content min-h-full pb-12">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="heading-primary text-3xl tracking-tight">{t('cv.reportTitle')}</h1>
            <p className="body-text mt-2 max-w-2xl">{t('cv.reportDescription')}</p>
          </div>
          <Link to="/candidate/cv/analysis" className="btn-secondary inline-flex rounded-xl">
            {t('cv.startNewAnalysis')}
          </Link>
        </div>
        <CvAnalysisStepper currentStep="report" statuses={timelineStatuses} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ReportHistoryList
          items={history}
          selectedId={result.id}
          isLoading={isHistoryLoading}
          onSelect={(item) => {
            selectFromHistory(item);
            sessionStorage.setItem(CV_ANALYSIS_ID_KEY, item.id);
            navigate(`/candidate/cv/analysis/report?analysisId=${encodeURIComponent(item.id)}`, {
              replace: true,
            });
          }}
        />

        <div className="space-y-5">
          <ReportHeader result={result} meta={meta} />
          <SummaryCard summary={result.summary} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <StrengthCard strengths={result.strengths} />
            <WeaknessCard weaknesses={result.weaknesses} />
          </div>
          <SuggestionCard suggestions={result.suggestions} />
          {result.jdMatch ? <JDMatchCard jdMatch={result.jdMatch} /> : null}
        </div>
      </div>
    </div>
  );
};
