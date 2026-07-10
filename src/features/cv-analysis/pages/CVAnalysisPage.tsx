import React, { useState } from 'react';
import { CVUploadForm } from '../components/CVUploadForm';
import { CVAnalysisSidebar } from '../components/CVAnalysisSidebar';
import { useCvAnalysisResult } from '../hooks/useCvAnalysisResult';
import { useLanguage } from '../../../shared/languages';

export const CVAnalysisPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisLanguage, setAnalysisLanguage] = useState<'vi' | 'en'>('en');
  const { result } = useCvAnalysisResult();
  const { t } = useLanguage();

  return (
    <div className="dashboard-content min-h-full pb-12">
      <div className="page-container max-w-none px-0">
        <div className="mb-10">
          <h1 className="text-4xl heading-primary mb-3 tracking-tight">{t('cv.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t('cv.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6 bg-surface-raised rounded-xl p-4 lg:px-6 lg:py-5 border border-subtle shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 text-foreground font-bold">
                <span>{t('cv.analysisLanguage')}</span>
              </div>
              <div className="flex bg-surface-overlay p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAnalysisLanguage('vi')}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${analysisLanguage === 'vi' ? 'bg-surface-elevated text-foreground shadow-md' : 'text-muted-foreground hover:text-muted-foreground'}`}
                >
                  {t('cv.vietnamese')}
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisLanguage('en')}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${analysisLanguage === 'en' ? 'bg-surface-elevated text-foreground shadow-md' : 'text-muted-foreground hover:text-muted-foreground'}`}
                >
                  {t('cv.english')}
                </button>
              </div>
            </div>
            <CVUploadForm
              onFileUpload={setUploadedFile}
              analysisLanguage={analysisLanguage}
            />
          </div>

          <div className="lg:col-span-1">
            <CVAnalysisSidebar
              uploadedFile={uploadedFile}
              profileCompletionPercent={result?.profileCompletionPercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
