import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CvAnalysisReportsSection } from '@/features/cv-analysis/components/report/CvAnalysisReportsSection';
import { useLanguage } from '@/shared/languages';
import { ReportListItem } from '../components/reports/ReportListItem';
import { fetchCandidateReportsHub } from '../services/candidateReports.service';
import type { CandidateReportsHub } from '../types/candidateReports.types';
import { PageHeader } from '@/components/patterns/PageHeader';

const EMPTY_HUB: CandidateReportsHub = { interview: [], learning: [], cv: [] };
type ReportCategory = 'cv' | 'interview' | 'learning';

export function CandidateReportsPage() {
  const { language, t } = useLanguage();
  const [hub, setHub] = useState<CandidateReportsHub>(EMPTY_HUB);
  const [isHubLoading, setIsHubLoading] = useState(true);
  // 🔴 Trước đây `catch` chỉ đặt lại hub rỗng ⇒ "không tải được" hiện ra y hệt "chưa có báo cáo
  // nào". Người dùng vừa học xong một bài, mở trang này, thấy 0, và kết luận hệ thống không ghi
  // nhận buổi học của họ. Tải hỏng phải NHÌN THẤY được, và phải thử lại được.
  const [hasError, setHasError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('cv');
  const [cvCount, setCvCount] = useState<number | null>(null);

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
    <div className="app-page min-h-full space-y-8">
      <PageHeader title={t('practice.reports.title')} description={t('practice.reports.subtitle')} />

      <div className="space-y-3">
        {isHubLoading ? (
          <div className="flex items-center gap-3 rounded-xl border border-satin bg-surface-raised px-5 py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">{t('practice.reports.loading')}</span>
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
            <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label={t('practice.reports.title')}>
              <ReportCategoryButton
                category="cv"
                activeCategory={activeCategory}
                label={t('practice.reports.category.cv')}
                count={cvCount}
                onSelect={setActiveCategory}
              />
              <ReportCategoryButton
                category="interview"
                activeCategory={activeCategory}
                label={t('practice.reports.category.interview')}
                count={hub.interview.length}
                onSelect={setActiveCategory}
              />
              <ReportCategoryButton
                category="learning"
                activeCategory={activeCategory}
                label={t('practice.reports.category.learning')}
                count={hub.learning.length}
                onSelect={setActiveCategory}
              />
            </div>

            <div
              id={`reports-panel-${activeCategory}`}
              role="tabpanel"
              aria-label={t(`practice.reports.category.${activeCategory}`)}
              className="frame-satin rounded-2xl bg-surface-raised p-4 sm:p-5"
            >
              <CvAnalysisReportsSection
                active={activeCategory === 'cv'}
                onCountChange={setCvCount}
              />
              {activeCategory === 'interview' ? (
                hub.interview.length === 0 ? (
                  <EmptyCategory message={t('practice.reports.empty.interview')} href="/candidate/practice/history" cta={t('practice.reports.viewHistory')} />
                ) : (
                  <div className="space-y-2">
                    {hub.interview.map((item) => <ReportListItem key={item.id} item={item} language={language} scoreLabel={scoreLabel} />)}
                    <Link to="/candidate/practice/history" className="inline-flex pt-1 text-sm font-medium text-foreground underline-offset-4 hover:underline">
                      {t('practice.reports.viewHistory')}
                    </Link>
                  </div>
                )
              ) : null}
              {activeCategory === 'learning' ? (
                hub.learning.length === 0 ? (
                  <EmptyCategory message={t('practice.reports.empty.learning')} href="/candidate/learning" cta={t('practice.reports.openLearning')} />
                ) : (
                  <div className="space-y-2">{hub.learning.map((item) => <ReportListItem key={item.id} item={item} language={language} scoreLabel={scoreLabel} />)}</div>
                )
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReportCategoryButton({
  category,
  activeCategory,
  label,
  count,
  onSelect,
}: {
  category: ReportCategory;
  activeCategory: ReportCategory;
  label: string;
  count: number | null;
  onSelect: (category: ReportCategory) => void;
}) {
  const active = category === activeCategory;

  return (
    <button
      type="button"
      role="tab"
      id={`reports-tab-${category}`}
      aria-selected={active}
      aria-controls={`reports-panel-${category}`}
      onClick={() => onSelect(category)}
      className={active
        ? 'flex min-h-14 items-center justify-between gap-3 rounded-xl border border-foreground bg-foreground px-4 py-3 text-left text-sm font-semibold text-background shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
        : 'flex min-h-14 items-center justify-between gap-3 rounded-xl border border-satin bg-surface-raised px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:bg-surface-overlay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'}
    >
      <span>{label}</span>
      {count !== null ? <span className={active ? 'rounded-full bg-background/15 px-2.5 py-0.5 text-xs' : 'rounded-full border border-satin bg-surface-overlay px-2.5 py-0.5 text-xs text-muted-foreground'}>{count}</span> : null}
    </button>
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
    <div className="space-y-3 rounded-lg border border-dashed border-satin bg-surface-overlay px-4 py-5 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link to={href} className="btn-secondary inline-flex text-sm">
        {cta}
      </Link>
    </div>
  );
}
