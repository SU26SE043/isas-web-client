import axios from 'axios';
import { describe, expect, it } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import {
  buildInvitationRetryRequest,
  getDeployWarnings,
  mapDeployError,
  mapSubmitError,
  resolveCampaignErrorStep,
} from './useCampaignWizard';

describe('campaign wizard API error step mapping', () => {
  it('uses the current wizard email list for a partial deployment retry', () => {
    const campaign = { id: 'campaign-1' } as EmployerCampaign;
    const partialDeploy = { campaignId: 'campaign-1', campaign };
    const currentEmails = ['new@example.com'];

    expect(buildInvitationRetryRequest(partialDeploy, currentEmails)).toEqual({
      campaignId: 'campaign-1',
      emails: ['new@example.com'],
    });
  });

  it('does not build a retry request when deployment is not partial', () => {
    expect(buildInvitationRetryRequest(null, ['candidate@example.com'])).toBeNull();
  });

  it('maps validation fields to the affected wizard step', () => {
    expect(resolveCampaignErrorStep('request: maxScore must be <= 10', 'create')).toBe(2);
    expect(resolveCampaignErrorStep('request: maxQuestions is invalid', 'update')).toBe(4);
    expect(resolveCampaignErrorStep('request: questionText is required', 'questions')).toBe(3);
    expect(resolveCampaignErrorStep('request: startsAt must be in the future', 'create')).toBe(0);
    expect(resolveCampaignErrorStep('request: jdText is required', 'create')).toBe(1);
  });

  it('409 có lời server (plain-text) thì hiện đúng lời đó, không dán đè "chỉ sửa được khi Draft"', () => {
    // Đo trên dev 14/09: Draft đã sàng 1 CV → PUT echo domain → BE 409 nêu rõ lý do, FE lại báo
    // "Chỉ có thể chỉnh sửa đầy đủ chiến dịch khi đang ở trạng thái Draft" — campaign VẪN là Draft.
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
      data: 'Không sửa được trường quyết định cách AI sàng/chấm CV khi campaign đã có ứng viên.',
    };
    expect(mapSubmitError(error, (key) => key, 'update')).toEqual({
      message: 'Không sửa được trường quyết định cách AI sàng/chấm CV khi campaign đã có ứng viên.',
      step: null,
    });

    // Không có body ⇒ vẫn rơi về câu mặc định.
    const bare = new axios.AxiosError('Request failed');
    bare.response = { status: 409, statusText: 'Conflict', headers: {}, config: {} as never, data: '' };
    expect(mapSubmitError(bare, (key) => key, 'update').message).toBe('employer.campaigns.wizard.notDraftEditable');
  });

  it('400 "StartsAt/ExpiresAt cannot be in the past" ⇒ câu dịch riêng + về bước 1 (đo prod 21/09: HR đọc thành lỗi mạng)', () => {
    const past = (data: string) => {
      const error = new axios.AxiosError('Request failed');
      error.response = { status: 400, statusText: 'Bad Request', headers: {}, config: {} as never, data };
      return error;
    };
    expect(mapSubmitError(past('StartsAt cannot be in the past.'), (key) => key, 'create')).toEqual({
      message: 'employer.campaigns.wizard.startsAtInPast',
      step: 0,
    });
    expect(mapSubmitError(past('ExpiresAt cannot be in the past.'), (key) => key, 'create')).toEqual({
      message: 'employer.campaigns.wizard.expiresAtInPast',
      step: 0,
    });
  });

  it('preserves the adaptive budget details from a 400 response', () => {
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
      data: {
        message: 'ADAPTIVE_BUDGET_TOO_SMALL',
        data: { need: 80, have: 20, questions: 20, deep: 3 },
      },
    };

    const mapped = mapSubmitError(
      error,
      (key) => (key === 'employer.campaigns.wizard.adaptiveBudgetTooSmall'
        ? 'questions={questions}; deep={deep}; need={need}; have={have}; max={maxQuestions}; depth={maxDepth}'
        : key),
      'create',
    );

    expect(mapped).toEqual({
      message: 'questions=20; deep=3; need=80; have=20; max=5; depth=0',
      step: 3,
    });
  });

  it('returns every question-bank warning from the publish response body', () => {
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
      data: { data: { code: 'QUESTION_BANK_INVALID', warnings: ['Need a question', 'Need a rubric'] } },
    };
    const t = (key: string) => key === 'employer.campaigns.wizard.deploy.warning.QUESTION_BANK_INVALID'
      ? 'Question bank invalid'
      : key;

    expect(getDeployWarnings(error, t)).toEqual(['Question bank invalid', 'Need a question', 'Need a rubric']);
    expect(mapDeployError(error, t)).toBe('Question bank invalid Need a question Need a rubric');
  });

  it('renders all four adaptive budget values for a publish rejection', () => {
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
      data: { data: { code: 'ADAPTIVE_BUDGET_TOO_SMALL', need: 80, have: 20, questions: 20, deep: 3 } },
    };
    const message = mapDeployError(error, (key) => key === 'employer.campaigns.wizard.adaptiveBudgetTooSmall'
      ? 'questions={questions}; deep={deep}; need={need}; have={have}; max={maxQuestions}; depth={maxDepth}'
      : key);

    expect(message).toContain('questions=20');
    expect(message).toContain('deep=3');
    expect(message).toContain('need=80');
    expect(message).toContain('have=20');
  });

  it('preserves a plain server reason for publish conflicts', () => {
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
      data: 'Campaign has interview slots configured.',
    };

    expect(mapDeployError(error, (key) => key)).toBe('Campaign has interview slots configured.');
  });
});

/**
 * ATT1-F5b — Backend trả body OBJECT `{ error }` cho MỌI 400/409 của POST/PUT /campaign (vd. nháp cũ
 * có thời lượng ngoài [5,180] lúc publish ⇒ 400 [C4]). Đường cũ chỉ đọc CHUỖI TRẦN và chỉ ở 409 ⇒
 * cả 400 lẫn 409 rơi về câu chung "deployFailed", HR không biết sai gì.
 */
describe('publish — lời server trong body `{ error }`', () => {
  const deployError = (status: number, data: unknown) => {
    const error = new axios.AxiosError('Request failed');
    error.response = { status, statusText: '', headers: {}, config: {} as never, data };
    return error;
  };
  const REASON = 'Thời lượng làm bài phải trong khoảng 5–180 phút.';
  const t = (key: string) => key;

  it('400 { error } ⇒ hiện NGUYÊN lời server, không phải câu chung', () => {
    const error = deployError(400, { error: REASON });
    expect(getDeployWarnings(error, t)).toEqual([REASON]);
    expect(mapDeployError(error, t)).toBe(REASON);
  });

  it('409 { error } ⇒ hiện NGUYÊN lời server (MAX_ATTEMPTS_DECREASE, TIME_LIMIT_LOCKED…)', () => {
    const error = deployError(409, { code: 'TIME_LIMIT_LOCKED', error: 'Không sửa được thời lượng sau khi triển khai.' });
    expect(mapDeployError(error, t)).toBe('Không sửa được thời lượng sau khi triển khai.');
  });

  it('409 bọc `{ data: { error } }` ⇒ vẫn đọc được lời server', () => {
    expect(mapDeployError(deployError(409, { data: { error: REASON } }), t)).toBe(REASON);
  });

  it('code QUESTION_BANK_INVALID vẫn thắng lời server trong cùng body 400', () => {
    const error = deployError(400, { code: 'QUESTION_BANK_INVALID', error: REASON });
    expect(getDeployWarnings(error, t)).toEqual(['employer.campaigns.wizard.deploy.warning.QUESTION_BANK_INVALID']);
  });

  it('500 { error } ⇒ câu chung, KHÔNG lộ lời server kỹ thuật', () => {
    const error = deployError(500, { error: 'NullReferenceException at CampaignService' });
    expect(getDeployWarnings(error, t)).toEqual([]);
    expect(mapDeployError(error, t)).toBe('employer.campaigns.wizard.deploy.deployFailed');
  });

  it('body rỗng / thiếu / `error` không phải chuỗi ⇒ câu chung', () => {
    for (const data of [undefined, null, '', '   ', {}, { error: '' }, { error: '  ' }, { error: 42 }]) {
      expect(mapDeployError(deployError(400, data), t)).toBe('employer.campaigns.wizard.deploy.deployFailed');
    }
    expect(mapDeployError(new Error('Network Error'), t)).toBe('employer.campaigns.wizard.deploy.deployFailed');
  });

  // Dải đọc lời server phải HẸP đúng 400/409 (lỗi nghiệp vụ). 401/403 là lỗi phiên/quyền: lời server
  // ("token expired") vô nghĩa với HR và lộ chi tiết kỹ thuật ⇒ phải về câu chung. Thiếu ca này thì
  // nới `status === 400 || status === 409` sang 401/403 không test nào đỏ [lỗ K4].
  it('401 / 403 { error } ⇒ câu chung, KHÔNG lộ lời server', () => {
    for (const status of [401, 403]) {
      const error = deployError(status, { error: 'token expired' });
      expect(getDeployWarnings(error, t)).toEqual([]);
      expect(mapDeployError(error, t)).toBe('employer.campaigns.wizard.deploy.deployFailed');
    }
  });

  // F5b (dọn): `handleFinalSubmit` bỏ chốt 409 riêng ⇒ câu mặc định cho 409 không-body chuyển vào
  // `mapDeployError`, để thông điệp không tụt từ "sai trạng thái" xuống câu chung "triển khai thất bại".
  it('409 không body / body lạ ⇒ câu mặc định về trạng thái, không phải câu chung', () => {
    for (const data of [undefined, null, '', '   ', {}, { error: '' }, { error: 42 }]) {
      expect(getDeployWarnings(deployError(409, data), t)).toEqual([]);
      expect(mapDeployError(deployError(409, data), t)).toBe('employer.campaigns.wizard.deploy.deployConflict');
    }
  });
});
