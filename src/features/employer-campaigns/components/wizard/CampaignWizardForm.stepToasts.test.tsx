/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import type { ComponentProps, ReactNode } from 'react';
import { act, cleanup, render, renderHook } from '@testing-library/react';
import toast, { useToasterStore } from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hook nặng + shell + nội dung bước được thay bằng bản giả: bài kiểm này chỉ đo
// việc dọn toast khi đổi bước, không đo wizard.
let mockStep = 0;
vi.mock('../../hooks/useCampaignWizard', () => ({
  useCampaignWizard: () => ({
    state: { info: { title: 'x' }, autosaveStatus: 'saved', lastSavedAt: null, currentStep: mockStep },
    step: mockStep,
    errorSteps: [],
    completedSteps: [],
    goToStep: vi.fn(),
  }),
}));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('./CampaignWizardShell', () => ({
  CampaignWizardShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./CampaignWizardStepContent', () => ({ CampaignWizardStepContent: () => <div>content</div> }));

const { CampaignWizardForm, useDismissStepSuccessToasts } = await import('./CampaignWizardForm');

function visibleToastTypes() {
  const { result } = renderHook(() => useToasterStore());
  return result.current.toasts.filter((item) => item.visible).map((item) => item.type);
}

beforeEach(() => {
  mockStep = 0;
  act(() => {
    toast.remove();
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('dọn toast của bước vừa rời', () => {
  it('đổi bước thì dọn toast thành công đang nổi', () => {
    const dismiss = vi.spyOn(toast, 'dismiss');
    const { rerender } = renderHook(({ step }) => useDismissStepSuccessToasts(step), {
      initialProps: { step: 1 },
    });

    let id = '';
    act(() => {
      id = toast.success('Questions appended to the bank.');
    });
    expect(dismiss).not.toHaveBeenCalled();

    act(() => {
      rerender({ step: 2 });
    });

    expect(dismiss).toHaveBeenCalledWith(id);
    expect(visibleToastTypes()).toEqual([]);
  });

  // Đối chứng: không có phép này thì bài trên cũng xanh với một hook dọn sạch mọi
  // lúc, và như thế nó không đo được cái gì.
  it('lần render đầu chưa đổi bước thì KHÔNG dọn', () => {
    const dismiss = vi.spyOn(toast, 'dismiss');
    act(() => {
      toast.success('File uploaded successfully.');
    });

    renderHook(() => useDismissStepSuccessToasts(1));

    expect(dismiss).not.toHaveBeenCalled();
    expect(visibleToastTypes()).toEqual(['success']);
  });

  it('render lại ở CÙNG một bước thì KHÔNG dọn', () => {
    const dismiss = vi.spyOn(toast, 'dismiss');
    const { rerender } = renderHook(({ step }) => useDismissStepSuccessToasts(step), {
      initialProps: { step: 3 },
    });
    act(() => {
      toast.success('File uploaded successfully.');
    });

    act(() => {
      rerender({ step: 3 });
    });

    expect(dismiss).not.toHaveBeenCalled();
    expect(visibleToastTypes()).toEqual(['success']);
  });

  // Đối chứng quan trọng nhất: `toast.dismiss()` không tham số sẽ nuốt cả toast lỗi
  // mà react-query bắn ra từ nền (useEmployerCampaigns.ts:122).
  it('KHÔNG dọn toast lỗi khi đổi bước', () => {
    const { rerender } = renderHook(({ step }) => useDismissStepSuccessToasts(step), {
      initialProps: { step: 1 },
    });
    act(() => {
      toast.error('employer.campaigns.detail.errorToast');
      toast.success('Questions appended to the bank.');
    });

    act(() => {
      rerender({ step: 2 });
    });

    expect(visibleToastTypes()).toEqual(['error']);
  });
});

describe('khe nối: wizard thật có gọi việc dọn', () => {
  // Không có phép này thì gỡ hẳn lời gọi hook khỏi component vẫn xanh.
  it('CampaignWizardForm dọn toast thành công khi bước đổi', () => {
    // Mọi handler đều không được dùng tới: hook wizard đã bị thay bằng bản giả.
    const props = { mode: 'create' } as unknown as ComponentProps<typeof CampaignWizardForm>;
    const { rerender } = render(<CampaignWizardForm {...props} />);

    act(() => {
      toast.success('File uploaded successfully.');
    });
    expect(visibleToastTypes()).toEqual(['success']);

    mockStep = 1;
    act(() => {
      rerender(<CampaignWizardForm {...props} />);
    });

    expect(visibleToastTypes()).toEqual([]);
  });
});
