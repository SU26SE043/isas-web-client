export const CAMPAIGN_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const CAMPAIGN_PDF_MIME = 'application/pdf';

export type CampaignFileType = 'jd' | 'criteria';

export type CampaignPdfErrorCode = 'notPdf' | 'tooLarge' | 'corrupt';

export type BlobDownloadResult = {
  blob: Blob;
  filename?: string;
};

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
