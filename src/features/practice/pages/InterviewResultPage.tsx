import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, Loader2, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { resultService } from '../services/result.service';
import type { InterviewResult } from '../types/result.types';
import { GapAnalysisList } from '../components/GapAnalysisList';
import { SkillRadarChart } from '../components/SkillRadarChart';

const RESULT_ID = 'interview-result-001';

const formatDateTime = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const InterviewResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const isFromHistory = !!id;

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await resultService.getInterviewResult(RESULT_ID);
        if (mounted) setResult(data);
      } catch {
        if (mounted) {
          setError(t('practice.result.error'));
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadResult();

    return () => {
      mounted = false;
    };
  }, [language]);

  const resultBreadcrumbLabel = language === 'vi' ? 'Kết quả' : 'Result';

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

  return (
    <main className={`${isFromHistory ? 'h-screen flex flex-col bg-surface-raised overflow-hidden' : 'min-h-screen bg-surface-raised'}`}>
      <header className="border-b border-subtle bg-surface-raised">
        <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <button
              type="button"
              onClick={() => navigate('/practice/history')}
              className="text-foreground hover:underline"
            >
              {t('practice.history.title')}
            </button>
            <span className="text-muted-foreground">{'>'}</span>
            <span className="text-muted-foreground">{resultBreadcrumbLabel}</span>
          </nav>
        </div>
      </header>

      <section className={`${isFromHistory ? 'flex-1 min-h-0 overflow-y-auto px-6 py-6' : 'mx-auto max-w-[1200px] px-6 py-8'}`}>
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-subtle bg-surface-raised shadow-sm">
            <div className="flex items-center gap-3 text-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="body-text text-sm font-medium">
                {t('practice.result.loading')}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-error/20 bg-error-bg p-6 shadow-sm">
            <div className="max-w-xl text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-error" />
              <h2 className="mt-4 heading-secondary text-2xl text-error">
                {t('practice.result.errorTitle')}
              </h2>
              <p className="body-text mt-2 text-sm text-error/80">{error}</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <SkillRadarChart data={result.radarData} language={language} />

              <aside className="space-y-6 rounded-3xl border border-subtle bg-surface-raised p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('practice.result.overallScore')}
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="heading-primary text-5xl text-foreground">{result.overallScore}</span>
                      <span className="pb-1 text-lg font-semibold text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface-raised/5 p-3 text-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl bg-surface-base p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {t('practice.result.completedAt')}
                  </div>
                  <p className="mt-2 body-text text-sm text-muted-foreground">
                    {formatDateTime(result.completedAt, locale)}
                  </p>
                </div>

                <div>
                  <h2 className="heading-secondary text-xl text-foreground">
                    {t('practice.result.summary')}
                  </h2>
                  <p className="body-text mt-2 text-sm text-muted-foreground">{summaryText}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-surface-raised/5 p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('practice.result.strengths')}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {strengthText.map((item) => (
                        <li key={item} className="body-text flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-surface-raised" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-surface-overlay p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('practice.result.weaknesses')}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {weaknessText.map((item) => (
                        <li key={item} className="body-text flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-surface-overlay" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </section>

            <GapAnalysisList items={result.gapAnalysis} language={language} />
          </div>
        ) : null}
      </section>
    </main>
  );
};