import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useExportCampaignResults } from '../../hooks/useCampaignResults';
import type { CampaignResultExportFormat } from '../../types/campaign.api.types';
import {
  defaultExportFileName,
  downloadResultBlob,
  getExportErrorKey,
} from '../../utils/campaignResultsActions';

interface ResultsExportMenuProps {
  campaignId: string;
}

export function ResultsExportMenu({ campaignId }: ResultsExportMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<CampaignResultExportFormat | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const exportMutation = useExportCampaignResults(campaignId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleExport = async (format: CampaignResultExportFormat) => {
    if (exportingFormat) return;
    setExportingFormat(format);
    try {
      const result = await exportMutation.mutateAsync(format);
      downloadResultBlob(
        result.blob,
        result.filename?.trim() || defaultExportFileName(campaignId, format),
      );
      toast.success(t('employer.campaigns.results.export.success'));
      setOpen(false);
    } catch (error) {
      toast.error(t(getExportErrorKey(error)));
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Download className="size-4" aria-hidden />
        {t('employer.campaigns.results.export.label')}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-satin bg-popover p-2 shadow-[var(--shadow-lg)]"
        >
          <ExportOption
            icon={<FileSpreadsheet className="size-4" aria-hidden />}
            title={t('employer.campaigns.results.export.csv')}
            description={t('employer.campaigns.results.export.csvHint')}
            loading={exportingFormat === 'csv'}
            disabled={Boolean(exportingFormat)}
            onClick={() => void handleExport('csv')}
          />
          <ExportOption
            icon={<FileText className="size-4" aria-hidden />}
            title={t('employer.campaigns.results.export.pdf')}
            description={t('employer.campaigns.results.export.pdfHint')}
            loading={exportingFormat === 'pdf'}
            disabled={Boolean(exportingFormat)}
            onClick={() => void handleExport('pdf')}
          />
        </div>
      ) : null}
    </div>
  );
}

function ExportOption({
  icon,
  title,
  description,
  loading,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.05] disabled:opacity-50"
    >
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-foreground">
          {loading
            ? t('employer.campaigns.results.export.exporting').replace('{{format}}', title)
            : title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
