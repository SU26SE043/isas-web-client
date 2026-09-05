import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampaignJobNeedsCard } from './CampaignJobNeedsCard';
import { campaignManagementService } from '../services/campaignManagement.service';
import { employerCampaignTranslations } from '../languages/translations';
import { mapCampaignResponseToEmployerCampaign } from '../utils/campaignMapper';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t }) }));
vi.mock('../services/campaignManagement.service', () => ({ campaignManagementService: { updateCampaignJobNeeds: vi.fn(), getErrorStatus: vi.fn() } }));
const t = (key: string) => employerCampaignTranslations.vi[key] ?? key;
const need = { needId: 'need-1', category: 'Technical', text: 'React', isMustHave: true };
const campaign = mapCampaignResponseToEmployerCampaign({ id: 'c4', title: 'Frontend', status: 'Draft', jobNeeds: [need] });
const show = (editable = true) => render(<CampaignJobNeedsCard campaignId="c4" initialNeeds={[need]} editable={editable} />);
beforeEach(() => { vi.clearAllMocks(); vi.mocked(campaignManagementService.updateCampaignJobNeeds).mockResolvedValue(campaign); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('F4 job needs editor', () => {
  it('starts a new need with unchecked mandatory checkbox and sends false', async () => {
    show();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' TypeScript ' } });
    fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.add') }));
    await waitFor(() => expect(campaignManagementService.updateCampaignJobNeeds).toHaveBeenCalledWith('c4', [need, expect.objectContaining({ text: 'TypeScript', isMustHave: false, category: 'Technical' })]));
  });
  it('persists an explicitly mandatory need in its selected category', async () => {
    show();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Teamwork' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'WorkStyle' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.add') }));
    await waitFor(() => expect(campaignManagementService.updateCampaignJobNeeds).toHaveBeenCalledWith('c4', [need, expect.objectContaining({ text: 'Teamwork', isMustHave: true, category: 'WorkStyle' })]));
  });
  it('cancelled deletion asks confirmation and leaves need and server unchanged', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    show(); fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.remove') }));
    expect(confirm).toHaveBeenCalledWith(t('employer.campaigns.jobNeeds.removeConfirm'));
    expect(screen.getByText('React')).toBeVisible();
    expect(campaignManagementService.updateCampaignJobNeeds).not.toHaveBeenCalled();
  });
  it('confirmed deletion removes the selected need and sends remaining list', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(campaignManagementService.updateCampaignJobNeeds).mockResolvedValue({ ...campaign, jobNeeds: [] });
    show(); fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.remove') }));
    await waitFor(() => expect(screen.queryByText('React')).not.toBeInTheDocument());
    expect(campaignManagementService.updateCampaignJobNeeds).toHaveBeenCalledExactlyOnceWith('c4', []);
  });
  it('read-only campaigns show reason and no editing controls', () => {
    show(false);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText(t('employer.campaigns.jobNeeds.locked').replace('{{count}}', '1'))).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('409 locks further edits with an explanation while preserving existing needs', async () => {
    vi.mocked(campaignManagementService.getErrorStatus).mockReturnValue(409);
    vi.mocked(campaignManagementService.updateCampaignJobNeeds).mockRejectedValue(new Error('locked'));
    show(); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'TypeScript' } });
    fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.add') }));
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText(t('employer.campaigns.jobNeeds.locked').replace('{{count}}', '1'))).toBeVisible();
  });
  it('blank new need cannot be submitted', () => {
    show(); fireEvent.change(screen.getByRole('textbox'), { target: { value: '  ' } });
    expect(screen.getByRole('button', { name: t('employer.campaigns.jobNeeds.add') })).toBeDisabled();
    expect(campaignManagementService.updateCampaignJobNeeds).not.toHaveBeenCalled();
  });
});
