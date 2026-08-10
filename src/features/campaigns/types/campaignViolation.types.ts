import type { AllowedFrontendSignalType } from './campaignCandidate.types';

export type CampaignFaceSignal =
  | 'no_face'
  | 'multiple_faces'
  | 'face_mismatch'
  | 'identity_unverified';

export type CampaignViolationKind =
  | AllowedFrontendSignalType
  | 'fullscreen_exit'
  | CampaignFaceSignal;

export interface CampaignViolation {
  id: string;
  kind: CampaignViolationKind;
}
