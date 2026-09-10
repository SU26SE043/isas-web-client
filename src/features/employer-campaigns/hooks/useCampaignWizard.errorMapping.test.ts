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
