export type ProctoringEventType = 'tab_switch' | 'focus_loss' | 'face_missing' | 'face_mismatch' | 'multiple_faces';

export interface ProctoringEventPayload {
  type: ProctoringEventType;
  occurredAt: string;
  metadata?: Record<string, string | number>;
}

export interface SessionStartResult {
  sessionId: string;
  creditsRemaining: number;
  startedAt: string;
}

export interface ChunkUploadResult {
  chunkIndex: number;
  receivedAt: string;
}

export interface SessionCompleteResult {
  sessionId: string;
  assessmentId: string;
  uploadComplete: boolean;
}
