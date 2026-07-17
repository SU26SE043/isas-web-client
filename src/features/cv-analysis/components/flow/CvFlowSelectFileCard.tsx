import { CheckCircle2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';
import {
  formatProfileFileDate,
  formatProfileFileSize,
} from '@/features/profile/components/profile-view/profileFileUtils';

interface CvFlowSelectFileCardProps {
  file: FileRecord;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

function parseStatusKey(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'done') return 'profile.view.parseStatus.completed';
  if (normalized === 'failed') return 'profile.view.parseStatus.failed';
  return 'profile.view.parseStatus.pending';
}

export function CvFlowSelectFileCard({
  file,
  isSelected,
  disabled = false,
  onSelect,
}: CvFlowSelectFileCardProps) {
  const { t, language } = useLanguage();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'flex h-full w-full flex-col rounded-lg border border-satin bg-surface-overlay p-4 text-left transition-[border-color,background-color] duration-200 ease-out',
        'hover:border-[var(--satin-border-hover)] hover:bg-white/[0.03]',
        isSelected ? 'border-[var(--satin-border-hover)] bg-white/[0.05]' : null,
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="frame-satin-soft flex size-10 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-foreground">
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ghost" className="text-muted-foreground">
              {t(parseStatusKey(file.parsedStatus))}
            </Badge>
            {isSelected ? (
              <Badge variant="outline" className="border-success/30 bg-success-bg text-success">
                <CheckCircle2 className="size-3" aria-hidden />
                {t('cv.fileSelected')}
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-sm font-medium text-foreground" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatProfileFileSize(file.fileSize)} ·{' '}
            {formatProfileFileDate(file.createdAt, language)}
          </p>
        </div>
      </div>
    </button>
  );
}
