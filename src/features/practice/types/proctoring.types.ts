export type ViolationType = 'tab_switch' | 'focus_loss' | 'face_mismatch';

export interface ProctoringConfig {
  isCampaignSession: boolean;
  maxViolations: number;
  faceCaptureIntervalSec: number;
  faceSimilarityThreshold: number;
  cameraAlwaysOn: boolean;
}

export const B2C_PROCTORING_CONFIG: ProctoringConfig = {
  isCampaignSession: false,
  maxViolations: 0,
  faceCaptureIntervalSec: 0,
  faceSimilarityThreshold: 0.85,
  cameraAlwaysOn: false,
};

export const B2B_PROCTORING_CONFIG: ProctoringConfig = {
  isCampaignSession: true,
  maxViolations: 3,
  faceCaptureIntervalSec: 60,
  faceSimilarityThreshold: 0.85,
  cameraAlwaysOn: true,
};
