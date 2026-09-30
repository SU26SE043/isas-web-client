import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { post: mocks.post, get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/shared/api/apiError', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
  getApiStatusCode: () => undefined,
}));

import { practiceSetupService } from './practiceSetup.service';

// Nguyên văn hình dạng `UploadFileResponse` mà InterviewService trả (đo trên prod
// 2026-09-29): tên trường KHÁC tên trường của thẻ CV trong wizard.
const serverResponse = {
  fileId: '9cb029fb-73ec-4799-a0ce-94d6c38d35f2',
  fileType: 'cv',
  originalName: 'backend-developer-cv.pdf',
  mimeType: 'application/pdf',
  fileSize: 78736,
  parsedStatus: 'completed',
  createdAt: '2026-09-29T13:18:37.332059Z',
};

const pdf = () => new File(['%PDF-1.4'], 'local-name.pdf', { type: 'application/pdf' });

describe('practiceSetupService.uploadCv', () => {
  beforeEach(() => mocks.post.mockReset());

  it('chuyển response upload thật sang thẻ CV — có id, tên, dung lượng, ngày', async () => {
    mocks.post.mockResolvedValue({ data: serverResponse });

    const card = await practiceSetupService.uploadCv(pdf());

    expect(mocks.post).toHaveBeenCalledWith(
      '/api/v1/interview/files/upload?fileType=cv',
      expect.any(FormData),
      expect.anything(),
    );
    // id undefined ⇒ wizard gửi cvId null ⇒ buổi luyện lặng lẽ KHÔNG có CV.
    expect(card.id).toBe(serverResponse.fileId);
    expect(card.fileName).toBe('backend-developer-cv.pdf');
    expect(card.fileSizeBytes).toBe(78736);
    expect(card.uploadedAt).toBe(serverResponse.createdAt);
    expect(Number.isNaN(Date.parse(card.uploadedAt))).toBe(false);
  });

  it('response thiếu id thì báo lỗi, không trả thẻ có id undefined', async () => {
    const { fileId: _dropped, ...withoutId } = serverResponse;
    mocks.post.mockResolvedValue({ data: withoutId });

    await expect(practiceSetupService.uploadCv(pdf())).rejects.toThrow();
  });
});
