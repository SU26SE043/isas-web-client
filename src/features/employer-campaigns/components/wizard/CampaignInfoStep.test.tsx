import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CampaignInfoStep } from './CampaignInfoStep';
import { employerCampaignTranslations } from '../../languages/translations';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t }) }));
const t = (key: string) => employerCampaignTranslations.vi[key] ?? key;
afterEach(cleanup);
it('F6 exposes domain exactly once and removes location input and label', () => {
  const { container } = render(<CampaignInfoStep info={{ title: 'Frontend', domain: 'frontend', maxCandidates: 25, timeLimitMinutes: 30, passScorePct: null, startsAt: '2026-09-05T10:00', expiresAt: '2026-09-06T10:00', timezone: 'Asia/Ho_Chi_Minh' }} onChange={vi.fn()} onNext={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getAllByLabelText(t('employer.campaigns.form.domain'))).toHaveLength(1);
  expect(screen.getByLabelText(t('employer.campaigns.form.domain'))).toHaveValue('frontend');
  expect(container.querySelectorAll('input[id*="location"],select[id*="location"],input[name*="location"]')).toHaveLength(0);
  expect(screen.queryByText(/Địa điểm|Location/i)).not.toBeInTheDocument();
});
