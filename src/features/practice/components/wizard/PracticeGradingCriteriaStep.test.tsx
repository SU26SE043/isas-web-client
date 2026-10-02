// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeGradingCriteriaStep } from './PracticeGradingCriteriaStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => ({
    'practice.setup.gradingCriteria.source': 'Buổi này chấm theo:',
    'practice.setup.gradingCriteria.default': 'Bộ tiêu chí chuẩn',
    'practice.setup.gradingCriteria.custom': 'Bộ tiêu chí của bạn',
    'practice.setup.gradingCriteria.edit': 'Chỉnh tiêu chí của tôi →',
    'practice.setup.gradingCriteria.names': 'Xem tên các tiêu chí',
    'practice.setup.gradingCriteria.count': '{count} tiêu chí',
    'practice.setup.gradingCriteria.language.vi': 'Tiếng Việt',
    'rubrics.domain.FE': 'Frontend',
  } as Record<string, string>)[key] ?? key }),
}));

const criteria = [
  { id: 'c-1', name: 'Kiến thức nền tảng', description: '', weight: 60, maxScore: 5 },
  { id: 'c-2', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5 },
];

function renderStep(overrides: Partial<ComponentProps<typeof PracticeGradingCriteriaStep>> = {}) {
  const props: ComponentProps<typeof PracticeGradingCriteriaStep> = {
    jobCategory: 'FE', criteria, isCustom: false, language: 'vi', isLoading: false,
    isError: false, onEdit: vi.fn(), onRetry: vi.fn(), onBack: vi.fn(), onNext: vi.fn(),
    ...overrides,
  };
  return render(<PracticeGradingCriteriaStep {...props} />);
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('PracticeGradingCriteriaStep', () => {
  it('shows source, category, language and compact names without selection checkboxes', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderStep({ isCustom: true, onEdit });
    expect(screen.getByText('Bộ tiêu chí của bạn')).toBeInTheDocument();
    expect(screen.getByText(/Frontend · Tiếng Việt · 2 tiêu chí/)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.click(screen.getByText('Xem tên các tiêu chí'));
    expect(screen.getByText('Kiến thức nền tảng')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Chỉnh tiêu chí của tôi →' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('disables editing while an upload is in progress', () => {
    renderStep({ editDisabled: true });
    expect(screen.getByRole('button', { name: 'Chỉnh tiêu chí của tôi →' })).toBeDisabled();
  });
});
