export type ViolationType = 'tab_switch' | 'focus_loss' | 'face_mismatch';

export interface ProctoringConfig {
  /** True for B2B campaign sessions (`campaign-*` session ids). */
  isCampaignSession: boolean;
  /** Strict anti-cheat: tab/focus listeners and periodic face snapshots (B2B only). */
  antiCheatEnabled: boolean;
  maxViolations: number;
  faceCaptureIntervalSec: number;
  faceSimilarityThreshold: number;
  /** Camera must stay on for the entire interview (B2C and B2B). */
  cameraAlwaysOn: boolean;
}

export const B2C_PROCTORING_CONFIG: ProctoringConfig = {
  isCampaignSession: false,
  antiCheatEnabled: false,
  maxViolations: 0,
  faceCaptureIntervalSec: 0,
  faceSimilarityThreshold: 0.85,
  cameraAlwaysOn: true,
};

export const B2B_PROCTORING_CONFIG: ProctoringConfig = {
  isCampaignSession: true,
  antiCheatEnabled: true,
  maxViolations: 3,
  faceCaptureIntervalSec: 60,
  faceSimilarityThreshold: 0.85,
  cameraAlwaysOn: true,
};
