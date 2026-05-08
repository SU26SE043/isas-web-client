import React, { useState } from 'react';
import { CVUploadForm } from '../components/CVUploadForm';
import { CVAnalysisSidebar } from '../components/CVAnalysisSidebar';

export const CVAnalysisPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24 pt-8">
      <div className="w-full px-6 lg:px-16 xl:px-32">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Phân tích CV thông minh</h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Tải CV và mô tả công việc để AI bắt đầu quá trình đánh giá năng lực của bạn.
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
