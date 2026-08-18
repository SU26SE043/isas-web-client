import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: mocks.get } }));
vi.mock('@/shared/api/apiError', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
  getApiStatusCode: () => undefined,
}));

import { cvAnalysisService } from './cvAnalysis.service';

describe('cvAnalysisService.getFileBlob', () => {
  beforeEach(() => mocks.get.mockReset());

  it('loads through the authenticated API client and normalizes the PDF mime type', async () => {
    mocks.get.mockResolvedValue({ data: new Blob(['pdf'], { type: 'application/octet-stream' }) });

    const blob = await cvAnalysisService.getFileBlob('file/123');

    expect(mocks.get).toHaveBeenCalledWith(
      '/api/v1/interview/files/file%2F123/download',
      { responseType: 'blob' },
    );
    expect(blob.type).toBe('application/pdf');
  });
});
