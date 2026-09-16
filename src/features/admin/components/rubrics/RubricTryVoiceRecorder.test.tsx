// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { AudioRecorderState } from '@/features/practice/types/audioRecorder.types';
import { RubricTryVoiceRecorder } from './RubricTryVoiceRecorder';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const recorder = {
  state: { status: 'idle', elapsedSeconds: 0, maxDurationSeconds: 180, audioBlob: null, audioFile: null, previewUrl: null, errorMessage: null, errorKind: null, playbackError: null, isPlaying: false, maxDurationReached: false, uploadProgress: null } as AudioRecorderState,
  audioElementRef: { current: null },
  startRecording: vi.fn(async () => undefined),
  stopRecording: vi.fn(),
  resetRecording: vi.fn(),
  replayAudio: vi.fn(),
  pausePreviewPlayback: vi.fn(),
  markSubmitting: vi.fn(),
  markSuccess: vi.fn(),
  markSubmitError: vi.fn(),
  restoreRecorded: vi.fn(),
};
const useAudioRecorderMock = vi.fn((_opts: unknown) => recorder);
vi.mock('@/features/practice/hooks/useAudioRecorder', () => ({ useAudioRecorder: (opts: unknown) => useAudioRecorderMock(opts) }));

const file = new File(['a'], 'answer.webm', { type: 'audio/webm' });
const setState = (patch: Partial<AudioRecorderState>) => { recorder.state = { ...recorder.state, ...patch }; };
afterEach(() => { cleanup(); vi.clearAllMocks(); setState({ status: 'idle', audioFile: null, previewUrl: null, errorKind: null, elapsedSeconds: 0 }); });

describe('RubricTryVoiceRecorder', () => {
  it('idle: nút "Bấm để nói" gọi startRecording; hook nhận khoá câu hỏi + trần 3 phút, không gắn buổi luyện nào', () => {
    render(<RubricTryVoiceRecorder questionKey="sample:q-1" transcribing={false} onTranscribe={vi.fn()} onReset={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.voice.start' }));
    expect(recorder.startRecording).toHaveBeenCalledTimes(1);
    expect(useAudioRecorderMock).toHaveBeenCalledWith({ sessionId: 'admin-rubric-try', questionId: 'sample:q-1', maxDurationSeconds: 180 });
  });

  it('recording: hiện đồng hồ và nút Dừng', () => {
    setState({ status: 'recording', elapsedSeconds: 42 });
    render(<RubricTryVoiceRecorder questionKey="k" transcribing={false} onTranscribe={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('00:42 / 03:00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.voice.stop' }));
    expect(recorder.stopRecording).toHaveBeenCalledTimes(1);
  });

  it('recorded: "Chép lời" là bước CHỦ ĐỘNG (không tự gửi) và mang đúng file; "Ghi lại" reset cả hook lẫn luồng', () => {
    setState({ status: 'recorded', audioFile: file, previewUrl: 'blob:x', elapsedSeconds: 30 });
    const onTranscribe = vi.fn(); const onReset = vi.fn();
    render(<RubricTryVoiceRecorder questionKey="k" transcribing={false} onTranscribe={onTranscribe} onReset={onReset} />);
    expect(onTranscribe).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.voice.transcribe' }));
    expect(onTranscribe).toHaveBeenCalledWith(file);
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.voice.retake' }));
    expect(recorder.resetRecording).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('đang chép lời: nút Chép lời khoá, hiện trạng thái "không tốn lượt"', () => {
    setState({ status: 'recorded', audioFile: file, previewUrl: 'blob:x' });
    render(<RubricTryVoiceRecorder questionKey="k" transcribing onTranscribe={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /admin\.rubrics\.try\.voice\.transcribe/ })).toBeDisabled();
    expect(screen.getByText('admin.rubrics.try.voice.transcribing')).toBeInTheDocument();   // Spinner cũng có role=status
  });

  it('bị chặn mic: nói thẳng cách mở lại + đường dán tay', () => {
    setState({ status: 'error', errorKind: 'permission-denied' });
    render(<RubricTryVoiceRecorder questionKey="k" transcribing={false} onTranscribe={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('admin.rubrics.try.voice.micDenied');
  });
});
