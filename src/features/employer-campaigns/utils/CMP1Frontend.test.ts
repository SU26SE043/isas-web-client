import { describe, expect, it } from 'vitest';
import { mapQuestionsToApiRequest, mapRubricToCreateCriteria } from './buildCampaignCreateRequest';
import { buildJobNeedsRescuePayload } from './jobNeedsRescue';
import { candidateScreeningStatusLabelKey } from './candidateScreeningStatus';
import {
  buildCandidateListParams,
  parseCandidateDetail,
  parseCandidateListItem,
  parseCandidateUploadResponse,
  unwrapArrayPayload,
} from './campaignCandidatesApi';
import { validateCampaignWizardStep } from './validateCampaignWizard';
import { validateCampaignPdf, parseContentDispositionFilename } from './campaignFiles';
import { parseCampaignResponse, mapCampaignResponseToEmployerCampaign } from './campaignMapper';
import {
  countInvitationsByStatus,
  mergeInvitationsById,
  parseCampaignInvitation,
  parseCampaignInvitationsPage,
  readNextCursorHeader,
} from './campaignInvitationsApi';
import { CampaignRequestError } from '../services/campaignManagement.service';
import {
  getCampaignInvitationError,
  getCampaignInvitationErrorKey,
} from './campaignInvitationError';
import {
  clearPendingInviteToken,
  invitationPath,
  readPendingInviteToken,
  savePendingInviteToken,
} from '@/features/campaigns/utils/inviteContinuation';
import {
  campaignInterviewStorageKey,
  clearCampaignInterviewSession,
  isB2bCampaignSessionId,
  readCampaignInterviewSession,
  saveCampaignInterviewSession,
} from '@/features/campaigns/utils/campaignInterviewSession';

describe('F3 — question and rubric write contracts', () => {
  it('maps manual question text to questionText', () => {
    expect(mapQuestionsToApiRequest([{ id: 'new-1', prompt: 'Explain React', skill: '', difficulty: 'middle', source: 'manual', isRequired: true }])).toEqual([{ questionText: 'Explain React', isRequired: true }]);
  });
  it('maps AI question source without leaking UI source', () => {
    expect(mapQuestionsToApiRequest([{ id: 'new-2', prompt: 'Explain state', skill: 'React', difficulty: 'senior', source: 'ai', isRequired: false }])[0]).not.toHaveProperty('source');
  });
  it('preserves server question GUIDs', () => {
    expect(mapQuestionsToApiRequest([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', prompt: 'Q', skill: '', difficulty: 'junior', source: 'manual', isRequired: true }])[0]).toHaveProperty('id');
  });
  it('maps criterion percentage to decimal weight', () => {
    expect(mapRubricToCreateCriteria([{ id: 'x', name: 'Tech', description: '', weight: 25, maxScore: 10 }])[0]?.weight).toBe(0.25);
  });
  it('normalizes empty criterion description to null', () => {
    expect(mapRubricToCreateCriteria([{ id: 'x', name: 'Tech', description: '', weight: 100, maxScore: 10 }])[0]?.description).toBeNull();
  });
  it('keeps fractional max score', () => {
    expect(mapRubricToCreateCriteria([{ id: 'x', name: 'Depth', description: '', weight: 100, maxScore: 2.5 }])[0]?.maxScore).toBe(2.5);
  });
  it('does not echo a client criterion id', () => {
    expect(mapRubricToCreateCriteria([{ id: 'system-1', name: 'Tech', description: '', weight: 100, maxScore: 10 }])[0]).not.toHaveProperty('id');
  });
  it('echoes a server criterion GUID', () => {
    expect(mapRubricToCreateCriteria([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Tech', description: '', weight: 100, maxScore: 10 }])[0]?.id).toBe('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
  it('retains score levels on criterion writes', () => {
    const levels = [{ score: 5, descriptor: 'Strong' }];
    expect(mapRubricToCreateCriteria([{ id: 'x', name: 'Tech', description: '', weight: 100, maxScore: 10, levels }])[0]?.levels).toEqual(levels);
  });
});

describe('F4 — editable job needs and draft validation', () => {
  it('trims rescue job need text', () => {
    expect(buildJobNeedsRescuePayload('  React  ')).toEqual([{ category: 'Technical', text: 'React' }]);
  });
  it('does not create a rescue need for blank text', () => {
    expect(buildJobNeedsRescuePayload('   ')).toEqual([]);
  });
  it('keeps the requested rescue category', () => {
    expect(buildJobNeedsRescuePayload('English', 'Communication')).toEqual([{ category: 'Communication', text: 'English' }]);
  });
  it('maps all supported screening statuses', () => {
    expect(candidateScreeningStatusLabelKey('Pending')).toContain('status.Pending');
    expect(candidateScreeningStatusLabelKey('Filtered')).toContain('status.Filtered');
  });
  it('maps analyzed status separately from analysis failure', () => {
    expect(candidateScreeningStatusLabelKey('Analyzed')).not.toBe(candidateScreeningStatusLabelKey('AnalysisFailed'));
  });
  it('leaves unknown status visible instead of dropping it', () => {
    expect(candidateScreeningStatusLabelKey('VendorStatus')).toBe('VendorStatus');
  });
  it('rejects a negative minimum experience', () => {
    const state = { hardFilters: { minYearsExperience: -1 }, info: {}, jd: {}, questions: [], rubric: [], settings: {} } as never;
    expect(validateCampaignWizardStep(state, 1)).toBe('employer.campaigns.wizard.hardFilters.minYearsInvalid');
  });
  it('accepts zero minimum experience', () => {
    const state = { hardFilters: { minYearsExperience: 0 }, info: {}, jd: { inputMethod: 'text', jdText: 'Valid JD' }, questions: [], rubric: [], settings: {} } as never;
    expect(validateCampaignWizardStep(state, 1)).toBeNull();
  });
});

describe('F5 — evidence-first candidate screening', () => {
  it('unwraps a bare candidate array', () => {
    expect(unwrapArrayPayload([{ id: 'c1' }])).toEqual([{ id: 'c1' }]);
  });
  it('unwraps nested items', () => {
    expect(unwrapArrayPayload({ data: { items: [{ id: 'c1' }] } })).toEqual([{ id: 'c1' }]);
  });
  it('drops a candidate without an id', () => {
    expect(parseCandidateListItem({ email: 'a@example.com' })).toBeNull();
  });
  it('parses candidate score and eligibility', () => {
    expect(parseCandidateListItem({ id: 'c1', overallMatchScore: 82, eligible: true })).toMatchObject({ overallMatchScore: 82, eligible: true });
  });
  it('parses missing must-have names', () => {
    expect(parseCandidateListItem({ id: 'c1', missingMustHave: ['English'], mustHaveMet: 1, mustHaveTotal: 2 })).toMatchObject({ missingMustHave: ['English'], mustHaveMet: 1, mustHaveTotal: 2 });
  });
  it('parses upload summary counts', () => {
    expect(parseCandidateUploadResponse({ received: 3, rejected: 1, filtered: 1, skipped: 0 }).received).toBe(3);
  });
  it('parses candidate detail evidence arrays', () => {
    expect(parseCandidateDetail({ id: 'c1', strengths: [{ needId: 'n1', area: 'React', evidence: '5 years' }] })?.strengths).toHaveLength(1);
  });
  it('rejects incomplete evidence rather than displaying an empty claim', () => {
    expect(parseCandidateDetail({ id: 'c1', strengths: [{ needId: 'n1', area: 'React' }] })?.strengths).toEqual([]);
  });
  it('trims and clamps candidate list limit', () => {
    expect(buildCandidateListParams({ search: '  react ', limit: 999 })).toEqual({ search: 'react', limit: 500 });
  });
  it('omits empty candidate query params', () => {
    expect(buildCandidateListParams({ search: ' ', status: ' ', limit: undefined })).toBeUndefined();
  });
});

describe('F6 — single source campaign details and safe files', () => {
  it('accepts a valid PDF', () => {
    expect(validateCampaignPdf(new File(['pdf'], 'jd.pdf', { type: 'application/pdf' }))).toBeNull();
  });
  it('rejects a PDF with the wrong MIME type', () => {
    expect(validateCampaignPdf(new File(['pdf'], 'jd.pdf', { type: 'text/plain' }))).toBe('notPdf');
  });
  it('rejects an empty PDF', () => {
    expect(validateCampaignPdf(new File([], 'jd.pdf', { type: 'application/pdf' }))).toBe('corrupt');
  });
  it('rejects a file over the upload limit', () => {
    expect(validateCampaignPdf(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'jd.pdf', { type: 'application/pdf' }))).toBe('tooLarge');
  });
  it('parses standard content disposition filename', () => {
    expect(parseContentDispositionFilename('attachment; filename="jd.pdf"')).toBe('jd.pdf');
  });
  it('parses UTF-8 content disposition filename', () => {
    expect(parseContentDispositionFilename("attachment; filename*=UTF-8''job%20description.pdf")).toBe('job description.pdf');
  });
  it('maps question bank warnings into the campaign model', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'Campaign', questionBankSummary: { warnings: ['Missing skill'] } });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).questionBankSummary?.warnings).toEqual(['Missing skill']);
  });
  it('does not use a domain as company fallback', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'Campaign', domain: 'Frontend' });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).company).toBe('—');
  });
  it('keeps campaign location from the API when present', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'Campaign', location: 'HCM' });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).location).toBe('HCM');
  });
});

describe('F7 — invitation and interview start flow contracts', () => {
  it('builds an encoded public invitation path', () => {
    expect(invitationPath('a b')).toBe('/invitations/a%20b');
  });
  it('saves and reads the pending invite token', () => {
    sessionStorage.clear();
    savePendingInviteToken('  token-1  ');
    expect(readPendingInviteToken()).toBe('token-1');
  });
  it('clears the pending invite after a successful join', () => {
    savePendingInviteToken('token-1');
    clearPendingInviteToken();
    expect(readPendingInviteToken()).toBeNull();
  });
  it('stores a B2B interview session with the server session id', () => {
    sessionStorage.clear();
    const saved = saveCampaignInterviewSession({ campaignId: 'c1', sessionId: 's1', antiCheatEnabled: true, faceEnrollRequired: false, adaptiveEnabled: true, deadlineAt: null, questions: [] });
    expect(saved.sessionId).toBe('s1');
    expect(readCampaignInterviewSession('s1')?.mode).toBe('b2b-campaign');
  });
  it('recognizes a stored B2B session', () => {
    expect(isB2bCampaignSessionId('s1')).toBe(true);
  });
  it('clears an interview session without affecting another session', () => {
    saveCampaignInterviewSession({ campaignId: 'c1', sessionId: 's2', antiCheatEnabled: false, faceEnrollRequired: false, adaptiveEnabled: false, deadlineAt: null, questions: [] });
    clearCampaignInterviewSession('s2');
    expect(readCampaignInterviewSession('s2')).toBeNull();
    expect(campaignInterviewStorageKey('s1')).toContain('s1');
  });
  it('maps a conflict to the campaign-not-active key', () => {
    expect(getCampaignInvitationErrorKey(new CampaignRequestError(409, 'Conflict'))).toContain('campaignNotActiveConflict');
  });
  it('preserves a backend invitation reason for display', () => {
    expect(getCampaignInvitationError(new CampaignRequestError(400, 'Open at 10:00'), 'fallback')).toBe('Open at 10:00');
  });
});

describe('F8 — campaign list counts and invitation pagination', () => {
  const invitation = (id: string, status: 'Queued' | 'Sent' | 'Joined' | 'Expired' | 'Revoked', createdAt: string) => ({ id, email: `${id}@example.com`, status, createdAt, expiresAt: '2099-01-01' });
  it('maps CV count to the campaign model', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'C', cvCount: 3, invitedCount: 2, completedCount: 1 });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).cvCount).toBe(3);
  });
  it('maps invited count separately from completed count', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'C', cvCount: 3, invitedCount: 2, completedCount: 1 });
    expect(mapCampaignResponseToEmployerCampaign(parsed!)).toMatchObject({ invitedCount: 2, completedCount: 1 });
  });
  it('does not derive list counts from applicantCount', () => {
    const parsed = parseCampaignResponse({ id: 'c1', title: 'C', applicantCount: 99 });
    expect(mapCampaignResponseToEmployerCampaign(parsed!).cvCount).toBe(0);
  });
  it('normalizes invitation status while parsing', () => {
    expect(parseCampaignInvitation({ id: 'i1', email: 'A@EXAMPLE.COM', status: 'sent', createdAt: '2026-01-01', expiresAt: '2026-02-01' })?.status).toBe('Sent');
  });
  it('filters invalid invitation rows', () => {
    expect(parseCampaignInvitationsPage([{ id: 'i1', email: 'a@x.com', status: 'Queued', createdAt: 'a', expiresAt: 'b' }, { id: 'bad' }], {}).items).toHaveLength(1);
  });
  it('reads the next cursor header', () => {
    expect(readNextCursorHeader({ 'x-next-cursor': ' next-1 ' })).toBe('next-1');
  });
  it('merges invitations by id and keeps reissued rows', () => {
    const first = invitation('i1', 'Sent', '2026-01-01');
    const second = invitation('i1', 'Joined', '2026-01-01');
    expect(mergeInvitationsById([first], [second])).toEqual([second]);
  });
  it('counts every invitation status for filter chips', () => {
    expect(countInvitationsByStatus([invitation('1', 'Queued', 'a'), invitation('2', 'Sent', 'b'), invitation('3', 'Joined', 'c')])).toMatchObject({ Queued: 1, Sent: 1, Joined: 1, Expired: 0, Revoked: 0 });
  });
});
