/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CandidateCampaignListItem } from '../types/campaignCandidate.types';
import { campaignsTranslations } from '../languages/translations';

const VI = campaignsTranslations.vi as Record<string, string>;
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => VI[key] ?? key }),
}));

const { MyCampaignCard } = await import('./MyCampaignCard');

afterEach(() => cleanup());

function renderCard(overrides: Partial<CandidateCampaignListItem>) {
  const campaign: CandidateCampaignListItem = {
    campaignId: 'cmp-1',
    title: 'Backend Developer',
    membershipStatus: 'Joined',
    interviewStatus: 'NotStarted',
    ...overrides,
  };
  render(<MemoryRouter><MyCampaignCard campaign={campaign} /></MemoryRouter>);
}

const attemptsText = () => screen.getByTestId('my-campaign-attempts-text').textContent;

describe('MyCampaignCard — dòng lượt (ATT1-F3)', () => {
  it('còn lượt ⇒ "Còn x/y lượt" với x = max − used', () => {
    renderCard({ maxAttempts: 3, attemptsUsed: 1, lastAttemptAbandoned: true });
    expect(attemptsText()).toBe('Còn 2/3 lượt');
  });

  it('chưa làm lượt nào ⇒ "Còn y/y lượt"', () => {
    renderCard({ maxAttempts: 2, attemptsUsed: 0 });
    expect(attemptsText()).toBe('Còn 2/2 lượt');
  });

  it('hết lượt (used = max, NotStarted) ⇒ "Hết lượt"', () => {
    renderCard({ maxAttempts: 2, attemptsUsed: 2, lastAttemptAbandoned: true });
    expect(attemptsText()).toBe('Hết lượt');
  });

  it('đang làm dở lượt cuối ⇒ KHÔNG ghi "Hết lượt" (vẫn tiếp tục được)', () => {
    renderCard({ interviewStatus: 'InProgress', maxAttempts: 1, attemptsUsed: 1 });
    expect(attemptsText()).toBe('Còn 0/1 lượt');
  });

  it('Backend cũ (field vắng) ⇒ không có dòng lượt — không suy từ interviewStatus', () => {
    renderCard({ interviewStatus: 'NotStarted' });
    expect(screen.queryByTestId('my-campaign-attempts')).toBeNull();
  });

  it('thiếu một trong hai số ⇒ không có dòng lượt', () => {
    renderCard({ maxAttempts: 2 });
    expect(screen.queryByTestId('my-campaign-attempts')).toBeNull();
  });

  it('Completed ⇒ thẻ như trước ATT1 (không có dòng lượt)', () => {
    renderCard({ interviewStatus: 'Completed', maxAttempts: 1, attemptsUsed: 1 });
    expect(screen.queryByTestId('my-campaign-attempts')).toBeNull();
  });
});
