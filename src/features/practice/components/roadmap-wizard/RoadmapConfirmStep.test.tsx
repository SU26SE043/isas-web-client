// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RoadmapConfirmStep } from './RoadmapConfirmStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'en', t: (key: string) => key }),
}));

const renderStep = (overrides: Partial<React.ComponentProps<typeof RoadmapConfirmStep>> = {}) => render(
  <RoadmapConfirmStep
    domain={{ id: 'frontend', name: 'Frontend', nameVi: 'Frontend', description: '', descriptionVi: '' }}
    name="My roadmap"
    focus=""
    selectedReports={[]}
    scope="Quick"
    onScopeChange={vi.fn()}
    isSubmitting={false}
    onBack={vi.fn()}
    onConfirm={vi.fn()}
    {...overrides}
  />,
);

afterEach(cleanup);

describe('RoadmapConfirmStep', () => {
  it('hiện tóm tắt domain, focus và số buổi đã chọn', () => {
    renderStep({ focus: 'system design' });
    expect(screen.getByText('practice.roadmapWizard.confirm.domain')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('system design')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.confirm.count')).toBeInTheDocument();
  });

  it('nút tạo bật khi có domain dù không có currentLevel', () => {
    renderStep();
    expect(screen.getByRole('button', { name: 'practice.roadmapWizard.confirm.create' })).toBeEnabled();
    expect(screen.queryByText('practice.roadmapWizard.confirm.currentLevel')).not.toBeInTheDocument();
  });
});
