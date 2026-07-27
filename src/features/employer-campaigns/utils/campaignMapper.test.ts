import { describe, expect, it } from 'vitest';
import {
  mapCampaignResponseToEmployerCampaign,
  parseCampaignResponse,
  parseCampaignResponseList,
  unwrapCampaignDetailPayload,
} from './campaignMapper';

describe('campaignMapper', () => {
  it('parses a bare CampaignResponse array', () => {
    const items = parseCampaignResponseList([
      {
        id: 'c1',
        title: 'Frontend Screen',
        status: 'Active',
        location: 'HCM',
        mode: 'Remote',
        capacity: 10,
        applicants: 3,
        deadline: '2026-08-01',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('c1');
    expect(items[0]?.status).toBe('Active');
  });

  it('unwraps { data: CampaignResponse[] }', () => {
    const items = parseCampaignResponseList({
      data: [{ id: 'c2', title: 'BA', status: 'draft' }],
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('BA');
  });

  it('maps API status/mode onto EmployerCampaign list fields', () => {
    const campaign = mapCampaignResponseToEmployerCampaign({
      id: 'c3',
      title: 'Backend',
      status: 'Paused',
      mode: 'Hybrid',
      company: 'Acme',
      location: 'HN',
      capacity: 5,
      applicantCount: 2,
      endDate: '2026-09-01',
      updatedAt: '2026-07-10T00:00:00.000Z',
    });

    expect(campaign.status).toBe('paused');
    expect(campaign.mode).toBe('hybrid');
    expect(campaign.applicants).toBe(2);
    expect(campaign.deadline).toBe('2026-09-01');
  });

  it('maps Archived separately from Closed', () => {
    const archived = mapCampaignResponseToEmployerCampaign({
      id: 'c-arch',
      title: 'Archived campaign',
      status: 'Archived',
      mode: 'Remote',
      company: 'Acme',
      location: 'HN',
      capacity: 5,
      applicantCount: 1,
      endDate: '2026-09-01',
      updatedAt: '2026-07-10T00:00:00.000Z',
    });
    expect(archived.status).toBe('archived');

    const closed = mapCampaignResponseToEmployerCampaign({
      id: 'c-closed',
      title: 'Closed campaign',
      status: 'Closed',
      mode: 'Remote',
      company: 'Acme',
      location: 'HN',
      capacity: 5,
      applicantCount: 1,
      endDate: '2026-09-01',
      updatedAt: '2026-07-10T00:00:00.000Z',
    });
    expect(closed.status).toBe('closed');
  });

  it('unwraps detail { data: CampaignResponse } with nested collections', () => {
    const payload = unwrapCampaignDetailPayload({
      data: {
        id: 'c4',
        title: 'Detail Campaign',
        status: 'draft',
        rubric: [{ name: 'Tech', weight: 100, description: 'Depth' }],
        questions: [{ prompt: 'Explain React state' }],
        candidates: [{ email: 'a@example.com', status: 'invited' }],
      },
    });
    const parsed = parseCampaignResponse(payload);
    expect(parsed?.id).toBe('c4');
    expect(parsed?.rubric).toHaveLength(1);
    expect(parsed?.questions).toHaveLength(1);
    expect(parsed?.candidates).toHaveLength(1);

    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.rubric[0]?.name).toBe('Tech');
    expect(campaign.rubric[0]?.maxScore).toBe(10);
    expect(campaign.questions[0]?.prompt).toBe('Explain React state');
    expect(campaign.candidates[0]?.status).toBe('invited');
  });

  it('parses questionText from Campaign API question DTOs', () => {
    const parsed = parseCampaignResponse({
      id: 'c5',
      title: 'With Questions',
      status: 'Draft',
      criteria: [{ name: 'Tech', description: 'Depth', weight: 0.4, maxScore: 10 }],
      questions: [
        {
          questionText: 'Explain Virtual DOM.',
          source: 'AiGenerated',
          isRequired: true,
        },
      ],
    });

    expect(parsed?.questions).toHaveLength(1);
    expect(parsed?.questions?.[0]?.prompt).toBe('Explain Virtual DOM.');
    expect(parsed?.rubric).toHaveLength(1);

    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.questions[0]?.prompt).toBe('Explain Virtual DOM.');
    expect(campaign.rubric[0]?.name).toBe('Tech');
  });
});
