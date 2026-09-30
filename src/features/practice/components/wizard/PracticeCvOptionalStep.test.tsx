// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeCvOptionalStep } from './PracticeCvOptionalStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const viewerMocks = vi.hoisted(() => ({ getFileBlob: vi.fn() }));

// Hộp thoại xem PDF tải file thật qua cvAnalysisService — chặn mạng trong test.
vi.mock('@/features/cv-analysis/services/cvAnalysis.service', () => ({
  cvAnalysisService: { getFileBlob: viewerMocks.getFileBlob },
}));

const baseProps = {
  files: [],
  selectedId: null,
  isLoading: false,
  isUploading: false,
  uploadError: null,
  onSelect: vi.fn(),
  onUpload: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

const cvFile: UploadedCvFile = {
  id: 'cv-42',
  fileName: 'backend-cv.pdf',
  fileSizeBytes: 78736,
  mimeType: 'application/pdf',
  uploadedAt: '2026-09-29T13:18:37.332Z',
  pdfUrl: '',
};

beforeEach(() => {
  viewerMocks.getFileBlob.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));
  vi.stubGlobal('URL', Object.assign(URL, {
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeCvOptionalStep', () => {
  it('không dựng cảnh báo khi danh sách CV rỗng một cách hợp lệ', () => {
    render(<PracticeCvOptionalStep {...baseProps} />);

    expect(screen.queryByText('practice.setup.cv.loadError')).not.toBeInTheDocument();
    expect(screen.getByText('practice.setup.cv.noCv')).toBeInTheDocument();
  });

  it('báo lỗi tải danh sách và cho bấm tải lại', async () => {
    const onRetryLoad = vi.fn();
    render(<PracticeCvOptionalStep {...baseProps} loadError onRetryLoad={onRetryLoad} />);

    expect(screen.getByRole('alert')).toHaveTextContent('practice.setup.cv.loadError');

    await userEvent.click(screen.getByRole('button', { name: 'practice.setup.cv.retry' }));

    expect(onRetryLoad).toHaveBeenCalledOnce();
  });

  it('làm nổi bật lựa chọn hiện tại bằng trạng thái selected rõ ràng', () => {
    render(<PracticeCvOptionalStep {...baseProps} />);

    const noCvOption = screen.getByRole('button', { name: 'practice.setup.cv.noCv' });

    expect(noCvOption).toHaveAttribute('aria-pressed', 'true');
    expect(noCvOption).toHaveClass('border-2');
  });

  it('phân trang danh sách khi có hơn 5 CV', async () => {
    const files: UploadedCvFile[] = Array.from({ length: 6 }, (_, index) => ({
      id: `cv-${index + 1}`,
      fileName: `resume-${index + 1}.pdf`,
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
      uploadedAt: '2026-09-22T00:00:00.000Z',
      pdfUrl: '',
    }));

    render(<PracticeCvOptionalStep {...baseProps} files={files} />);

    expect(screen.getByRole('button', { name: 'resume-1.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'resume-5.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'resume-6.pdf' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ds.pagination.next' }));

    expect(screen.getByRole('button', { name: 'resume-6.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'resume-1.pdf' })).not.toBeInTheDocument();
  });

  it('bấm 1 lần chỉ chọn CV, không mở file', async () => {
    const onSelect = vi.fn();
    render(<PracticeCvOptionalStep {...baseProps} files={[cvFile]} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'backend-cv.pdf' }));

    expect(onSelect).toHaveBeenCalledWith('cv-42');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(viewerMocks.getFileBlob).not.toHaveBeenCalled();
  });

  it('bấm 2 lần mở đúng CV đó trong hộp thoại xem PDF', async () => {
    render(<PracticeCvOptionalStep {...baseProps} files={[cvFile]} />);

    expect(screen.getByText('practice.setup.cv.openHint')).toBeInTheDocument();
    await userEvent.dblClick(screen.getByRole('button', { name: 'backend-cv.pdf' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('backend-cv.pdf');
    expect(viewerMocks.getFileBlob).toHaveBeenCalledWith('cv-42');
  });

  it('chưa có CV nào thì không hiện gợi ý bấm đúp', () => {
    render(<PracticeCvOptionalStep {...baseProps} />);

    expect(screen.queryByText('practice.setup.cv.openHint')).not.toBeInTheDocument();
  });
});
