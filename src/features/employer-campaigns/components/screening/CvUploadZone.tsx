import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { validateCampaignPdf } from '../../utils/campaignFiles';
import { formatFileSize, pdfValidationMessageKey, type PendingCvFile } from './screeningUtils';

interface CvUploadZoneProps {
  files: PendingCvFile[];
  onFilesChange: (files: PendingCvFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
  isActive: boolean;
}

export function CvUploadZone({
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
  isActive,
}: CvUploadZoneProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    for (const file of Array.from(incoming)) {
      const code = validateCampaignPdf(file);
      next.push({
        file,
        errorKey: code ? pdfValidationMessageKey(code) : undefined,
      });
    }
    onFilesChange(next);
  };

  const validCount = files.filter((item) => !item.errorKey).length;
  const invalidCount = files.length - validCount;
  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          {t('employer.campaigns.screening.upload.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('employer.campaigns.screening.upload.description')}
        </p>
      </div>

      <div
        className={cn(
          'rounded-lg border border-dashed border-satin bg-surface-overlay px-4 py-8 text-center transition-colors',
          dragOver && 'border-foreground/40 bg-white/[0.03]',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
      >
        <button
          type="button"
          className={cn(
            'mx-auto grid size-12 place-items-center rounded-xl border border-info/40',
            'bg-info/10 text-info shadow-sm transition-all',
            'hover:border-info/70 hover:bg-info/20 hover:text-info-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2',
            'focus-visible:ring-offset-surface-overlay disabled:cursor-not-allowed disabled:opacity-50',
          )}
          aria-label={t('employer.campaigns.screening.upload.selectFiles')}
          disabled={!isActive || isAnalyzing}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-7" aria-hidden />
        </button>
        <p className="mt-3 text-sm font-medium text-foreground">
          {t('employer.campaigns.screening.upload.selectFiles')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('employer.campaigns.screening.upload.pdfOnly')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="sr-only"
          tabIndex={-1}
          disabled={!isActive || isAnalyzing}
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employer.campaigns.screening.upload.empty')}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {t('employer.campaigns.screening.upload.selectedCount').replace(
                '{count}',
                String(files.length),
              )}
            </span>
            <span>
              {t('employer.campaigns.screening.upload.validCount').replace(
                '{count}',
                String(validCount),
              )}
            </span>
            <span>
              {t('employer.campaigns.screening.upload.invalidCount').replace(
                '{count}',
                String(invalidCount),
              )}
            </span>
            <span>
              {t('employer.campaigns.screening.upload.totalSize').replace(
                '{size}',
                formatFileSize(totalSize),
              )}
            </span>
          </div>

          <ul className="space-y-2">
            {files.map((item, index) => (
              <li
                key={`${item.file.name}-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-satin bg-surface-overlay px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                  {item.errorKey ? (
                    <p className="mt-1 text-xs text-error">{t(item.errorKey)}</p>
                  ) : (
                    <p className="mt-1 text-xs text-success">{t('employer.campaigns.screening.upload.valid')}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t('employer.campaigns.screening.upload.remove')}
                  disabled={isAnalyzing}
                  onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isAnalyzing || files.length === 0}
              onClick={() => onFilesChange([])}
            >
              {t('employer.campaigns.screening.upload.clearAll')}
            </Button>
            <Button
              type="button"
              disabled={!canAnalyze}
              loading={isAnalyzing}
              onClick={onAnalyze}
            >
              {isAnalyzing
                ? t('employer.campaigns.screening.upload.analyzing')
                : t('employer.campaigns.screening.upload.analyze')}
            </Button>
          </div>
        </div>
      )}

      {!isActive ? (
        <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.upload.pending')}</p>
      ) : null}
    </div>
  );
}
