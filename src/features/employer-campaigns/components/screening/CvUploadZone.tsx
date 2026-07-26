import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { validateCampaignPdf } from '../../utils/campaignFiles';
import { pdfValidationMessageKey, type PendingCvFile } from './screeningUtils';
import { CvUploadFileQueue } from './CvUploadFileQueue';

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
        <CvUploadFileQueue
          files={files}
          onFilesChange={onFilesChange}
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          canAnalyze={canAnalyze}
        />
      )}

      {!isActive ? (
        <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.upload.pending')}</p>
      ) : null}
    </div>
  );
}
