export type InterviewFlowStep =
  | 'prepare'
  | 'device-check'
  | 'identity'
  | 'waiting'
  | 'room'
  | 'complete';

export const INTERVIEW_FLOW_STEPS: InterviewFlowStep[] = [
  'prepare',
  'device-check',
  'identity',
  'waiting',
  'room',
  'complete',
];

export type DeviceCheckStatus = 'idle' | 'checking' | 'passed' | 'failed';

export interface InterviewFlowProgress {
  consentAccepted: boolean;
  deviceCheckPassed: boolean;
  identityVerified: boolean;
  identitySnapshot?: string;
}
