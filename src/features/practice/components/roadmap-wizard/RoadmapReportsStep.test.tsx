// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapReportsStep } from './RoadmapReportsStep';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key.endsWith('countBadge') ? 'count {count}' : key }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

afterEach(cleanup);

describe('RoadmapReportsStep', () => {
  it('đưa CTA chọn ngành khác về bước domain', () => {
    const goToStep = vi.fn();
    render(
      <RoadmapReportsStep
        reports={[]}
        selectedIds={[]}
        isLoading={false}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onUnselectAll={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
        goToStep={goToStep}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'practice.roadmapWizard.reports.changeDomainCta' }));
    expect(goToStep).toHaveBeenCalledWith('domain');
  });

  it('hiện đúng số buổi của domain đang chọn', () => {
    render(
      <RoadmapReportsStep
        reports={[]}
        reportCounts={{ backend: 2 }}
        selectedDomainId="backend"
        selectedIds={[]}
        isLoading={false}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onUnselectAll={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
        goToStep={vi.fn()}
      />,
    );
    expect(screen.getByText('count 2')).toBeInTheDocument();
  });
});
