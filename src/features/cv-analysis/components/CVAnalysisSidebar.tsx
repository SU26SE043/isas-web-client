import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../shared/languages';

interface CVAnalysisSidebarProps {
  uploadedFile: File | null;
}

export const CVAnalysisSidebar: React.FC<CVAnalysisSidebarProps> = ({ uploadedFile }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { t } = useLanguage();
  
  const fileUrl = useMemo(() => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
    return '';
  }, [uploadedFile]);

  return (
    <>
      <div className="space-y-6">
      
      {/* CV Preview Area */}
      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm flex flex-col h-[240px]">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-extrabold text-foreground flex items-center">
             <svg className="w-5 h-5 text-foreground mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
             {t('cv.previewTitle')}
           </h3>
        </div>
        
        {uploadedFile ? (
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex-grow flex flex-col items-center justify-center bg-surface-overlay/20 rounded-xl border border-subtle relative overflow-hidden group hover:bg-surface-overlay/30 transition-colors w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            title={t('cv.previewHint')}
          >
            {/* Minimal document UI icon */}
            <div className="w-16 h-20 bg-surface-raised shadow-md rounded-sm border border-subtle flex flex-col p-2.5 mb-3 transform group-hover:-translate-y-1 transition-transform">
               <div className="w-full h-1 bg-surface-highlight rounded-full mb-1.5"></div>
               <div className="w-3/4 h-1 bg-surface-highlight rounded-full mb-1.5"></div>
               <div className="w-full h-1 bg-surface-highlight rounded-full mb-1.5"></div>
               <div className="w-5/6 h-1 bg-surface-highlight rounded-full mb-1.5"></div>
            </div>
            <span className="text-sm text-foreground font-bold truncate w-full px-6 text-center" title={uploadedFile.name}>
              {uploadedFile.name}
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-1">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
            
            {/* Success checkmark badge */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-surface-overlay text-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* View hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
               <span className="bg-surface-raised/90 backdrop-blur text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center mt-20">
                 <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                 </svg>
                 {t('cv.viewPreview')}
               </span>
            </div>
          </button>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center bg-surface-base rounded-xl border border-dashed border-default">
             <svg className="w-10 h-10 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             <span className="text-sm text-muted-foreground font-medium text-center px-4">{t('cv.noFile')}</span>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-surface-raised rounded-xl p-6 border-2 border-subtle shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-surface-overlay"></div>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-surface-overlay/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-foreground">{t('cv.tipsTitle')}</h3>
        </div>

        <ul className="space-y-5">
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 ${uploadedFile ? 'text-muted-foreground ' : 'text-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-muted-foreground leading-relaxed font-medium mt-0.5">{t('cv.tipStructure')}</span>
          </li>
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 delay-100 ${uploadedFile ? 'text-muted-foreground ' : 'text-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-muted-foreground leading-relaxed font-medium mt-0.5">{t('cv.tipJd')}</span>
          </li>
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 delay-200 ${uploadedFile ? 'text-muted-foreground ' : 'text-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-muted-foreground leading-relaxed font-medium mt-0.5">{t('cv.tipKeywords')}</span>
          </li>
        </ul>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-sm font-extrabold text-foreground">{t('cv.profileCompletion')}</h4>
          <span className="text-xl font-black text-foreground">75%</span>
        </div>
        <div className="w-full bg-surface-overlay rounded-full h-3 mb-5 overflow-hidden ">
          <div className="bg-surface-overlay h-full rounded-full w-[75%] relative">
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-surface-overlay/30 animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic border-t border-subtle pt-4">
          {t('cv.profileCompletionNote')}
        </p>
      </div>
    </div>

    {/* Modal Popup */}
    {isPreviewOpen && uploadedFile && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
        <div className="relative w-full max-w-4xl h-[85vh] bg-surface-raised rounded-3xl shadow-md overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center p-5 border-b border-subtle bg-surface-raised z-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-surface-overlay/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{uploadedFile.name}</h2>
                <p className="text-xs text-muted-foreground font-medium">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="p-2 hover:bg-surface-elevated text-muted-foreground hover:text-muted-foreground rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-grow bg-surface-overlay overflow-hidden relative">
            {uploadedFile.type === 'application/pdf' ? (
              <iframe src={fileUrl} className="w-full h-full border-none" title={t('cv.previewModalTitle')} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-surface-base">
                 <svg className="w-20 h-20 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <p className="font-bold text-muted-foreground text-lg">{t('cv.unsupportedPreviewTitle')}</p>
                 <p className="text-sm mt-2">{t('cv.unsupportedPreviewDescription')} ({uploadedFile.type || 'Word Document'})</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
