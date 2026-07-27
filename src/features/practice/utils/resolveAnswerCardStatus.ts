import type { AnswerCardStatus, AudioRecorderStatus } from '../types/audioRecorder.types';

export function resolveAnswerCardStatus(params: {
  hasAnswer: boolean;
  questionState?: string;
  isSubmitting: boolean;
  answerError: string | null;
}): AnswerCardStatus {
  if (params.isSubmitting) return 'submitting';
  if (params.hasAnswer || params.questionState === 'submitted') return 'submitted';
  if (params.answerError || params.questionState === 'error') return 'error';
  if (params.questionState === 'recording') return 'recording';
  if (params.questionState === 'recorded') return 'recorded';
  return 'unanswered';
}

export function mapModalToCardStatus(status: AudioRecorderStatus): AnswerCardStatus | null {
  switch (status) {
    case 'recording':
    case 'requesting-permission':
      return 'recording';
    case 'recorded':
      return 'recorded';
    case 'submitting':
      return 'submitting';
    case 'success':
      return 'submitted';
    case 'error':
      return 'error';
    default:
      return null;
  }
}
