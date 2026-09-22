// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeJdStep } from './PracticeJdStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
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
});
