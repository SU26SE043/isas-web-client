import React, { useState } from 'react';
import { CVUploadForm } from '../components/CVUploadForm';
import { CVAnalysisSidebar } from '../components/CVAnalysisSidebar';
import { useLanguage } from '../../../shared/languages';

export const CVAnalysisPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { t } = useLanguage();

  return (
    <div className="bg-surface-base min-h-[calc(100vh-80px)] pb-24 pt-8">
      <div className="page-container">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl heading-primary mb-3 tracking-tight">{t('cv.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('cv.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2">
            <CVUploadForm onFileUpload={setUploadedFile} />
          </div>

          {/* Right Column (1/3 width) */}
          <div className="lg:col-span-1">
            <CVAnalysisSidebar uploadedFile={uploadedFile} />
          </div>

        </div>
      </div>
    </div>
  );
};
