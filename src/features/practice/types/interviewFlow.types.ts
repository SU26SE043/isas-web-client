export type InterviewFlowStep =
  | 'prepare'
  | 'device-check'
  | 'terms'
  | 'identity'
  | 'waiting'
  | 'room'
  | 'complete';

export const INTERVIEW_FLOW_STEPS: InterviewFlowStep[] = [
  'prepare',
  'device-check',
  'terms',
  'identity',
  'waiting',
  'room',
  'complete',
];

export const B2C_FLOW_STEPS: InterviewFlowStep[] = [
  'prepare',
  'device-check',
  'waiting',
  'room',
  'complete',
];

export type DeviceCheckStatus = 'idle' | 'checking' | 'passed' | 'failed';

export interface InterviewFlowProgress {
  consentAccepted: boolean;
  deviceCheckPassed: boolean;
  termsAccepted: boolean;
  identityVerified: boolean;
  identitySnapshot?: string;
}

export function isCampaignSessionId(sessionId: string) {
  return sessionId.startsWith('campaign-');
}

export function isLearningSessionId(sessionId: string) {
  return sessionId.startsWith('learning-');
}

export function requiresIdentityVerification(sessionId: string) {
  return isCampaignSessionId(sessionId);
}
