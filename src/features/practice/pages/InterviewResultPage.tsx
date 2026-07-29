import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useInterviewResult } from '../hooks/useInterviewResult';
import { GapAnalysisList } from '../components/GapAnalysisList';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { InterviewResultOverview } from '../components/result/InterviewResultOverview';
import { CriteriaProgressList, CriteriaThresholdNote } from '../components/result/CriteriaProgressList';
import { QuestionFeedbackAccordion } from '../components/result/QuestionFeedbackAccordion';
import { ReportTabs, type ReportTabId } from '../components/result/ReportTabs';
import { ResultScoringPanel } from '../components/result/ResultScoringPanel';
import { RoadmapTimeline } from '../components/learning/RoadmapTimeline';
import { learningService } from '../services/learning.service';
import type { RoadmapResponse } from '../types/learning.types';

export const InterviewResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ReportTabId>('overview');
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [roadmapError, setRoadmapError] = useState(false);

  const resultId = id ?? null;
  const isFromHistory = Boolean(id);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const { result, state, error } = useInterviewResult({
    resultId: resultId ?? '',
    pollWhenScoring: false,
  });

  useEffect(() => {
    if (activeTab !== 'roadmap') return;
    let active = true;
    setRoadmapError(false);
    void learningService
      .getRoadmap()
      .then((data) => {
        if (active) setRoadmap(data);
      })
      .catch(() => {
        if (active) setRoadmapError(true);
      });
    return () => {
      active = false;
    };
  }, [activeTab]);

  const tabs = useMemo(
    () => [
      { id: 'overview' as const, label: t('practice.result.tabs.overview') },
      { id: 'breakdown' as const, label: t('practice.result.tabs.breakdown') },
      { id: 'feedback' as const, label: t('practice.result.tabs.feedback') },
      { id: 'roadmap' as const, label: t('practice.result.tabs.roadmap') },
    ],
    [t],
  );

  const summaryText = useMemo(() => {
    if (!result) return '';
    return language === 'vi' ? result.summaryVi : result.summary;
  }, [language, result]);

  const strengthText = useMemo(() => {
    if (!result) return [];
    return language === 'vi' ? result.strengthsVi : result.strengths;
  }, [language, result]);

  const weaknessText = useMemo(() => {
    if (!result) return [];
    return language === 'vi' ? result.weaknessesVi : result.weaknesses;
  }, [language, result]);

  const criteriaScores = useMemo(
    () => (result?.radarData ?? []).map((item) => ({
      name: language === 'vi' ? item.subjectVi : item.subject,
      score: item.A,
      maxScore: 100,
      pct: item.A,
    })),
    [language, result],
  );

  if (!resultId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-raised px-6">
        <div className="max-w-xl text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-error" />
          <h1 className="heading-secondary mt-4 text-2xl text-foreground">{t('practice.result.errorTitle')}</h1>
          <p className="body-text mt-2 text-sm text-muted-foreground">{t('practice.result.missingId')}</p>
          <Link to="/candidate/practice/history" className="btn-primary mt-6 inline-flex">
            {t('practice.history.title')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={isFromHistory ? 'flex h-screen flex-col overflow-hidden bg-surface-raised' : 'min-h-screen bg-surface-raised'}>
      <header className="border-b border-subtle bg-surface-raised">
        <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
            {isFromHistory ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/candidate/practice/history')}
                  className="text-foreground hover:underline"
                >
                  {t('practice.history.title')}
                </button>
                <span className="text-muted-foreground">{'>'}</span>
              </>
            ) : null}
            <span className="text-muted-foreground">{t('practice.result.breadcrumb')}</span>
            {result?.certificateId ? (
              <>
                <span className="text-muted-foreground">·</span>
                <Link
                  to={`/candidate/certificates/${result.certificateId}`}
                  className="text-foreground hover:underline"
                >
                  {t('practice.result.viewCertificate')}
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <section className={`${isFromHistory ? 'min-h-0 flex-1 overflow-y-auto px-6 py-6' : 'mx-auto max-w-[1200px] px-6 py-8'}`}>
        {state === 'scoring' ? <ResultScoringPanel /> : null}

        {state === 'loading' ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-subtle bg-surface-raised shadow-sm">
            <p className="body-text text-sm font-medium text-foreground">{t('practice.result.loading')}</p>
          </div>
        ) : null}

        {error ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-error/20 bg-error-bg p-6 shadow-sm">
            <div className="max-w-xl text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-error" />
              <h2 className="heading-secondary mt-4 text-2xl text-error">{t('practice.result.errorTitle')}</h2>
              <p className="body-text mt-2 text-sm text-error/80">{t('practice.result.error')}</p>
            </div>
          </div>
        ) : null}

        {state === 'ready' && result ? (
          <div className="space-y-8">
            <ReportTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'overview' ? (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <SkillRadarChart data={result.radarData} language={language} />
                <InterviewResultOverview
                  result={result}
                  summaryText={summaryText}
                  strengthText={strengthText}
                  weaknessText={weaknessText}
                  locale={locale}
                />
              </section>
            ) : null}

            {activeTab === 'overview' ? (
              <section id="criteria" className="frame-satin overflow-hidden rounded-2xl border border-satin bg-surface-raised">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-chart-cat-1/10 text-chart-cat-1">↗</span>
                    <h2 className="text-lg font-semibold text-foreground">{t('practice.result.criteriaScores')}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-cat-1" aria-hidden />{t('practice.result.radarYourScore')}</span>
                    <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-cat-3" aria-hidden />{t('practice.result.radarThreshold')}<span className="rounded bg-surface-elevated px-1.5 py-0.5 text-foreground">50%</span></span>
                  </div>
                </div>
                <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:p-6">
                  <div className="frame-satin-soft rounded-xl bg-surface-base/60 p-4 sm:p-5">
                    <div className="mb-1 text-center text-sm font-semibold text-foreground">{t('practice.result.skillOverview')}</div>
                    <SkillRadarChart data={result.radarData} language={language} showThreshold yourScoreLabel={t('practice.result.radarYourScore')} thresholdLabel={t('practice.result.radarThreshold')} embedded />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-3 text-sm font-semibold text-foreground">{t('practice.result.criteriaDetail')}</div>
                    <CriteriaProgressList criteria={criteriaScores} passThresholdPct={50} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-subtle bg-surface-base/60 px-5 py-3 text-xs text-muted-foreground sm:px-6">
                  <CriteriaThresholdNote passThresholdPct={50} />
                  <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-success" aria-hidden />{t('practice.result.criteriaUpdatedHint')}</span>
                </div>
              </section>
            ) : null}

            {activeTab === 'breakdown' ? <GapAnalysisList items={result.gapAnalysis} language={language} /> : null}
            {activeTab === 'feedback' ? <QuestionFeedbackAccordion items={result.questionFeedback} /> : null}
            {activeTab === 'roadmap' ? (
              <div className="space-y-4">
                <div>
                  <h2 className="heading-secondary text-2xl text-foreground">{t('practice.roadmap.title')}</h2>
                  <p className="body-text mt-1 text-sm text-muted-foreground">{t('practice.roadmap.subtitle')}</p>
                </div>
                {roadmapError ? (
                  <p className="text-sm text-error">{t('practice.roadmap.error')}</p>
                ) : roadmap ? (
                  <RoadmapTimeline steps={roadmap.steps} />
                ) : (
                  <p className="text-sm text-muted-foreground">{t('practice.result.loading')}</p>
                )}
                <Link to="/candidate/roadmap" className="btn-secondary inline-flex">
                  {t('practice.roadmap.viewFull')}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
};

