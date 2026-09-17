/* @vitest-environment jsdom */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';
import { useB2cFaceCheck } from './useB2cFaceCheck';
import { useB2cFocusTracking } from './useB2cFocusTracking';
import { useB2cRoomCoaching } from './useB2cRoomCoaching';

vi.mock('../stores/b2cPracticeInterviewStore', () => ({
  useB2cPracticeInterviewStore: vi.fn(),
}));
vi.mock('./useB2cCoachingNotices', () => ({
  useB2cCoachingNotices: vi.fn(() => ({ notify: vi.fn() })),
}));
vi.mock('./useB2cFaceCheck', () => ({ useB2cFaceCheck: vi.fn() }));
vi.mock('./useB2cFocusTracking', () => ({ useB2cFocusTracking: vi.fn() }));

const storeMock = vi.mocked(useB2cPracticeInterviewStore);
const faceCheckMock = vi.mocked(useB2cFaceCheck);
const focusTrackingMock = vi.mocked(useB2cFocusTracking);
const noticesMock = vi.mocked(useB2cCoachingNotices);

function mockStore(state: { focusTrackingEnabled: boolean; stage: string }) {
  storeMock.mockImplementation((selector: unknown) =>
    (selector as (s: { session: { focusTrackingEnabled: boolean } | null; stage: string }) => unknown)({
      session: { focusTrackingEnabled: state.focusTrackingEnabled },
      stage: state.stage,
    }),
  );
}

const videoRef = { current: null } as React.RefObject<HTMLVideoElement | null>;

describe('useB2cRoomCoaching', () => {
  beforeEach(() => {
    faceCheckMock.mockClear();
    focusTrackingMock.mockClear();
    noticesMock.mockClear();
    noticesMock.mockReturnValue({ notify: vi.fn() });
  });

  afterEach(() => cleanup());

  it('turns everything off when focusTrackingEnabled is false, regardless of phase', () => {
    mockStore({ focusTrackingEnabled: false, stage: 'interviewing' });
    renderHook(() =>
      useB2cRoomCoaching({
        sessionId: 's1', phase: 'answering', videoRef, uploadInFlight: false, completed: false,
      }),
    );

    expect(focusTrackingMock).toHaveBeenCalledWith('s1', false, expect.any(Function));
    expect(faceCheckMock.mock.calls[0][0]).toMatchObject({ enabled: false });
  });

  it('behavior tracking is gated live by stage+phase — off during countdown', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    renderHook(() =>
      useB2cRoomCoaching({
        sessionId: 's1', phase: 'countdown', videoRef, uploadInFlight: false, completed: false,
      }),
    );

    expect(focusTrackingMock).toHaveBeenCalledWith('s1', false, expect.any(Function));
  });

  it('behavior tracking turns on during reading/answering when enabled and interviewing', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    renderHook(() =>
      useB2cRoomCoaching({
        sessionId: 's1', phase: 'answering', videoRef, uploadInFlight: false, completed: false,
      }),
    );

    expect(focusTrackingMock).toHaveBeenCalledWith('s1', true, expect.any(Function));
  });

  it('face check LATCHES on once armed — stays on through a later countdown phase (resume)', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    const { rerender } = renderHook(
      (props: { phase: string }) =>
        useB2cRoomCoaching({
          sessionId: 's1', phase: props.phase, videoRef, uploadInFlight: false, completed: false,
        }),
      { initialProps: { phase: 'countdown' } },
    );
    // Lượt render đầu chạy TRƯỚC effect đặt `armed` — soi lượt gần nhất, không phải lượt đầu.
    expect(faceCheckMock.mock.calls.at(-1)![0]).toMatchObject({ enabled: true });

    rerender({ phase: 'loading' }); // e.g. transitioning between questions
    expect(faceCheckMock.mock.calls.at(-1)![0]).toMatchObject({ enabled: true });
  });

  it('face check is off before the buổi has ever armed (loading phase, never seen countdown/reading/answering)', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    renderHook(() =>
      useB2cRoomCoaching({
        sessionId: 's1', phase: 'loading', videoRef, uploadInFlight: false, completed: false,
      }),
    );

    expect(faceCheckMock.mock.calls.at(-1)![0]).toMatchObject({ enabled: false });
  });

  it('face check turns off when completed, even if armed', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    const { rerender } = renderHook(
      (props: { completed: boolean }) =>
        useB2cRoomCoaching({
          sessionId: 's1', phase: 'answering', videoRef, uploadInFlight: false, completed: props.completed,
        }),
      { initialProps: { completed: false } },
    );
    expect(faceCheckMock.mock.calls.at(-1)![0]).toMatchObject({ enabled: true });

    rerender({ completed: true });
    expect(faceCheckMock.mock.calls.at(-1)![0]).toMatchObject({ enabled: false });
  });

  it('returns cameraAlwaysOn mirroring focusTrackingEnabled', () => {
    mockStore({ focusTrackingEnabled: true, stage: 'interviewing' });
    const { result } = renderHook(() =>
      useB2cRoomCoaching({
        sessionId: 's1', phase: 'answering', videoRef, uploadInFlight: false, completed: false,
      }),
    );

    expect(result.current.cameraAlwaysOn).toBe(true);
  });
});
