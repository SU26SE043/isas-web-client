// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeJdStep } from './PracticeJdStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const viewerMocks = vi.hoisted(() => ({ getFileBlob: vi.fn() }));

// Hộp thoại xem PDF tải file thật qua cvAnalysisService — chặn mạng trong test.
vi.mock('@/features/cv-analysis/services/cvAnalysis.service', () => ({
  cvAnalysisService: { getFileBlob: viewerMocks.getFileBlob },
}));

const baseProps = {
  tab: 'file' as const,
  onTabChange: vi.fn(),
  files: [],
  selectedJdId: null,
  jdText: '',
  isLoading: false,
  textTooLong: false,
  onSelectJd: vi.fn(),
  onJdTextChange: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

function makeJd(index: number): FileRecord {
  return {
    id: `jd-${index}`,
    fileType: 'jd',
    originalName: `job-description-${index}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 1024,
    parsedStatus: 'completed',
    createdAt: '2026-09-22T00:00:00.000Z',
  };
}

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

describe('PracticeJdStep', () => {
  it('phân trang danh sách khi có hơn 5 JD', async () => {
    render(<PracticeJdStep {...baseProps} files={Array.from({ length: 6 }, (_, index) => makeJd(index + 1))} />);

    expect(screen.getByRole('button', { name: 'job-description-1.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'job-description-5.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'job-description-6.pdf' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ds.pagination.next' }));

    expect(screen.getByRole('button', { name: 'job-description-6.pdf' })).toBeInTheDocument();
  });

  it('bấm 1 lần chỉ chọn JD, không mở file', async () => {
    const onSelectJd = vi.fn();
    render(<PracticeJdStep {...baseProps} files={[makeJd(7)]} onSelectJd={onSelectJd} />);

    await userEvent.click(screen.getByRole('button', { name: 'job-description-7.pdf' }));

    expect(onSelectJd).toHaveBeenCalledWith('jd-7');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('bấm 2 lần mở đúng JD đó trong hộp thoại xem PDF', async () => {
    render(<PracticeJdStep {...baseProps} files={[makeJd(7)]} />);

    expect(screen.getByText('practice.setup.jd.openHint')).toBeInTheDocument();
    await userEvent.dblClick(screen.getByRole('button', { name: 'job-description-7.pdf' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('job-description-7.pdf');
    expect(viewerMocks.getFileBlob).toHaveBeenCalledWith('jd-7');
  });
});
