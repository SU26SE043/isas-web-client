import React from 'react';
import { Check, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

export const CvReportFeedbackSection: React.FC = () => {
  const { t } = useLanguage();

  const strengths = [t('result.strength1'), t('result.strength2'), t('result.strength3')];
  const improvements = [t('result.improvement1'), t('result.improvement2'), t('result.improvement3')];

  return (
    <CvFlowSectionCard title={t('result.strategicAnalysis')}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-label mb-3 text-foreground">{t('result.coreStrengths')}</h3>
          <ul className="space-y-2">
            {strengths.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-label mb-3 text-error">{t('result.improvements')}</h3>
          <ul className="space-y-2">
            {improvements.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CvFlowSectionCard>
  );
};

export const CvReportActionsBar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 border-t border-subtle pt-6 sm:flex-row sm:justify-end">
      <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2" onClick={() => navigate('/candidate/cv/analysis')}>
        <RefreshCw className="size-4" aria-hidden />
        {t('result.reuploadCv')}
      </button>
      <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2">
        <Download className="size-4" aria-hidden />
        {t('result.downloadReport')}
      </button>
      <button type="button" className="btn-primary inline-flex items-center justify-center gap-2">
        <Sparkles className="size-4" aria-hidden />
        {t('result.improveCv')}
      </button>
    </div>
  );
};
