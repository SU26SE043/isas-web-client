/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignManagementTable } from './CampaignManagementTable';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' as const }),
}));

afterEach(() => cleanup());

function campaign(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return {
    id: 'c-1',
    title: 'Backend Dev',
    status: 'active',
    deadline: '2099-01-20T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    cvCount: 3,
    capacity: 0,
    ...overrides,
  } as EmployerCampaign;
}

/**
 * SC2 R1 — `capacity` là sentinel 0 khi `maxCandidates` chưa khai (nay tuỳ chọn), KHÔNG phải
 * "sức chứa bằng không". Bảng phải hiện "—", không phải "N/0".
 */
describe('CampaignManagementTable — hiển thị sức chứa khi maxCandidates chưa khai', () => {
  it('capacity=0 ⇒ "—" ở cả bảng desktop lẫn thẻ mobile', () => {
    render(
      <MemoryRouter>
        <CampaignManagementTable campaigns={[campaign({ capacity: 0 })]} />
      </MemoryRouter>,
    );
    const cells = screen.getAllByText('3/—');
    expect(cells.length).toBeGreaterThanOrEqual(2); // 1 desktop TableCell + 1 mobile dd
  });

  it('capacity>0 ⇒ hiện đúng con số đã khai', () => {
    render(
      <MemoryRouter>
        <CampaignManagementTable campaigns={[campaign({ capacity: 30, cvCount: 5 })]} />
      </MemoryRouter>,
    );
    const cells = screen.getAllByText('5/30');
    expect(cells.length).toBeGreaterThanOrEqual(2);
  });
});
