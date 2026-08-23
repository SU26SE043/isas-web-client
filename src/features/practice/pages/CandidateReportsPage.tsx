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
  // 🔴 Trước đây `catch` chỉ đặt lại hub rỗng ⇒ "không tải được" hiện ra y hệt "chưa có báo cáo
  // nào". Người dùng vừa học xong một bài, mở trang này, thấy 0, và kết luận hệ thống không ghi
  // nhận buổi học của họ. Tải hỏng phải NHÌN THẤY được, và phải thử lại được.
  const [hasError, setHasError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setIsHubLoading(true);
    setHasError(false);
    void (async () => {
      try {
        const data = await fetchCandidateReportsHub();
        if (active) setHub(data);
      } catch {
        if (active) {
          setHub(EMPTY_HUB);
          setHasError(true);
        }
      } finally {
        if (active) setIsHubLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const scoreLabel = t('practice.reports.score');

  return (
    <div className="page-container page-section min-h-full space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.reports.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('practice.reports.subtitle')}</p>
      </header>

      <div className="space-y-3">
        <CvAnalysisReportsSection />

        {isHubLoading ? (
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-4">
            <Loader2 className="size-5 animate-spin text-zinc-400" aria-hidden />
            <span className="text-sm text-zinc-400">{t('practice.reports.loading')}</span>
          </div>
        ) : hasError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-foreground">{t('practice.reports.error')}</span>
            <button
              type="button"
              className="btn-secondary inline-flex self-start text-sm sm:self-auto"
              onClick={() => setReloadToken((value) => value + 1)}
            >
              {t('practice.reports.retry')}
            </button>
          </div>
        ) : (
          <>
            <ReportCategoryAccordion
              title={t('practice.reports.category.interview')}
              count={hub.interview.length}
              defaultOpen={false}
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
                    <ReportListItem
                      key={item.id}
                      item={item}
                      language={language}
                      scoreLabel={scoreLabel}
                    />
                  ))}
                  <Link
                    to="/candidate/practice/history"
                    className="inline-flex pt-1 text-sm font-medium text-zinc-100 underline-offset-4 hover:underline"
                  >
                    {t('practice.reports.viewHistory')}
                  </Link>
                </>
              )}
            </ReportCategoryAccordion>

            <ReportCategoryAccordion
              title={t('practice.reports.category.learning')}
              count={hub.learning.length}
              defaultOpen={false}
            >
              {hub.learning.length === 0 ? (
                <EmptyCategory
                  message={t('practice.reports.empty.learning')}
                  href="/candidate/learning"
                  cta={t('practice.reports.openLearning')}
                />
              ) : (
                hub.learning.map((item) => (
                  <ReportListItem
                    key={item.id}
                    item={item}
                    language={language}
                    scoreLabel={scoreLabel}
                  />
                ))
              )}
            </ReportCategoryAccordion>
          </>
        )}
      </div>
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
    <div className="space-y-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-5 text-center">
      <p className="text-sm text-zinc-400">{message}</p>
      <Link to={href} className="btn-secondary inline-flex text-sm">
        {cta}
      </Link>
    </div>
  );
}
