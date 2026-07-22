import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useCvAnalyses } from '../../hooks/useCvAnalyses';
import { CvAnalysisAccordionItem } from './CvAnalysisAccordionItem';
import { CvAnalysisListSkeleton } from './CvAnalysisReportSkeleton';

export function CvAnalysisReportsSection() {
  const { t } = useLanguage();
  const { data: analyses = [], isLoading, isError, refetch, isFetching } = useCvAnalyses();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="space-y-4" aria-labelledby="cv-analysis-reports-heading">
      <header className="space-y-1">
        <h2 id="cv-analysis-reports-heading" className="heading-secondary text-lg text-foreground">
          {t('cv.report.sectionTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('cv.report.sectionSubtitle')}</p>
      </header>

      {isLoading ? <CvAnalysisListSkeleton /> : null}

      {isError ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-8 text-center">
          <p className="text-sm text-rose-400">{t('cv.report.errorList')}</p>
          <Button type="button" className="mt-4" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <AlertCircle className="size-4" aria-hidden />
            {t('cv.report.retry')}
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && analyses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 px-5 py-10 text-center">
          <p className="text-sm font-medium text-zinc-100">{t('cv.report.emptyTitle')}</p>
          <p className="mt-2 text-sm text-zinc-400">{t('cv.report.emptyDescription')}</p>
          <Link to="/candidate/cv/analysis" className="btn-primary mt-5 inline-flex text-sm">
            {t('cv.report.emptyCta')}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && analyses.length > 0 ? (
        <div className="space-y-3">
          {analyses.map((item) => (
            <CvAnalysisAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
