import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import { validateCvFile } from '../utils/cvFileValidation';

interface CVUploadFormProps {
  onFileUpload: (file: File | null) => void;
  analysisLanguage: 'vi' | 'en';
}

export const CVUploadForm: React.FC<CVUploadFormProps> = ({ onFileUpload, analysisLanguage }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateCvFile(file);
    if (validation === 'invalidType') {
      setFileError(t('cv.invalidType'));
      setUploadedFile(null);
      onFileUpload(null);
      return;
    }
    if (validation === 'invalidSize') {
      setFileError(t('cv.invalidSize'));
      setUploadedFile(null);
      onFileUpload(null);
      return;
    }

    setFileError(null);
    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleSubmit = async () => {
    if (!uploadedFile || isSubmitting) return;

    setIsSubmitting(true);
    setParseProgress(10);
    try {
      const progressTimer = window.setInterval(() => {
        setParseProgress((value) => Math.min(value + 12, 90));
      }, 400);

      await cvAnalysisService.submitAnalysis({
        file: uploadedFile,
        jobDescription: jobDescription.trim() || undefined,
        language: analysisLanguage,
      });

      window.clearInterval(progressTimer);
      setParseProgress(100);
      navigate('/candidate/cv/analysis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface-raised rounded-xl border-2 border-dashed border-default hover:border-subtle transition-colors flex flex-col items-center justify-center py-16 px-6 relative group overflow-hidden">
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          aria-invalid={fileError ? true : undefined}
        />

        <h3 className="text-2xl font-extrabold text-foreground mb-2 relative z-10">{t('cv.dropTitle')}</h3>
        <p className="text-muted-foreground mb-4 font-medium relative z-10">{t('cv.dropDescription')}</p>
        {uploadedFile ? <p className="text-sm text-foreground relative z-10">{uploadedFile.name}</p> : null}
        {fileError ? <p className="mt-2 text-sm text-error relative z-10" role="alert">{fileError}</p> : null}
      </div>

      {isSubmitting ? (
        <div className="rounded-xl border border-subtle bg-surface-raised p-4" aria-live="polite">
          <p className="text-sm font-medium text-foreground">{t('cv.parseProgress')}</p>
          <p className="text-caption text-muted-foreground mt-1">{t('cv.parseProgressHint')}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${parseProgress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="bg-surface-raised rounded-xl p-6 border border-subtle shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 space-y-2 sm:space-y-0">
          <span className="text-foreground font-bold text-lg">{t('cv.jdTitle')}</span>
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

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!uploadedFile || isSubmitting || Boolean(fileError)}
          className="btn-primary px-10 py-4 text-lg w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('cv.analyzing') : t('cv.startAnalysis')}
        </button>
      </div>
    </div>
  );
};
