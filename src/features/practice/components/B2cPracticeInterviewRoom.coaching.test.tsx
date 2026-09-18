/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { B2cPracticeInterviewRoom } from './B2cPracticeInterviewRoom';

// Khoá KHE NỐI room → useB2cRoomCoaching (đúng lớp lỗ AC1 27/08: hook có test, page có test, dây giữa
// hai bên không). Mutation "truyền hằng số" (`uploadInFlight: false`, `completed: false`) từng chạy qua
// 589/589 XANH vì file room không có test nào ⇒ kiểm mặt chen vào lúc upload câu trả lời và chạy tiếp
// sau khi nộp bài mà không gì kêu. Fixture cố ý chọn giá trị KHÁC mặc định của hook để hằng số bị lộ.

const coachingSpy = vi.fn((_opts: unknown) => ({ cameraAlwaysOn: false }));
vi.mock('../hooks/useB2cRoomCoaching', () => ({
  useB2cRoomCoaching: (opts: unknown) => coachingSpy(opts),
}));

const videoRef = { current: null as HTMLVideoElement | null };
const roomState = {
  isLoading: true,                 // dừng ở spinner: hook coaching đã được gọi TRƯỚC nhánh này
  phase: 'answering',
  isSubmittingAnswer: true,        // ≠ mặc định false của hook
  interviewComplete: true,         // ≠ mặc định false của hook
  isSubmittingSession: false,
  confirmFinish: vi.fn(),
  media: { videoRef, state: 'ready', stream: null, startMedia: vi.fn() },
};
vi.mock('../hooks/useB2cPracticeRoom', () => ({
  useB2cPracticeRoom: () => roomState,
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => Object.assign(vi.fn(), { length: 0 }) }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn() }) }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (k: string) => k, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false }));

afterEach(() => {
  cleanup();
  coachingSpy.mockClear();
});

describe('B2cPracticeInterviewRoom → useB2cRoomCoaching (khe nối)', () => {
  it('truyền ĐÚNG phase/videoRef/uploadInFlight/completed của room, không phải hằng số', () => {
    render(<B2cPracticeInterviewRoom sessionId="s-1" completePath="/done" />);

    expect(coachingSpy).toHaveBeenCalled();
    const args = coachingSpy.mock.calls[0]![0] as Record<string, unknown>;
    expect(args).toMatchObject({
      sessionId: 's-1',
      phase: 'answering',
      uploadInFlight: true,
      completed: true,
    });
    expect(args.videoRef).toBe(videoRef);   // cùng ref với camera panel — không phải ref mới tạo
  });

  it('đổi trạng thái room ⇒ hook nhận giá trị mới ở lần render kế (không ghim lần đầu)', () => {
    const { rerender } = render(<B2cPracticeInterviewRoom sessionId="s-1" completePath="/done" />);
    roomState.isSubmittingAnswer = false;
    roomState.interviewComplete = false;
    roomState.phase = 'reading';
    rerender(<B2cPracticeInterviewRoom sessionId="s-1" completePath="/done" />);

    const last = coachingSpy.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(last).toMatchObject({ phase: 'reading', uploadInFlight: false, completed: false });
  });
});
