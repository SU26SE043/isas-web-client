export const CAMPAIGN_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const CAMPAIGN_PDF_MIME = 'application/pdf';

export type CampaignFileType = 'jd' | 'criteria';

export type CampaignAttachmentMetadata = {
  type: CampaignFileType;
  name: string;
  size: number;
};

export type CampaignPdfErrorCode = 'notPdf' | 'tooLarge' | 'corrupt';

export type BlobDownloadResult = {
  blob: Blob;
  filename?: string;
};

const CAMPAIGN_ATTACHMENTS_STORAGE_PREFIX = 'isas:campaign-attachments:';

function campaignAttachmentsStorageKey(campaignId: string): string {
  return `${CAMPAIGN_ATTACHMENTS_STORAGE_PREFIX}${campaignId}`;
}

export function readCampaignAttachments(campaignId: string): CampaignAttachmentMetadata[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(campaignAttachmentsStorageKey(campaignId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CampaignAttachmentMetadata => {
      if (!item || typeof item !== 'object') return false;
      const value = item as Partial<CampaignAttachmentMetadata>;
      return (
        (value.type === 'jd' || value.type === 'criteria') &&
        typeof value.name === 'string' &&
        Boolean(value.name.trim()) &&
        typeof value.size === 'number' &&
        value.size >= 0
      );
    });
  } catch {
    return [];
  }
}

/** API v10 omits file metadata, so retain the successful upload metadata locally. */
export function rememberCampaignAttachments(
  campaignId: string,
  files: { jdFile?: File | null; criteriaFile?: File | null },
): CampaignAttachmentMetadata[] {
  if (typeof window === 'undefined') return [];
  const nextByType = new Map(readCampaignAttachments(campaignId).map((item) => [item.type, item]));
  if (files.jdFile) {
    nextByType.set('jd', { type: 'jd', name: files.jdFile.name, size: files.jdFile.size });
  }
  if (files.criteriaFile) {
    nextByType.set('criteria', {
      type: 'criteria',
      name: files.criteriaFile.name,
      size: files.criteriaFile.size,
    });
  }
  const next = Array.from(nextByType.values());
  try {
    window.localStorage.setItem(campaignAttachmentsStorageKey(campaignId), JSON.stringify(next));
  } catch {
    // The upload remains successful when storage is unavailable (private mode/quota).
  }
  return next;
}

/** Frontend PDF gate before POST/PUT …/files (MIME + 10MB). */
export function validateCampaignPdf(file: File): CampaignPdfErrorCode | null {
  if (!file || file.size <= 0) return 'corrupt';
  if (file.type !== CAMPAIGN_PDF_MIME) return 'notPdf';
  if (file.size > CAMPAIGN_PDF_MAX_BYTES) return 'tooLarge';
  return null;
}

/** Parse Content-Disposition filename / filename* when present. */
export function parseContentDispositionFilename(header: string | undefined): string | undefined {
  if (!header?.trim()) return undefined;
  const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return utf8[1].trim().replace(/^"|"$/g, '');
    }
  }
  const plain = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  return plain?.[2]?.trim() || undefined;
}

export function defaultCampaignDownloadName(fileType: CampaignFileType): string {
  return fileType === 'jd' ? 'campaign-jd.pdf' : 'campaign-criteria.pdf';
}

/** Trigger a browser download for a PDF blob. */
export function triggerBlobDownload(result: BlobDownloadResult, fallbackName: string): void {
  const pdfBlob =
    result.blob.type === CAMPAIGN_PDF_MIME
      ? result.blob
      : new Blob([result.blob], { type: CAMPAIGN_PDF_MIME });
  const url = URL.createObjectURL(pdfBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = result.filename?.trim() || fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
