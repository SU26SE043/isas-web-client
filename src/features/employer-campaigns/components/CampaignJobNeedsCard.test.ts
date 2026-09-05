import { describe, expect, it } from 'vitest';
import type { CampaignJobNeed } from '../types/campaign.api.types';
import { displayedCampaignJobNeeds } from './CampaignJobNeedsCard';

const need = (text: string): CampaignJobNeed => ({ needId: text, category: 'Technical', text });

describe('displayedCampaignJobNeeds', () => {
  it('renders fresh props for the read-only card', () => {
    expect(displayedCampaignJobNeeds([need('updated')], false, [need('stale')])).toEqual([need('updated')]);
  });
});
