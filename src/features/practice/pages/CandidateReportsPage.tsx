import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CvAnalysisReportsSection } from '@/features/cv-analysis/components/report/CvAnalysisReportsSection';
import { useLanguage } from '@/shared/languages';
import { ReportCategoryAccordion } from '../components/reports/ReportCategoryAccordion';
import { ReportListItem } from '../components/reports/ReportListItem';
import { fetchCandidateReportsHub } from '../services/candidateReports.service';
import type { CandidateReportsHub } from '../types/candidateReports.types';

const EMPTY_HUB: CandidateReportsHub = { interview: [], learning: [], cv: [] };

export function CandidateReportsPage() {
  const { language, t } = useLanguage();
  const [hub, setHub] = useState<CandidateReportsHub>(EMPTY_HUB);
  const [isHubLoading, setIsHubLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchCandidateReportsHub();
        if (active) setHub(data);
      } catch {
        if (active) setHub(EMPTY_HUB);
      } finally {
        if (active) setIsHubLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scoreLabel = t('practice.reports.score');

  return (
    <div className="page-container page-section min-h-full space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.reports.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('practice.reports.subtitle')}</p>
      </header>

      <CvAnalysisReportsSection />

      {isHubLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-subtle bg-surface-overlay/40 px-5 py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">{t('practice.reports.loading')}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <ReportCategoryAccordion
            title={t('practice.reports.category.interview')}
            count={hub.interview.length}
            defaultOpen={hub.interview.length > 0}
          >
            {hub.interview.length === 0 ? (
              <EmptyCategory
                message={t('practice.reports.empty.interview')}
                href="/candidate/practice/history"
                cta={t('practice.reports.viewHistory')}
              />
            ) : (
              <>
                {hub.interview.map((item) => (
                  <ReportListItem key={item.id} item={item} language={language} scoreLabel={scoreLabel} />
                ))}
                <Link
                  to="/candidate/practice/history"
                  className="inline-flex pt-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {t('practice.reports.viewHistory')}
                </Link>
              </>
            )}
          </ReportCategoryAccordion>

          <ReportCategoryAccordion
            title={t('practice.reports.category.learning')}
            count={hub.learning.length}
            defaultOpen={hub.learning.length > 0}
          >
            {hub.learning.length === 0 ? (
              <EmptyCategory
                message={t('practice.reports.empty.learning')}
                href="/candidate/learning"
                cta={t('practice.reports.openLearning')}
              />
            ) : (
              hub.learning.map((item) => (
                <ReportListItem key={item.id} item={item} language={language} scoreLabel={scoreLabel} />
              ))
            )}
          </ReportCategoryAccordion>
        </div>
      )}
    </div>
  );
}

function EmptyCategory({
  message,
  href,
  cta,
}: {
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-dashed border-subtle bg-surface-overlay/60 px-4 py-5 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link to={href} className="btn-secondary inline-flex text-sm">
        {cta}
      </Link>
    </div>
  );
}
