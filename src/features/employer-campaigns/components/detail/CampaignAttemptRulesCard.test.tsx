/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign, EmployerCampaignStatus } from '../../types/campaignManagement.types';

const WITH_N = new Set([
  'employer.campaigns.detail.attemptRules.attemptsValueOne',
  'employer.campaigns.detail.attemptRules.attemptsValueMany',
]);
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => (WITH_N.has(key) ? `${key}:{{n}}` : key), language: 'vi' }),
}));

const { CampaignAttemptRulesCard } = await import('./CampaignAttemptRulesCard');

const K = 'employer.campaigns.detail.attemptRules';

afterEach(cleanup);

function campaign(status: EmployerCampaignStatus, maxAttempts?: number): EmployerCampaign {
  return {
    id: 'cmp-1',
    title: 'Backend Developer',
    status,
    durationMinutes: 30,
    ...(maxAttempts === undefined ? {} : { maxAttempts }),
  } as unknown as EmployerCampaign;
}

function renderCard(value: EmployerCampaign) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CampaignAttemptRulesCard campaign={value} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const increaseButton = () => screen.queryByRole('button', { name: `${K}.increase` });
const editLink = () => screen.queryByRole('link', { name: `${K}.editInStep5` });

describe('CampaignAttemptRulesCard — Draft', () => {
  it('có link "Sửa ở bước 5" tới /edit?step=5, KHÔNG có nút Tăng, KHÔNG ghi "khoá"', () => {
    renderCard(campaign('draft', 1));
    expect(editLink()).toHaveAttribute('href', '/employer/campaigns/cmp-1/edit?step=5');
    expect(increaseButton()).not.toBeInTheDocument();
    expect(screen.queryByTestId('attempt-rules-duration-locked')).not.toBeInTheDocument();
    expect(screen.getByTestId('attempt-rules-duration')).toHaveTextContent('30 employer.campaigns.detail.minutes');
    expect(screen.getByTestId('attempt-rules-attempts')).toHaveTextContent(`${K}.attemptsValueOne:1`);
  });
});

describe('CampaignAttemptRulesCard — Active', () => {
  it('max 1 ⇒ có nút "Tăng số lần", thời lượng ghi "(khoá sau khi triển khai)", KHÔNG có link sửa', () => {
    renderCard(campaign('active', 1));
    expect(increaseButton()).toBeInTheDocument();
    expect(screen.getByTestId('attempt-rules-duration-locked')).toHaveTextContent(`${K}.durationLocked`);
    expect(editLink()).not.toBeInTheDocument();
    // Không có đường sửa thời lượng khi đã triển khai [C3]: nút DUY NHẤT trên thẻ là "Tăng số lần".
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('maxAttempts vắng (Backend cũ) ⇒ coi là 1, vẫn có nút', () => {
    renderCard(campaign('active'));
    expect(screen.getByTestId('attempt-rules-attempts')).toHaveTextContent(`${K}.attemptsValueOne:1`);
    expect(increaseButton()).toBeInTheDocument();
  });

  it('max 2 ⇒ vẫn có nút (số nhiều)', () => {
    renderCard(campaign('active', 2));
    expect(screen.getByTestId('attempt-rules-attempts')).toHaveTextContent(`${K}.attemptsValueMany:2`);
    expect(increaseButton()).toBeInTheDocument();
  });

  it('max 3 ⇒ KHÔNG có nút Tăng', () => {
    renderCard(campaign('active', 3));
    expect(screen.getByTestId('attempt-rules-attempts')).toHaveTextContent(`${K}.attemptsValueMany:3`);
    expect(increaseButton()).not.toBeInTheDocument();
  });
});

describe('CampaignAttemptRulesCard — Closed / Archived chỉ hiển thị', () => {
  it.each(['closed', 'archived'] as const)('%s ⇒ không nút, không link, vẫn ghi "khoá"', (status) => {
    renderCard(campaign(status, 1));
    expect(increaseButton()).not.toBeInTheDocument();
    expect(editLink()).not.toBeInTheDocument();
    expect(screen.getByTestId('attempt-rules-duration-locked')).toBeInTheDocument();
    expect(screen.getByTestId('attempt-rules-attempts')).toHaveTextContent(`${K}.attemptsValueOne:1`);
  });
});
