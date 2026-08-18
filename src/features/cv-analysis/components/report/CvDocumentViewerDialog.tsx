import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Quote } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { downloadBlobAsFile } from '@/shared/utils/downloadBlob';
import { useLanguage } from '@/shared/languages';
import { cvAnalysisService } from '../../services/cvAnalysis.service';
import type { RequirementMatch } from '../../types/cvAnalysis.types';
import { buildPdfViewerUrl } from '../../utils/cvEvidence';

export interface CvDocumentViewerTarget {
  fileId: string;
  kind: 'cv' | 'jd';
  fileName?: string | null;
  page?: number | null;
  evidence?: RequirementMatch | null;
}

interface CvDocumentViewerDialogProps {
  target: CvDocumentViewerTarget | null;
  onClose: () => void;
}

export function CvDocumentViewerDialog({ target, onClose }: CvDocumentViewerDialogProps) {
  const { t } = useLanguage();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!target) {
      setBlob(null);
      setObjectUrl(null);
      setError(false);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    let nextUrl: string | null = null;
    setIsLoading(true);
    setError(false);
    setBlob(null);
    setObjectUrl(null);

    void cvAnalysisService.getFileBlob(target.fileId).then((pdfBlob) => {
      if (cancelled) return;
      nextUrl = URL.createObjectURL(pdfBlob);
      setBlob(pdfBlob);
      setObjectUrl(nextUrl);
    }).catch(() => {
      if (!cancelled) setError(true);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [reloadToken, target?.fileId]);

  const viewerUrl = useMemo(
    () => objectUrl ? buildPdfViewerUrl(objectUrl, target?.page) : null,
    [objectUrl, target?.page],
  );
  const title = target?.kind === 'jd' ? t('cv.report.source.jd') : t('cv.report.source.cv');
  const fileName = target?.fileName || `${title}.pdf`;

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        closeLabel={t('cv.report.source.close')}
        className="flex h-[92dvh] w-[min(96vw,80rem)] max-w-none flex-col gap-3 sm:max-w-none"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" aria-hidden />
            {title} · {fileName}
          </DialogTitle>
        </DialogHeader>

        {target?.evidence ? (
          <div className="shrink-0 rounded-xl border border-info/25 bg-info-bg px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-info">
              <Quote className="size-3.5" aria-hidden /> {t('cv.report.evidence.quote')}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground">“{target.evidence.evidence}”</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {target.evidence.sectionTitle || t('cv.report.evidence.unknownSection')}
              {target.page ? ` · ${t('cv.report.evidence.page')} ${target.page}` : ''}
            </p>
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-satin bg-surface-overlay">
          {isLoading ? <div className="flex h-full min-h-80 items-center justify-center"><Spinner className="size-8" label={t('cv.report.source.loading')} /></div> : null}
          {error && !isLoading ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 p-6">
              <Alert variant="error" className="max-w-md"><AlertDescription>{t('cv.report.source.error')}</AlertDescription></Alert>
              <Button type="button" variant="outline" onClick={() => setReloadToken((value) => value + 1)}>{t('cv.report.retry')}</Button>
            </div>
          ) : null}
          {viewerUrl && !isLoading && !error ? <iframe src={viewerUrl} title={`${title} ${fileName}`} className="h-full min-h-80 w-full border-0 bg-black/20" /> : null}
        </div>

        <DialogFooter className="shrink-0 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!viewerUrl} onClick={() => viewerUrl && window.open(viewerUrl, '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="size-4" aria-hidden /> {t('cv.report.source.openTab')}
            </Button>
            <Button type="button" variant="outline" disabled={!blob} onClick={() => blob && downloadBlobAsFile(blob, fileName)}>
              <Download className="size-4" aria-hidden /> {t('cv.report.source.download')}
            </Button>
          </div>
          <Button type="button" onClick={onClose}>{t('cv.report.source.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
