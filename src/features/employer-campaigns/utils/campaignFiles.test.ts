import { describe, expect, it } from 'vitest';
import {
  parseContentDispositionFilename,
  validateCampaignPdf,
} from './campaignFiles';

describe('campaignFiles', () => {
  it('rejects non-PDF MIME even with .pdf name', () => {
    const file = new File(['%PDF'], 'doc.pdf', { type: 'text/plain' });
    expect(validateCampaignPdf(file)).toBe('notPdf');
  });

  it('accepts application/pdf under 10MB', () => {
    const file = new File(['%PDF-1.4'], 'jd.pdf', { type: 'application/pdf' });
    expect(validateCampaignPdf(file)).toBeNull();
  });

  it('rejects empty and oversized files', () => {
    const empty = new File([], 'empty.pdf', { type: 'application/pdf' });
    expect(validateCampaignPdf(empty)).toBe('corrupt');

    const bytes = new Uint8Array(10 * 1024 * 1024 + 1);
    const huge = new File([bytes], 'huge.pdf', { type: 'application/pdf' });
    expect(validateCampaignPdf(huge)).toBe('tooLarge');
  });

  it('parses Content-Disposition filenames', () => {
    expect(parseContentDispositionFilename('attachment; filename="report.pdf"')).toBe(
      'report.pdf',
    );
    expect(
      parseContentDispositionFilename("attachment; filename*=UTF-8''my%20jd.pdf"),
    ).toBe('my jd.pdf');
  });
});
