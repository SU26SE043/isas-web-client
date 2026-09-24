// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeGradingCriteriaStep } from './PracticeGradingCriteriaStep';

const messages: Record<string, string> = {
  'practice.setup.gradingCriteria.title': 'Tiêu chí chấm điểm',
  'practice.setup.gradingCriteria.description': 'Chọn các tiêu chí dùng để chấm điểm.',
  'practice.setup.gradingCriteria.domainLabel': 'Nhóm nghề đang áp dụng',
  'practice.setup.gradingCriteria.noDomain': 'Vui lòng chọn lĩnh vực ở Step 1 trước khi thiết lập tiêu chí chấm điểm.',
  'practice.setup.gradingCriteria.backToDomain': 'Quay lại chọn lĩnh vực',
  'practice.setup.gradingCriteria.selectedCount': 'Đã chọn {count} tiêu chí',
  'practice.setup.gradingCriteria.validation.required': 'Hãy chọn ít nhất một tiêu chí.',
  'practice.setup.gradingCriteria.loading': 'Đang tải tiêu chí chấm điểm',
  'practice.setup.gradingCriteria.loadError': 'Không thể tải tiêu chí chấm điểm.',
  'practice.setup.gradingCriteria.retry': 'Thử lại',
  'practice.setup.gradingCriteria.empty': 'Chưa có tiêu chí chấm điểm.',
  'practice.setup.nav.back': 'Quay lại',
  'practice.setup.nav.next': 'Tiếp tục',
  'rubrics.domain.FE': 'Frontend',
  'rubrics.list.title': 'Tiêu chí chấm điểm',
  'rubrics.selection.selectedCount': '{selected}/{total} tiêu chí đã chọn',
  'rubrics.criterion.select': 'Chọn tiêu chí',
  'rubrics.criterion.name': 'Tên tiêu chí',
  'rubrics.criterion.description': 'Mô tả',
  'rubrics.criterion.weight': 'Trọng số',
  'rubrics.criterion.maxScore': 'Điểm tối đa',
  'rubrics.empty.title': 'Chưa có tiêu chí',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => messages[key] ?? key }),
}));

const criteria = [
  { id: 'c-1', name: 'Kiến thức nền tảng', description: 'Nắm vững kiến thức.', weight: 60, maxScore: 10 },
  { id: 'c-2', name: 'Giao tiếp', description: 'Trình bày rõ ràng.', weight: 40, maxScore: 10 },
];

function renderStep(overrides: Partial<ComponentProps<typeof PracticeGradingCriteriaStep>> = {}) {
  const props: ComponentProps<typeof PracticeGradingCriteriaStep> = {
    jobCategory: 'FE',
    criteria,
    selectedIds: ['c-1'],
    isLoading: false,
    isError: false,
    onSelect: vi.fn(),
    onRetry: vi.fn(),
    onBack: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  };
  return render(<PracticeGradingCriteriaStep {...props} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeGradingCriteriaStep', () => {
  it('shows the selected domain and uses the shared rubric table for selection', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderStep({ onSelect });

    expect(screen.getByText('Nhóm nghề đang áp dụng')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Kiến thức nền tảng')).toBeInTheDocument();
    expect(screen.getByText('Đã chọn 1 tiêu chí')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Chọn tiêu chí: Giao tiếp' }));

    expect(onSelect).toHaveBeenCalledWith(['c-1', 'c-2']);
  });

  it('asks the user to choose a domain before showing criteria', async () => {
    const user = userEvent.setup();
    const onBackToDomain = vi.fn();

    renderStep({ jobCategory: null, criteria: [], selectedIds: [], onBackToDomain });

    expect(screen.getByText('Vui lòng chọn lĩnh vực ở Step 1 trước khi thiết lập tiêu chí chấm điểm.'))
      .toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quay lại chọn lĩnh vực' }));

    expect(onBackToDomain).toHaveBeenCalledOnce();
  });
});
