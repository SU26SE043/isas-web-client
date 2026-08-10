import { describe, expect, it } from 'vitest';
import { CampaignRequestError } from '../services/campaignManagement.service';
import {
  campaignSlotCapacity,
  getCampaignSlotErrorKey,
  parseCampaignSlots,
  toCampaignSlotRequest,
  validateCampaignSlot,
} from './campaignSlots';

describe('campaignSlots', () => {
  it('parses required counts from the live response', () => {
    expect(
      parseCampaignSlots([
        {
          id: 'slot-1',
          startsAt: '2026-08-16T02:00:00Z',
          endsAt: '2026-08-16T03:00:00Z',
          capacity: 5,
          assignedCount: 3,
          startedCount: 1,
        },
      ]),
    ).toEqual([
      expect.objectContaining({ id: 'slot-1', capacity: 5, assignedCount: 3, startedCount: 1 }),
    ]);
  });

  it('validates time order, positive integers, and assigned capacity', () => {
    expect(validateCampaignSlot({ startsAt: '', endsAt: '', capacity: '5' })).toBe('startsRequired');
    expect(
      validateCampaignSlot({ startsAt: '2026-08-16T10:00', endsAt: '2026-08-16T09:00', capacity: '5' }),
    ).toBe('endsAfterStart');
    expect(
      validateCampaignSlot({ startsAt: '2026-08-16T09:00', endsAt: '2026-08-16T10:00', capacity: '0' }),
    ).toBe('capacityPositiveInteger');
    expect(
      validateCampaignSlot({ startsAt: '2026-08-16T09:00', endsAt: '2026-08-16T10:00', capacity: '4' }, 5),
    ).toBe('capacityBelowAssigned');
  });

  it('converts local datetime values through Date before sending ISO UTC', () => {
    const result = toCampaignSlotRequest({
      startsAt: '2026-08-16T09:00',
      endsAt: '2026-08-16T10:00',
      capacity: '5',
    });
    expect(result.startsAt).toBe(new Date('2026-08-16T09:00').toISOString());
    expect(result.endsAt).toBe(new Date('2026-08-16T10:00').toISOString());
    expect(result.capacity).toBe(5);
  });

  it('calculates total and remaining capacity', () => {
    expect(
      campaignSlotCapacity([
        { id: '1', startsAt: 'a', endsAt: 'b', capacity: 5, assignedCount: 3, startedCount: 1 },
        { id: '2', startsAt: 'c', endsAt: 'd', capacity: 10, assignedCount: 4, startedCount: 0 },
      ]),
    ).toEqual({ total: 15, available: 8 });
  });

  it('maps overlap and running-delete conflicts without exposing transport errors', () => {
    expect(getCampaignSlotErrorKey(new CampaignRequestError(409, 'Conflict'), 'create')).toBe(
      'employer.campaigns.slots.errors.overlap',
    );
    expect(getCampaignSlotErrorKey(new CampaignRequestError(409, 'Conflict'), 'delete')).toBe(
      'employer.campaigns.slots.errors.deleteRunning',
    );
  });
});
