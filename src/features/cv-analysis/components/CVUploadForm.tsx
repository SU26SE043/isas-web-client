import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { cvAnalysisService } from '../services/cvAnalysis.service';

interface CVUploadFormProps {
  onFileUpload: (file: File) => void;
  analysisLanguage: 'vi' | 'en';
}

export const CVUploadForm: React.FC<CVUploadFormProps> = ({ onFileUpload, analysisLanguage }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await cvAnalysisService.submitAnalysis({
        file: uploadedFile,
        jobDescription: jobDescription.trim() || undefined,
        language: analysisLanguage,
      });
      navigate('/cv-analysis/result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-surface-raised rounded-xl border-2 border-dashed border-default hover:border-subtle transition-colors flex flex-col items-center justify-center py-16 px-6 relative group overflow-hidden">
        <input 
          type="file" 
          accept=".pdf,.doc,.docx" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        
        <div className="absolute inset-0 bg-surface-overlay/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="w-16 h-16 bg-surface-overlay text-white rounded-full flex items-center justify-center mb-6 shadow-sm  transform group-hover:scale-110 transition-transform duration-300 relative z-10">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <h3 className="text-2xl font-extrabold text-foreground mb-2 relative z-10">{t('cv.dropTitle')}</h3>
        <p className="text-muted-foreground mb-8 font-medium relative z-10">{t('cv.dropDescription')}</p>

        <button className="bg-surface-overlay text-white px-8 py-3.5 rounded-xl font-bold hover:bg-surface-elevated active:scale-95 transition-all relative z-10 pointer-events-none">
          {t('cv.chooseFile')}
        </button>
      </div>

      {/* Job Description (JD) */}
      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 text-foreground font-bold text-lg">
            <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t('cv.jdTitle')}</span>
          </div>
          <span className="text-xs text-muted-foreground font-bold bg-surface-overlay px-3 py-1.5 rounded-lg border border-subtle">
            {t('cv.optional')}
          </span>
        </div>
        <textarea
          className="w-full h-40 bg-surface-base border border-subtle rounded-xl p-5 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:bg-surface-raised resize-none transition-all placeholder:text-muted-foreground font-medium"
          placeholder={t('cv.jdPlaceholder')}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!uploadedFile || isSubmitting}
          className="bg-surface-overlay text-muted-foreground px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider hover:bg-surface-elevated active:scale-95 transition-all shadow-sm flex items-center space-x-3 group w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? t('cv.analyzing') : t('cv.startAnalysis')}</span>
          <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
