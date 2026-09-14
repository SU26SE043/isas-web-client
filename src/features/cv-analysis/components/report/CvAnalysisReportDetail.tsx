import { useState } from 'react';
import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import {
  CvDocumentViewerDialog,
  type CvDocumentViewerTarget,
} from './CvDocumentViewerDialog';
import { CvEvidenceInsights } from './CvEvidenceInsights';
import { JDMatchCard } from './JDMatchCard';
import { SuggestionCard } from './SuggestionCard';
import { CvReportSourceActions } from './CvReportSourceActions';

interface CvAnalysisReportDetailProps {
  analysis: CvAnalysisResult;
}

export function CvAnalysisReportDetail({ analysis }: CvAnalysisReportDetailProps) {
  const { language, t } = useLanguage();
  const [viewerTarget, setViewerTarget] = useState<CvDocumentViewerTarget | null>(null);
  const category =
    formatJobCategoryDisplay(analysis.jobCategory, language) || analysis.jobCategory;
  const analyzedAt = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';
  const hasJd = Boolean(analysis.jdId) || analysis.jdMatch != null;

  return (
    <div className="space-y-5 border-t border-satin px-5 py-5 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none">
      {analysis.jdMatch ? (
        <JDMatchCard jdMatch={analysis.jdMatch} />
      ) : (
        <p className="rounded-xl border border-satin bg-surface-raised px-4 py-4 text-sm text-muted-foreground">
          {t('cv.report.noJdMatchNote')}
        </p>
      )}

      <section className="rounded-xl border border-satin bg-surface-raised p-5">
        <h3 className="text-sm font-medium text-foreground">{t('cv.report.summary')}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere]">
          {analysis.summary || t('cv.report.emptyList')}
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t('cv.report.jobCategory')}</dt>
            <dd className="font-medium text-foreground">{category}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('cv.report.analyzedAt')}</dt>
            <dd className="font-medium text-foreground">{analyzedAt}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">{t('cv.report.jdUsage')}</dt>
            <dd className="font-medium text-foreground">
              {hasJd ? t('cv.report.withJd') : t('cv.report.withoutJd')}
            </dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-satin/60 pt-4">
          <CvReportSourceActions
            analysis={analysis}
            onOpenCv={() => setViewerTarget({ kind: 'cv', fileId: analysis.cvId })}
            onOpenJd={() => analysis.jdId && setViewerTarget({ kind: 'jd', fileId: analysis.jdId })}
          />
        </div>
      </section>

      <CvEvidenceInsights
        analysis={analysis}
        onViewCv={(match) => setViewerTarget({
          kind: 'cv',
          fileId: analysis.cvId,
          page: match.page,
          evidence: match,
        })}
      />

      <SuggestionCard suggestions={analysis.suggestions} />
      <CvDocumentViewerDialog target={viewerTarget} onClose={() => setViewerTarget(null)} />
    </div>
  );
}
