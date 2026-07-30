export type AudioRecorderStatus =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'recorded'
  | 'submitting'
  | 'success'
  | 'error';

export type AudioRecorderErrorKind =
  | 'permission-denied'
  | 'device-not-found'
  | 'empty-recording'
  | 'too-short'
  | 'too-large'
  | 'submit-failed'
  | 'mic-disconnected'
  | 'unknown';

export interface AudioRecorderState {
  status: AudioRecorderStatus;
  elapsedSeconds: number;
  maxDurationSeconds: number;
  audioBlob: Blob | null;
  audioFile: File | null;
  previewUrl: string | null;
  errorMessage: string | null;
  errorKind: AudioRecorderErrorKind | null;
  playbackError: string | null;
  isPlaying: boolean;
  maxDurationReached: boolean;
  uploadProgress: number | null;
}

export type AnswerCardStatus =
  | 'unanswered'
  | 'recording'
  | 'recorded'
  | 'submitting'
  | 'submitted'
  | 'error';
