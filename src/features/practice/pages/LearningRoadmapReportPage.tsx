import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { roadmapPracticeService } from '../services/roadmapPractice.service';
import type { RoadmapLevelEvaluationItem } from '../types/roadmapPractice.api.types';

export function LearningRoadmapReportPage() {
  const { roadmapId = '' } = useParams();
  const { language, t } = useLanguage();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['learning', 'roadmap-report', roadmapId],
    queryFn: () => roadmapPracticeService.getRoadmapReport(roadmapId),
    enabled: Boolean(roadmapId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loadingReport')}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          title={t('practice.learningPath.errorTitle')}
          description={t('practice.learningPath.reportLoadError')}
          action={
            <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
              <AlertCircle className="size-4" aria-hidden />
              {t('practice.learningPath.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  const kindLabel =
    data.kind === 'snapshot'
      ? t('practice.learningPath.reportKindSnapshot')
      : t('practice.learningPath.reportKindInterim');
  const levelText =
    language === 'vi'
      ? data.levelEvaluationVi || data.levelEvaluationText
      : data.levelEvaluationText || data.levelEvaluationVi;
  const comment =
    language === 'vi'
      ? data.overallCommentVi || data.overallComment
      : data.overallComment || data.overallCommentVi;

  return (
    <div className="page-container page-section min-h-full space-y-6 py-8">
      <header className="space-y-2">
        <p className="text-caption text-muted-foreground">{kindLabel}</p>
        <h1 className="heading-primary text-3xl text-foreground">
          {t('practice.learningPath.roadmapReportTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('practice.learningPath.roadmapReportSubtitle')}
        </p>
      </header>

      {data.radarData.length > 0 ? (
        <SkillRadarChart data={data.radarData} language={language} />
      ) : (
        <p className="text-sm text-muted-foreground">{t('practice.learningPath.radarEmpty')}</p>
      )}

      {data.levelEvaluation.length > 0 ? (
        <section className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg text-foreground">
            {t('practice.learningPath.levelEvaluation')}
          </h2>
          <ul className="space-y-4">
            {data.levelEvaluation.map((item) => (
              <LevelEvaluationRow key={item.criterionName} item={item} t={t} />
            ))}
          </ul>
        </section>
      ) : levelText ? (
        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg text-foreground">
            {t('practice.learningPath.levelEvaluation')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{levelText}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {/*
          Chọn bản `...Vi` theo ĐỘ DÀI, không phải bằng `??`: mapper dùng `pickStringArray` nên khi
          backend không gửi field `...Vi` nó trả MẢNG RỖNG chứ không phải undefined — `??` sẽ không
          bao giờ kích hoạt và ba ô này hiện dấu "—".

          Backend chỉ trả MỘT bộ `strengths/weaknesses/improvements`, và tên tiêu chí trong đó ĐÃ
          theo đúng ngôn ngữ của lộ trình (rubric `vi` cho roadmap `vi`), nên bản không-Vi dùng được
          ngay. Cặp `...Vi` chỉ tồn tại trong fixtures mock — đó là lý do lỗi chạy đẹp lúc phát
          triển và chỉ lộ ra với dữ liệu thật.
        */}
        <ListBlock
          title={t('practice.learningPath.strengths')}
          items={language === 'vi' && data.strengthsVi.length > 0 ? data.strengthsVi : data.strengths}
        />
        <ListBlock
          title={t('practice.learningPath.weaknesses')}
          items={language === 'vi' && data.weaknessesVi.length > 0 ? data.weaknessesVi : data.weaknesses}
        />
        <ListBlock
          title={t('practice.learningPath.improvements')}
          items={language === 'vi' && data.improvementsVi.length > 0 ? data.improvementsVi : data.improvements}
        />
      </section>

      {comment ? (
        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg text-foreground">
            {t('practice.learningPath.overallComment')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{comment}</p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
        <Link to={`/candidate/learning/roadmaps/${roadmapId}`} className="btn-primary inline-flex">
          {t('practice.learningPath.backToRoadmap')}
        </Link>
        <Link to="/candidate/learning" className="btn-secondary inline-flex">
          {t('practice.learningPath.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}

function LevelEvaluationRow({
  item,
  t,
}: {
  item: RoadmapLevelEvaluationItem;
  t: (key: string) => string;
}) {
  const pct = Math.max(0, Math.min(100, item.percentage));
  const threshold = Math.max(0, Math.min(100, item.levelThreshold));
  return (
    <li className="rounded-lg border border-subtle bg-surface-overlay p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{item.criterionName}</p>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            item.passed ? 'text-success' : 'text-warning'
          }`}
        >
          {item.passed ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
          {item.passed
            ? t('practice.learningPath.levelEvaluationPassed')
            : t('practice.learningPath.levelEvaluationFailed')}
        </span>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{pct}%</span>
        <span>
          {t('practice.learningPath.levelThreshold')}: {threshold}%
        </span>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface-base">
        <div
          className={`h-full rounded-full ${item.passed ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/60"
          style={{ left: `${threshold}%` }}
          aria-hidden
        />
      </div>
    </li>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
