import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useCvAnalyses } from '../../hooks/useCvAnalyses';
import { useInterviewFiles } from '../../hooks/useInterviewFiles';
import { CvAnalysisAccordionItem } from './CvAnalysisAccordionItem';
import { CvAnalysisListSkeleton } from './CvAnalysisReportSkeleton';

export function CvAnalysisReportsSection({
  active = true,
  onCountChange,
}: {
  active?: boolean;
  onCountChange?: (count: number | null) => void;
}) {
  const { t } = useLanguage();
  const { data: analyses = [], isLoading, isError, refetch, isFetching } = useCvAnalyses();
  // `CvAnalysisResult` only carries `cvId`, so the file name is joined here once
  // for the whole list instead of per row.
  const { files } = useInterviewFiles();
  const cvNameById = useMemo(
    () => new Map(files.map((file) => [file.id, file.originalName])),
    [files],
  );
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    onCountChange?.(isLoading || isError ? null : analyses.length);
  }, [analyses.length, isError, isLoading, onCountChange]);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  if (!active) return null;

  return (
    <div className="space-y-3">
      {isLoading ? <CvAnalysisListSkeleton /> : null}

      {isError ? (
        <div className="rounded-xl border border-satin bg-surface-overlay px-5 py-8 text-center">
          <p className="text-sm text-error">{t('cv.report.errorList')}</p>
          <Button
            type="button"
            className="mt-4"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <AlertCircle className="size-4" aria-hidden />
            {t('cv.report.retry')}
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && analyses.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-satin bg-surface-overlay px-4 py-5 text-center">
          <p className="text-sm font-medium text-foreground">{t('cv.report.emptyTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('cv.report.emptyDescription')}</p>
          <Link to="/candidate/cv/analysis" className="btn-primary inline-flex text-sm">
            {t('cv.report.emptyCta')}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && analyses.length > 0 ? (
        <div className="space-y-3">
          {analyses.map((item) => (
            <CvAnalysisAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
              cvFileName={cvNameById.get(item.cvId)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
