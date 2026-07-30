import { PRACTICE_ANSWER_AUDIO_MAX_BYTES } from '../types/b2cPracticeSession.types';

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
] as const;

export const AUDIO_RECORDER_MIN_DURATION_SEC = 1;

export function pickAudioRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'audio/webm';
}

export function audioExtensionForMime(mimeType: string): 'm4a' | 'webm' {
  return mimeType.includes('mp4') ? 'm4a' : 'webm';
}

export function createAnswerAudioFile(
  blob: Blob,
  sessionId: string,
  questionId: string,
  mimeType: string,
): File {
  const extension = audioExtensionForMime(mimeType);
  return new File(
    [blob],
    `answer-${sessionId}-${questionId}.${extension}`,
    { type: mimeType || blob.type || 'audio/webm' },
  );
}

export function formatAudioClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatAudioFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAudioFileTooLarge(file: File | Blob): boolean {
  return file.size > PRACTICE_ANSWER_AUDIO_MAX_BYTES;
}

export function classifyGetUserMediaError(error: unknown): 'permission-denied' | 'device-not-found' | 'unknown' {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String((error as { name?: string }).name)
      : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'permission-denied';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'device-not-found';
  }
  return 'unknown';
}
