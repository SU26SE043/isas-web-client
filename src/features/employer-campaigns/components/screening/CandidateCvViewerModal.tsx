import { useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../../services/campaignManagement.service';
import {
  candidateCvDownloadName,
  getCandidateCvErrorKey,
} from '../../utils/campaignCandidateActions';
import { triggerBlobDownload } from '../../utils/campaignFiles';

interface CandidateCvViewerModalProps {
  open: boolean;
  campaignId: string;
  candidateId: string | null;
  candidateName?: string | null;
  onClose: () => void;
}

export function CandidateCvViewerModal({
  open,
  campaignId,
  candidateId,
  candidateName,
  onClose,
}: CandidateCvViewerModalProps) {
  const { t } = useLanguage();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!open || !candidateId) {
      setPdfUrl(null);
      setBlob(null);
      setErrorKey(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const load = async () => {
      setIsLoading(true);
      setErrorKey(null);
      setPdfUrl(null);
      setBlob(null);
      try {
        const pdfBlob = await campaignManagementService.getCampaignCandidateCv(
          campaignId,
          candidateId,
        );
        if (cancelled) return;
        objectUrl = URL.createObjectURL(pdfBlob);
        setBlob(pdfBlob);
        setPdfUrl(objectUrl);
      } catch (error) {
        if (cancelled) return;
        setErrorKey(getCandidateCvErrorKey(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, campaignId, candidateId, reloadToken]);

  const title = t('employer.campaigns.screening.cv.title').replace(
    '{{name}}',
    candidateName?.trim() || t('employer.campaigns.screening.ranking.candidate'),
  );

  const handleDownload = () => {
    if (!blob) return;
    triggerBlobDownload(
      { blob, filename: candidateCvDownloadName(candidateName) },
      candidateCvDownloadName(candidateName),
    );
  };

  const handleOpenTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[90vh] w-[min(96vw,72rem)] max-w-none flex-col gap-3 sm:max-w-none">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-satin bg-surface-overlay">
          {isLoading ? (
            <div className="flex h-full min-h-[20rem] items-center justify-center">
              <Spinner className="size-8" label={t('employer.campaigns.screening.cv.loading')} />
            </div>
          ) : null}

          {errorKey && !isLoading ? (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-3 p-6">
              <Alert variant="error" className="max-w-md">
                <AlertDescription>{t(errorKey)}</AlertDescription>
              </Alert>
              <Button type="button" variant="outline" onClick={() => setReloadToken((n) => n + 1)}>
                {t('employer.campaigns.screening.errors.retry')}
              </Button>
            </div>
          ) : null}

          {pdfUrl && !isLoading && !errorKey ? (
            <iframe
              src={pdfUrl}
              title={title}
              className="h-full min-h-[20rem] w-full border-0 bg-black/20"
            />
          ) : null}
        </div>

        <DialogFooter className="shrink-0 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!pdfUrl}
              onClick={handleOpenTab}
            >
              <ExternalLink className="size-4" aria-hidden />
              {t('employer.campaigns.screening.cv.openTab')}
            </Button>
            <Button type="button" variant="outline" disabled={!blob} onClick={handleDownload}>
              <Download className="size-4" aria-hidden />
              {t('employer.campaigns.screening.cv.download')}
            </Button>
          </div>
          <Button type="button" onClick={onClose}>
            {t('employer.campaigns.screening.detail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
