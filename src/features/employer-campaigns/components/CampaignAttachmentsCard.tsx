import { useState } from 'react';
import { Download, FileText, LoaderCircle, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../services/campaignManagement.service';
import {
  readCampaignAttachments,
  triggerBlobDownload,
  type CampaignFileType,
} from '../utils/campaignFiles';

interface CampaignAttachmentsCardProps {
  campaignId: string;
}

export function CampaignAttachmentsCard({ campaignId }: CampaignAttachmentsCardProps) {
  const { t, language } = useLanguage();
  const [downloading, setDownloading] = useState<CampaignFileType | null>(null);
  const [attachments] = useState(() => readCampaignAttachments(campaignId));

  const handleDownload = async (fileType: CampaignFileType, fallbackName: string) => {
    setDownloading(fileType);
    try {
      const result = await campaignManagementService.downloadCampaignFile(campaignId, fileType);
      triggerBlobDownload(result, fallbackName);
    } catch {
      toast.error(t('employer.campaigns.detail.attachments.downloadFailed'));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className="frame-satin bg-surface-raised">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-satin bg-surface-overlay text-foreground">
            <Paperclip className="size-4" aria-hidden />
          </span>
          <span>
            {t('employer.campaigns.detail.attachments.title')}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({attachments.length})
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-satin bg-surface-overlay px-4 py-5 text-center text-sm text-muted-foreground">
            {t('employer.campaigns.detail.attachments.empty')}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {attachments.map((attachment) => {
              const isDownloading = downloading === attachment.type;
              return (
                <div
                  key={attachment.type}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-satin bg-surface-overlay p-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-satin bg-surface-raised text-muted-foreground">
                    <FileText className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={attachment.name}>
                      {attachment.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t(`employer.campaigns.detail.attachments.type.${attachment.type}`)} ·{' '}
                      {formatBytes(attachment.size, language)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={downloading !== null}
                    onClick={() => void handleDownload(attachment.type, attachment.name)}
                    aria-label={`${t('employer.campaigns.detail.attachments.download')} ${attachment.name}`}
                  >
                    {isDownloading ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Download className="size-4" aria-hidden />
                    )}
                    <span className="hidden sm:inline">
                      {t('employer.campaigns.detail.attachments.download')}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number, language: string): string {
  if (bytes === 0) return '0 KB';
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      maximumFractionDigits: 1,
    }).format(megabytes)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
