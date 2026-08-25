import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { LearningDashboardToolbar } from '../components/learning-path/LearningDashboardToolbar';
import { LearningRoadmapCardView } from '../components/learning-path/LearningRoadmapCardView';
import { useLearningRoadmaps } from '../hooks/useLearningRoadmaps';
import { useHasScoredSession } from '../hooks/useHasScoredSession';
import type { LearningDashboardQuery } from '../types/learningPath.types';

export function LearningDashboardPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState<LearningDashboardQuery>({
    search: '',
    domainId: 'all',
    status: 'all',
    sort: 'updated',
  });

  const { data: items = [], isLoading, isError, refetch, isFetching } = useLearningRoadmaps(query);
  const scoredSessionQuery = useHasScoredSession();
  const showPracticeCta = scoredSessionQuery.isSuccess && scoredSessionQuery.data === false;
  const fewerLessons = Boolean((location.state as { fewerLessons?: boolean } | null)?.fewerLessons);
  useEffect(() => {
    if (fewerLessons) navigate(location.pathname, { replace: true, state: null });
  }, [fewerLessons, location.pathname, navigate]);

  return (
    <div className="page-container page-section min-h-screen">
      {/*
        Trang này nay là lối vào DUY NHẤT của lộ trình: vừa liệt kê lộ trình đang có, vừa tạo mới.
        Trước đây menu tách làm hai mục ("Học tập" để xem, "Lộ trình" để tạo) và trang này phải ghi
        hẳn một dòng "không tạo lộ trình tại đây — dùng menu Lộ trình" — một dòng chữ để bù cho việc
        điều hướng bắt người dùng đoán. Gộp lại thì dòng đó không còn lý do tồn tại.
      */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.learningPath.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.learningPath.subtitle')}</p>
        </div>
        <Link
          to="/candidate/roadmap"
          className="btn-primary inline-flex shrink-0 items-center gap-2"
        >
          <Plus className="size-4" aria-hidden />
          {t('practice.learningPath.createRoadmap')}
        </Link>
      </header>

      <LearningDashboardToolbar query={query} onChange={setQuery} />
      {fewerLessons ? <p className="mt-4 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info" role="status">{t('practice.learningPath.fewerLessonsNotice')}</p> : null}

      {isLoading ? (
        <div className="mt-10 flex justify-center" role="status">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <span className="sr-only">{t('practice.learningPath.loadingList')}</span>
        </div>
      ) : isError ? (
        <div className="mt-8">
          <EmptyState
            className="frame-satin"
            variant="no-data"
            title={t('practice.learningPath.errorTitle')}
            description={t('practice.learningPath.error')}
            action={
              <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                <AlertCircle className="size-4" aria-hidden />
                {t('practice.learningPath.retry')}
              </Button>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            className="frame-satin"
            variant="no-data"
            title={t('practice.learningPath.emptyTitle')}
            description={showPracticeCta ? t('practice.learningPath.empty.needPracticeFirst') : t('practice.learningPath.empty')}
            action={
              <Link to={showPracticeCta ? '/practice' : '/candidate/roadmap'} className="btn-primary inline-flex">
                {showPracticeCta ? t('practice.learningPath.empty.practiceCta') : t('practice.learningPath.goCreate')}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <LearningRoadmapCardView key={item.id} roadmap={item} />
          ))}
        </div>
      )}
    </div>
  );
}
