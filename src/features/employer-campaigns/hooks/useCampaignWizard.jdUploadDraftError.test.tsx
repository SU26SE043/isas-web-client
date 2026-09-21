import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { useCampaignWizard } from './useCampaignWizard';

/**
 * Tải JD ở bước 2 là lần ĐẦU bản nháp được tạo (`ensureDraft` → POST /campaign). Đo trên prod 21/09:
 * POST 400 "StartsAt cannot be in the past." nhưng ô tệp báo *"Không thể kết nối máy chủ hoặc hệ thống
 * xử lý file thất bại"* — HR đi tìm lỗi mạng trong khi lỗi ở bước 1. Các ca dưới khoá: lỗi pha tạo
 * nháp phải (a) nói đúng lời, (b) đưa HR về đúng bước, (c) KHÔNG gọi tải tệp; lỗi pha tải tệp thì giữ
 * nguyên lời server thay câu chung.
 */
function apiError(status: number, data: unknown) {
  const error = new axios.AxiosError('Request failed');
  error.response = { status, statusText: 'x', headers: {}, config: {} as never, data };
  return error;
}

function campaignResponse(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return {
    id: 'c-1',
    title: 'Backend Dev',
    domain: 'Backend',
    status: 'draft',
    jobDescription: 'JD dài đủ',
    rubric: [],
    questions: [],
    invitedEmails: [],
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
    locale: 'vi',
    ...overrides,
  } as unknown as EmployerCampaign;
}

function makeHandlers() {
  return {
    onCreateCampaign: vi.fn(async () => campaignResponse()),
    onUpdateCampaign: vi.fn(async () => campaignResponse()),
    onUpdateQuestions: vi.fn(async () => campaignResponse()),
    onGenerateQuestions: vi.fn(),
    onImportQuestions: vi.fn(),
    onUploadFiles: vi.fn(async () => campaignResponse({ jobDescription: 'BACKEND DEVELOPER (PHP)' })),
    onReplaceFiles: vi.fn(),
    onDownloadFile: vi.fn(),
    onAfterSubmit: vi.fn(),
    onDeployCampaign: vi.fn(),
    onSendInvitations: vi.fn(),
  };
}
type Handlers = ReturnType<typeof makeHandlers>;

const pdf = () => new File([new Uint8Array(1024)], 'jd.pdf', { type: 'application/pdf' });

async function renderAtJdStep(handlers: Handlers) {
  const hook = renderHook(() => useCampaignWizard({ mode: 'create', ...handlers }));
  act(() => {
    hook.result.current.patchInfo({ title: 'Backend Dev', domain: 'backend', language: 'vi' });
  });
  // Đi qua "Tiếp tục" thật (goToStep từ chối bước chưa hoàn thành) — và khẳng định đã ở bước 2,
  // để phép "về bước 1 khi lỗi" không xanh vì chưa bao giờ rời bước 1.
  await act(async () => { await hook.result.current.goNext(); });
  expect(hook.result.current.step).toBe(1);
  return hook;
}

let handlers: Handlers;
beforeEach(() => { handlers = makeHandlers(); });
afterEach(() => cleanup());

describe('tải JD khi tạo nháp THẤT BẠI (pha ensureDraft)', () => {
  it('400 "StartsAt cannot be in the past" ⇒ câu dịch đúng, về bước 1, ô tệp = draftFailed + cùng lời, KHÔNG tải tệp', async () => {
    handlers.onCreateCampaign.mockRejectedValueOnce(apiError(400, 'StartsAt cannot be in the past.'));
    const { result } = await renderAtJdStep(handlers);

    await act(async () => { result.current.selectJdFile(pdf()); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('failed'));

    expect(handlers.onUploadFiles).not.toHaveBeenCalled();
    expect(result.current.state.jd.fileError).toBe('draftFailed');
    expect(result.current.state.jd.fileErrorDetail).toBe('employer.campaigns.wizard.startsAtInPast');
    expect(result.current.stepError).toBe('employer.campaigns.wizard.startsAtInPast');
    expect(result.current.step).toBe(0);
    expect(result.current.state.errorSteps).toContain(0);
    expect(result.current.campaignId).toBeNull();
  });

  it('400 plain-text KHÔNG có bước tương ứng ⇒ vẫn giữ nguyên lời server, KHÔNG dán "không kết nối được"', async () => {
    handlers.onCreateCampaign.mockRejectedValueOnce(apiError(400, 'Tổ chức đã vượt trần chiến dịch đang mở.'));
    const { result } = await renderAtJdStep(handlers);

    await act(async () => { result.current.selectJdFile(pdf()); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('failed'));

    expect(result.current.state.jd.fileError).toBe('draftFailed');
    expect(result.current.state.jd.fileErrorDetail).toBe('Tổ chức đã vượt trần chiến dịch đang mở.');
    expect(result.current.stepError).toBe('Tổ chức đã vượt trần chiến dịch đang mở.');
    expect(handlers.onUploadFiles).not.toHaveBeenCalled();
  });

  it('Thử lại sau khi sửa giờ ⇒ tạo nháp lại, tải tệp, trạng thái uploaded và xoá lỗi cũ', async () => {
    handlers.onCreateCampaign
      .mockRejectedValueOnce(apiError(400, 'StartsAt cannot be in the past.'))
      .mockResolvedValueOnce(campaignResponse());
    const { result } = await renderAtJdStep(handlers);

    await act(async () => { result.current.selectJdFile(pdf()); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('failed'));

    await act(async () => { result.current.retryJdUpload(); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('uploaded'));

    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(2);
    expect(handlers.onUploadFiles).toHaveBeenCalledTimes(1);
    expect(handlers.onUploadFiles).toHaveBeenCalledWith('c-1', expect.objectContaining({ jdFile: expect.any(File) }));
    expect(result.current.state.jd.fileError).toBeNull();
    expect(result.current.state.jd.fileErrorDetail).toBeNull();
    expect(result.current.stepError).toBeNull();
    expect(result.current.campaignId).toBe('c-1');
  });
});

describe('tải JD khi TẢI TỆP thất bại (nháp đã tạo)', () => {
  it('500 có lời server ⇒ fileError=server nhưng detail = nguyên lời server', async () => {
    handlers.onUploadFiles.mockRejectedValueOnce(apiError(500, 'Failed to upload files: S3 timeout'));
    const { result } = await renderAtJdStep(handlers);

    await act(async () => { result.current.selectJdFile(pdf()); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('failed'));

    expect(result.current.state.jd.fileError).toBe('server');
    expect(result.current.state.jd.fileErrorDetail).toBe('Failed to upload files: S3 timeout');
    expect(result.current.step).toBe(1);   // lỗi tải tệp KHÔNG đá về bước 1
    expect(result.current.campaignId).toBe('c-1');
  });

  it('400 nói về pdf ⇒ mã notPdf, không kèm detail (câu dịch sẵn đã đủ)', async () => {
    handlers.onUploadFiles.mockRejectedValueOnce(apiError(400, 'JD file must be a PDF.'));
    const { result } = await renderAtJdStep(handlers);

    await act(async () => { result.current.selectJdFile(pdf()); });
    await waitFor(() => expect(result.current.state.jd.fileStatus).toBe('failed'));

    expect(result.current.state.jd.fileError).toBe('notPdf');
    expect(result.current.state.jd.fileErrorDetail).toBeNull();
  });
});
