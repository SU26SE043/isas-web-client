import { FileText, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { AnalysisFileMeta, CvAnalysisResult } from '../../types/cvAnalysis.types';

interface CvReportSourceActionsProps {
  analysis: CvAnalysisResult;
  meta?: AnalysisFileMeta | null;
  onOpenCv: () => void;
  onOpenJd: () => void;
}

export function CvReportSourceActions({
  analysis,
  meta,
  onOpenCv,
  onOpenJd,
}: CvReportSourceActionsProps) {
  const { t } = useLanguage();
  const hasRequirementData = analysis.mustHaveMatches.length + analysis.niceToHaveMatches.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" onClick={onOpenCv}>
        <FileText className="size-4" aria-hidden />
        <span className="max-w-52 truncate">{meta?.cvFileName || t('cv.report.source.cv')}</span>
        <Maximize2 className="size-3.5" aria-hidden />
      </Button>

      {analysis.jdId ? (
        <Button type="button" variant="outline" onClick={onOpenJd}>
          <FileText className="size-4" aria-hidden />
          <span className="max-w-52 truncate">{meta?.jdFileName || t('cv.report.source.jd')}</span>
          <Maximize2 className="size-3.5" aria-hidden />
        </Button>
      ) : (
        <span className="rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-xs text-muted-foreground">
          {hasRequirementData ? t('cv.report.source.jdText') : t('cv.report.noJd')}
        </span>
      )}
    </div>
  );
}
