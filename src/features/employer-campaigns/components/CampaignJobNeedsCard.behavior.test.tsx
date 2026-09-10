/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampaignRequestError, campaignManagementService } from '../services/campaignManagement.service';
import type { CampaignJobNeed } from '../types/campaign.api.types';
import { CampaignJobNeedsCard } from './CampaignJobNeedsCard';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const need = (text: string, needId = text): CampaignJobNeed => ({ needId, category: 'Technical', text });
const updatedCampaign = { jobNeeds: [] } as never;

beforeEach(() => {
  vi.spyOn(campaignManagementService, 'updateCampaignJobNeeds').mockResolvedValue(updatedCampaign);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('CampaignJobNeedsCard persistence', () => {
  it('sends the complete existing list when adding a fourth need', async () => {
    const update = vi.mocked(campaignManagementService.updateCampaignJobNeeds);
    render(<CampaignJobNeedsCard campaignId="campaign-1" initialNeeds={[need('A'), need('B'), need('C')]} editable />);

    fireEvent.change(screen.getByPlaceholderText('employer.campaigns.jobNeeds.placeholder'), { target: { value: 'D' } });
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.jobNeeds.add' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    expect(update.mock.calls[0]?.[1]).toHaveLength(4);
    expect(update.mock.calls[0]?.[1].map((item) => item.text)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('keeps the original list when a delete request returns 409', async () => {
    vi.mocked(campaignManagementService.updateCampaignJobNeeds).mockRejectedValueOnce(
      new CampaignRequestError(409, 'screened candidates exist'),
    );
    render(<CampaignJobNeedsCard campaignId="campaign-1" initialNeeds={[need('A'), need('B')]} editable />);

    fireEvent.click(screen.getAllByRole('button', { name: 'employer.campaigns.jobNeeds.remove' })[0]);

    await waitFor(() => expect(screen.getByText('employer.campaigns.jobNeeds.locked')).toBeInTheDocument());
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('keeps draft text after a failed add request', async () => {
    vi.mocked(campaignManagementService.updateCampaignJobNeeds).mockRejectedValueOnce(new Error('network'));
    render(<CampaignJobNeedsCard campaignId="campaign-1" initialNeeds={[need('A')]} editable />);

    const input = screen.getByPlaceholderText('employer.campaigns.jobNeeds.placeholder');
    fireEvent.change(input, { target: { value: 'unfinished need' } });
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.jobNeeds.add' }));

    await waitFor(() => expect(screen.getByText('employer.campaigns.jobNeeds.saveError')).toBeInTheDocument());
    expect(input).toHaveValue('unfinished need');
  });

  it('does not render edit controls when the server marks the card read-only', () => {
    render(<CampaignJobNeedsCard campaignId="campaign-1" initialNeeds={[need('A')]} editable={false} />);

    expect(screen.queryByPlaceholderText('employer.campaigns.jobNeeds.placeholder')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'employer.campaigns.jobNeeds.remove' })).not.toBeInTheDocument();
  });
});
