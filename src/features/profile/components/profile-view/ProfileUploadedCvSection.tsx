import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
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
    return `${kb.toFixed(0)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatUploadedAt(value: string, locale: 'vi' | 'en') {
  return new Date(value).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProfileUploadedCvSection({ files, isLoading }: ProfileUploadedCvSectionProps) {
  const { t, language } = useLanguage();

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
              <li key={file.id}>
                <a
                  href={file.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-satin bg-surface-overlay p-4 transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="frame-satin-soft mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-foreground">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{file.fileName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('profile.view.fileMeta')
                          .replace('{size}', formatFileSize(file.fileSizeBytes))
                          .replace('{date}', formatUploadedAt(file.uploadedAt, language))}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {t('profile.view.openCv')}
                    <ExternalLink className="size-4 shrink-0" aria-hidden />
                  </span>
                </a>
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
