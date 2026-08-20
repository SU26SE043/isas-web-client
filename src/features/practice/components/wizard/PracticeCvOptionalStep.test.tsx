// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeCvOptionalStep } from './PracticeCvOptionalStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
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
});
