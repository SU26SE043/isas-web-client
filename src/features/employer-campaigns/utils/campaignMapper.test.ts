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
        capacity: 10,
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

  it('maps API status and campaign counts onto EmployerCampaign list fields', () => {
    const campaign = mapCampaignResponseToEmployerCampaign({
      id: 'c3',
      title: 'Backend',
      status: 'Paused',
      capacity: 5,
      cvCount: 2,
      invitedCount: 3,
      completedCount: 1,
      endDate: '2026-09-01',
      updatedAt: '2026-07-10T00:00:00.000Z',
    });

    expect(campaign.status).toBe('paused');
    expect(campaign.cvCount).toBe(2);
    expect(campaign.invitedCount).toBe(3);
    expect(campaign.completedCount).toBe(1);
    expect(campaign.deadline).toBe('2026-09-01');
  });

  it('maps the campaign interview language to the wizard locale', () => {
    const campaign = mapCampaignResponseToEmployerCampaign({
      id: 'c-language',
      title: 'English campaign',
      status: 'Draft',
      language: 'en',
    });

    expect(campaign.locale).toBe('en');
  });

  it('maps Archived separately from Closed', () => {
    const archived = mapCampaignResponseToEmployerCampaign({
      id: 'c-arch',
      title: 'Archived campaign',
      status: 'Archived',
      capacity: 5,
      endDate: '2026-09-01',
      updatedAt: '2026-07-10T00:00:00.000Z',
    });
    expect(archived.status).toBe('archived');

    const closed = mapCampaignResponseToEmployerCampaign({
      id: 'c-closed',
      title: 'Closed campaign',
      status: 'Closed',
      capacity: 5,
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
      },
    });
    const parsed = parseCampaignResponse(payload);
    expect(parsed?.id).toBe('c4');
    expect(parsed?.rubric).toHaveLength(1);
    expect(parsed?.questions).toHaveLength(1);

    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.rubric[0]?.name).toBe('Tech');
    expect(campaign.rubric[0]?.maxScore).toBe(10);
    expect(campaign.questions[0]?.prompt).toBe('Explain React state');
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

  it('keeps server-authored rubric levels through the campaign mapper', () => {
    const parsed = parseCampaignResponse({
      id: 'c-levels',
      title: 'With Levels',
      status: 'Draft',
      criteria: [{
        name: 'Tech',
        weight: 1,
        maxScore: 5,
        levels: [{ score: 0, descriptor: 'No evidence' }],
      }],
    });
    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);

    expect(campaign.rubric[0]?.levels).toEqual([{ score: 0, descriptor: 'No evidence' }]);
  });

  // CAMP-18: `rubricVersion` là nhãn thước đo hiện hành, card chấm thử dùng nó để nói "v{N} → v{N+1}". Fixture cố ý
  // để maxQuestions ≠ rubricVersion để phép đọc-nhầm-cột không lọt; thiếu field → null (không bịa v1).
  it('đọc rubricVersion của campaign (camelCase lẫn PascalCase), thiếu thì null', () => {
    const parsed = parseCampaignResponse({ id: 'c-rv', title: 'RV', status: 'Active', maxQuestions: 9, rubricVersion: 3 });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).rubricVersion).toBe(3);
    const pascal = parseCampaignResponse({ id: 'c-rv2', title: 'RV', status: 'Active', MaxQuestions: 9, RubricVersion: 5 });
    expect(mapCampaignResponseToEmployerCampaign(pascal!).rubricVersion).toBe(5);
    const missing = parseCampaignResponse({ id: 'c-rv3', title: 'RV', status: 'Draft', maxQuestions: 9 });
    expect(mapCampaignResponseToEmployerCampaign(missing!).rubricVersion).toBeNull();
  });

  // SC2 — vắng ⇒ 'Always' (INT-18 lùi an toàn: không nhãn = chấm mọi câu); giá trị lạ cũng rơi về 'Always'.
  it('scoringScope: vắng/lạ ⇒ Always; WhenTargeted giữ nguyên', () => {
    const parsed = parseCampaignResponse({
      id: 'c-scope',
      title: 'Scope',
      status: 'Draft',
      criteria: [
        { name: 'Cách nói', weight: 0.4, maxScore: 5 },
        { name: 'Nội dung', weight: 0.6, maxScore: 5, scoringScope: 'WhenTargeted' },
        { name: 'Lạ', weight: 0.1, maxScore: 5, scoringScope: 'Bogus' },
      ],
    });
    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.rubric[0]?.scoringScope).toBe('Always');
    expect(campaign.rubric[1]?.scoringScope).toBe('WhenTargeted');
    expect(campaign.rubric[2]?.scoringScope).toBe('Always');
  });

  // SC2 — targetCriterionIds: null khi chưa gắn nhãn (KHÔNG phải []); sampleAnswer đi qua nguyên vẹn.
  it('đọc targetCriterionIds + sampleAnswer của câu hỏi; null khi vắng, [] khi đã gắn nhãn rỗng', () => {
    const parsed = parseCampaignResponse({
      id: 'c-target',
      title: 'Target',
      status: 'Draft',
      questions: [
        { questionText: 'Câu chưa gắn nhãn' },
        { questionText: 'Câu gắn nhãn rỗng', targetCriterionIds: [] },
        { questionText: 'Câu có nhãn', targetCriterionIds: ['c1', 'c2'], sampleAnswer: 'Bài mẫu' },
      ],
    });
    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.questions[0]?.targetCriterionIds).toBeNull();
    expect(campaign.questions[0]?.sampleAnswer).toBeNull();
    expect(campaign.questions[1]?.targetCriterionIds).toEqual([]);
    expect(campaign.questions[2]?.targetCriterionIds).toEqual(['c1', 'c2']);
    expect(campaign.questions[2]?.sampleAnswer).toBe('Bài mẫu');
  });

  // SC2 — coverageWarnings thuần THÔNG TIN (không chặn publish, khác `warnings` chứa K_BELOW_CRITERIA_GROUPS).
  it('đọc questionBank.coverageWarnings (camelCase lẫn PascalCase)', () => {
    const parsed = parseCampaignResponse({
      id: 'c-coverage',
      title: 'Coverage',
      status: 'Active',
      questionBank: {
        total: 5,
        warnings: ['K_BELOW_CRITERIA_GROUPS'],
        coverageWarnings: [{ criterionId: 'c1', name: 'Nội dung' }],
      },
    });
    const campaign = mapCampaignResponseToEmployerCampaign(parsed!);
    expect(campaign.questionBank?.coverageWarnings).toEqual([{ criterionId: 'c1', name: 'Nội dung' }]);
    expect(campaign.questionBankWarnings).toEqual(['K_BELOW_CRITERIA_GROUPS']);

    const pascal = parseCampaignResponse({
      id: 'c-coverage-2',
      title: 'Coverage',
      status: 'Active',
      QuestionBank: { CoverageWarnings: [{ CriterionId: 'c9', Name: 'Khác' }] },
    });
    expect(mapCampaignResponseToEmployerCampaign(pascal!).questionBank?.coverageWarnings).toEqual([
      { criterionId: 'c9', name: 'Khác' },
    ]);
  });
});
