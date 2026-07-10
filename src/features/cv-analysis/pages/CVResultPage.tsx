import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CvProfileMappingPanel } from '@/features/profile/components/CvProfileMappingPanel';
import { CvAnalysisStepper } from '../components/CvAnalysisStepper';
import { CvMatchReportHeader } from '../components/report/CvMatchReportHeader';
import { CvReportInsightsSection } from '../components/report/CvReportInsightsSection';
import { CvReportSkillsSection } from '../components/report/CvReportSkillsSection';
import { CvReportExperienceSection } from '../components/report/CvReportExperienceSection';
import { CvReportProjectsSection } from '../components/report/CvReportProjectsSection';
import { CvReportEducationSection } from '../components/report/CvReportEducationSection';
import { CvReportActionsBar, CvReportFeedbackSection } from '../components/report/CvReportFeedbackSection';
import { useCvAnalysisResult } from '../hooks/useCvAnalysisResult';

export const CVResultPage: React.FC = () => {
  const { t } = useLanguage();
  const { result, isLoading, error } = useCvAnalysisResult();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="body-text text-center">{t('cv.analysisFailed')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content min-h-full pb-12">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="heading-primary text-3xl tracking-tight">{t('cv.reportTitle')}</h1>
          <p className="body-text mt-2 max-w-2xl">{t('cv.reportDescription')}</p>
        </div>
        <CvAnalysisStepper currentStep="report" />
      </div>

      <div className="mx-auto max-w-5xl space-y-4">
        <CvMatchReportHeader result={result} />
        <CvReportInsightsSection result={result} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CvReportSkillsSection result={result} />
          <CvReportExperienceSection result={result} />
          <CvReportProjectsSection result={result} />
          <CvReportEducationSection result={result} />
        </div>
        <CvReportFeedbackSection />
        <CvProfileMappingPanel result={result} />
        <CvReportActionsBar />
      </div>
    </div>
  );
};
