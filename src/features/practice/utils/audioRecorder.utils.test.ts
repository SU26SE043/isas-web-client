// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  audioExtensionForMime,
  classifyGetUserMediaError,
  createAnswerAudioFile,
  formatAudioClock,
  pickAudioRecorderMimeType,
} from './audioRecorder.utils';
import { resolveAnswerCardStatus } from './resolveAnswerCardStatus';

describe('audioRecorder.utils', () => {
  it('formats clock and picks extensions', () => {
    expect(formatAudioClock(65)).toBe('01:05');
    expect(audioExtensionForMime('audio/mp4')).toBe('m4a');
    expect(audioExtensionForMime('audio/webm;codecs=opus')).toBe('webm');
  });

  it('creates named answer files', () => {
    const file = createAnswerAudioFile(
      new Blob(['abc'], { type: 'audio/webm' }),
      'session-1',
      'question-2',
      'audio/webm',
    );
    expect(file.name).toBe('answer-session-1-question-2.webm');
    expect(file.type).toContain('webm');
  });

  it('classifies getUserMedia errors', () => {
    expect(classifyGetUserMediaError({ name: 'NotAllowedError' })).toBe('permission-denied');
    expect(classifyGetUserMediaError({ name: 'NotFoundError' })).toBe('device-not-found');
    expect(classifyGetUserMediaError({ name: 'Other' })).toBe('unknown');
  });

  it('returns a mime type string', () => {
    expect(typeof pickAudioRecorderMimeType()).toBe('string');
  });
});

describe('resolveAnswerCardStatus', () => {
  it('prefers submitting and submitted states', () => {
    expect(
      resolveAnswerCardStatus({
        hasAnswer: false,
        isSubmitting: true,
        answerError: null,
      }),
    ).toBe('submitting');
    expect(
      resolveAnswerCardStatus({
        hasAnswer: true,
        isSubmitting: false,
        answerError: null,
      }),
    ).toBe('submitted');
  });

  it('maps question states and errors', () => {
    expect(
      resolveAnswerCardStatus({
        hasAnswer: false,
        questionState: 'recording',
        isSubmitting: false,
        answerError: null,
      }),
    ).toBe('recording');
    expect(
      resolveAnswerCardStatus({
        hasAnswer: false,
        isSubmitting: false,
        answerError: 'practice.errors.audioRequired',
      }),
    ).toBe('error');
    expect(
      resolveAnswerCardStatus({
        hasAnswer: false,
        isSubmitting: false,
        answerError: null,
      }),
    ).toBe('unanswered');
  });
});
