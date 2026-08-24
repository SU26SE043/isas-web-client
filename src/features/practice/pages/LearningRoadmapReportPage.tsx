import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { RoadmapProgressChart } from '../components/RoadmapProgressChart';
import { LevelEvaluationRow, ListBlock } from '../components/RoadmapReportBlocks';
import { roadmapPracticeService } from '../services/roadmapPractice.service';

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
  const isInterim = data.kind !== 'snapshot';
  /*
    "Chưa có buổi nào được chấm" KHÁC "hệ thống hỏng", và cũng KHÁC ca "mới có một buổi".
    Backend trả 200 với mọi mảng rỗng khi lộ trình chưa hoàn thành bài nào — trước đây
    trạng thái này chưa ai nhìn thấy vì nút báo cáo bị khoá sau `status === 'completed'`.
    Radar không có nan nào sẽ vẽ ra một chấm/hình méo, người dùng đọc thành lỗi hệ thống.
  */
  const hasRadar = data.radarData.length > 0;
  /*
    Ngưỡng đạt là hằng số theo cấp độ, nên lấy dòng đầu của `levelEvaluation` là đủ.
    Không có dòng nào ⇒ `null` = KHÔNG BIẾT ⇒ biểu đồ đường không vẽ đường ngang,
    chứ không vẽ một ngưỡng 0% bịa ra.
  */
  const threshold = data.levelEvaluation[0]?.levelThreshold ?? null;

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

      {isInterim ? (
        <section
          className="rounded-xl border border-warning/40 bg-warning/10 p-4"
          role="status"
          data-testid="report-interim-banner"
        >
          <h2 className="text-sm font-semibold text-warning">
            {t('practice.learningPath.reportInterimTitle')}
          </h2>
          <p className="mt-1 text-sm text-warning/90">
            {t('practice.learningPath.reportInterimDesc')}
          </p>
        </section>
      ) : null}

      {!hasRadar ? (
        <section
          className="rounded-2xl border border-satin bg-surface-raised p-6"
          data-testid="report-empty-state"
        >
          <h2 className="heading-secondary text-xl text-foreground">
            {t('practice.learningPath.reportEmptyTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('practice.learningPath.reportEmptyDesc')}
          </p>
        </section>
      ) : null}

      {hasRadar ? <SkillRadarChart data={data.radarData} language={language} /> : null}

      {hasRadar ? <RoadmapProgressChart progress={data.progress} threshold={threshold} /> : null}

      {hasRadar && data.levelEvaluation.length > 0 ? (
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
        {/*
          Ô này RỖNG một cách hợp lệ khi chưa tiêu chí nào có mốc để so, nên nó cần
          câu giải thích riêng — dấu "—" trơ ở đây bị đọc thành "hệ thống hỏng".
        */}
        <ListBlock
          title={t('practice.learningPath.improvements')}
          items={language === 'vi' && data.improvementsVi.length > 0 ? data.improvementsVi : data.improvements}
          emptyText={t('practice.learningPath.improvementsEmpty')}
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
