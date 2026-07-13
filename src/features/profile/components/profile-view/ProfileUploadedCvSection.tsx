import { Link, useNavigate } from 'react-router-dom';
import { FileText, Loader2, Upload } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CV_ANALYSIS_ID_KEY } from '@/features/cv-analysis/hooks/useCvAnalysisFlow';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';

interface ProfileUploadedCvSectionProps {
  files: UploadedCvFile[];
  isLoading: boolean;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatUploadedAt(value: string, locale: 'vi' | 'en') {
  return new Date(value).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProfileUploadedCvSection({ files, isLoading }: ProfileUploadedCvSectionProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const openReport = (analysisId: string) => {
    sessionStorage.setItem(CV_ANALYSIS_ID_KEY, analysisId);
    navigate('/candidate/cv/analysis/report');
  };

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="heading-secondary text-lg text-foreground">{t('profile.view.uploadedCvs')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('profile.view.uploadedCvsHint')}</p>
          </div>
          <Link to="/candidate/cv/analysis" className={cn(buttonVariants({ variant: 'secondary' }), 'inline-flex gap-2')}>
            <Upload className="size-4" aria-hidden />
            {t('profile.view.uploadCv')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-subtle bg-surface-overlay px-4 py-8 text-center">
            <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">{t('profile.view.noCvUploaded')}</p>
          </div>
        ) : null}

        {!isLoading && files.length > 0 ? (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface-overlay p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.fileName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('profile.view.fileMeta')
                        .replace('{size}', formatFileSize(file.fileSizeBytes))
                        .replace('{date}', formatUploadedAt(file.uploadedAt, language))}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'w-full sm:w-auto')}
                  onClick={() => openReport(file.analysisId)}
                >
                  {t('profile.view.viewReport')}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {isLoading ? (
          <div className="sr-only">
            <Loader2 aria-hidden />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
