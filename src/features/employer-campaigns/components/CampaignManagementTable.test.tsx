import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignManagementTable } from './CampaignManagementTable';
import { employerCampaignTranslations } from '../languages/translations';
import { mapCampaignResponseToEmployerCampaign } from '../utils/campaignMapper';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ language: 'vi', t }) }));
const t = (key: string) => employerCampaignTranslations.vi[key] ?? key;
function show(capacity = 25) {
  const campaign = mapCampaignResponseToEmployerCampaign({ id: 'c8', title: 'Frontend', status: 'Active', cvCount: 3, invitedCount: 2, completedCount: 1, maxCandidates: capacity, updatedAt: '2026-09-01', expiresAt: '2026-10-01' });
  render(<MemoryRouter><CampaignManagementTable campaigns={[{ ...campaign, capacity, applicants: 99 }]} /></MemoryRouter>);
}
afterEach(cleanup);
describe('F8 list count columns', () => {
  it('matches each desktop header to its distinct API count, not applicants', () => {
    show(); const table = screen.getByRole('table');
    const headers = within(table).getAllByRole('columnheader').map((head) => head.textContent);
    const cells = within(within(table).getAllByRole('row')[1]).getAllByRole('cell');
    [['cvCount', '3 / 25'], ['invitedCount', '2'], ['completedCount', '1']].forEach(([key, value]) => {
      expect(cells[headers.indexOf(t(`employer.campaigns.list.${key}`))]).toHaveTextContent(new RegExp(`^${value}$`));
    });
    expect(table).not.toHaveTextContent('99');
  });
  it('keeps the same three labeled counts on the mobile card', () => {
    show(); const card = screen.getByRole('article');
    [['cvCount', '3 / 25'], ['invitedCount', '2'], ['completedCount', '1']].forEach(([key, value]) => {
      expect(within(card).getByText(t(`employer.campaigns.list.${key}`)).nextElementSibling).toHaveTextContent(new RegExp(`^${value}$`));
    });
  });
  it('does not display a capacity fraction for unlimited campaigns', () => {
    show(0); expect(screen.queryByText('3 / 0')).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByRole('cell', { name: '3' })).toBeInTheDocument();
  });
  it('retains the view/report destination and invitation action', () => {
    show(); const table = screen.getByRole('table');
    expect(within(table).getByRole('link', { name: t('employer.campaigns.list.view') })).toHaveAttribute('href', '/employer/campaigns/c8/overview?tab=candidates');
    expect(within(table).getByRole('link', { name: t('employer.campaigns.list.invite') })).toHaveAttribute('href', '/employer/campaigns/c8/invitations?tab=cv-screening');
  });
});
