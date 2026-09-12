/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StoredCampaignInterview } from '../utils/campaignInterviewSession';

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';

let storedSession: StoredCampaignInterview | null = null;
let deviceReady: ((sessionId: string) => void) | undefined;

vi.mock('../utils/campaignInterviewSession', () => ({
  readCampaignInterviewSession: () => storedSession,
}));

// Trang chuẩn bị B2C giữ nguyên; ở đây chỉ cần bắt callback nó gọi khi kiểm thiết bị xong.
vi.mock('@/features/practice/pages/InterviewPrepPage', () => ({
  InterviewPrepPage: ({ onCampaignDeviceReady }: { onCampaignDeviceReady?: (id: string) => void }) => {
    deviceReady = onCampaignDeviceReady;
    return <div data-testid="prep" />;
  },
}));

import { CampaignInterviewPreparationPage } from './CampaignInterviewPreparationPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/interview/:sessionId/prepare" element={<CampaignInterviewPreparationPage />} />
        <Route path="/candidate/campaigns/:campaignId/face-enroll/:sessionId" element={<div data-testid="face-enroll" />} />
        <Route path="/candidate/campaigns/:campaignId/interview/:sessionId" element={<div data-testid="room" />} />
        <Route path="/interview/:sessionId/terms" element={<div data-testid="terms" />} />
      </Routes>
    </MemoryRouter>,
  );
}

const marker = (faceEnrollRequired: boolean): StoredCampaignInterview => ({
  mode: 'b2b-campaign',
  campaignId: CAMPAIGN_ID,
  sessionId: SESSION_ID,
  antiCheatEnabled: true,
  faceEnrollRequired,
  adaptiveEnabled: true,
  deadlineAt: null,
  questions: [],
  startedAt: '2026-09-12T00:00:00Z',
});

afterEach(() => {
  cleanup();
  storedSession = null;
  deviceReady = undefined;
});

/**
 * Sau bước kiểm thiết bị, campaign KHÔNG bật xác minh khuôn mặt phải vào thẳng phòng — không đi qua
 * `/terms` → `/identity` của luồng B2C (trang "Xác minh danh tính" chụp ảnh chỉ nằm trong store, không
 * lên server; trang điều khoản hứa "đối chiếu khuôn mặt" cho campaign đã tắt tính năng đó).
 */
describe('CampaignInterviewPreparationPage — rẽ nhánh sau kiểm thiết bị', () => {
  it('faceEnrollRequired=false ⇒ vào thẳng phòng, không qua điều khoản/xác minh', () => {
    storedSession = marker(false);
    const view = renderAt(`/interview/${SESSION_ID}/prepare`);
    expect(deviceReady).toBeDefined();
    act(() => deviceReady?.(SESSION_ID));
    expect(view.getByTestId('room')).toBeInTheDocument();
    expect(view.queryByTestId('terms')).not.toBeInTheDocument();
  });

  it('faceEnrollRequired=true ⇒ sang trang enroll khuôn mặt thật', () => {
    storedSession = marker(true);
    const view = renderAt(`/interview/${SESSION_ID}/prepare`);
    act(() => deviceReady?.(SESSION_ID));
    expect(view.getByTestId('face-enroll')).toBeInTheDocument();
  });

  it('không có marker campaign ⇒ render trang chuẩn bị B2C thuần, không cấp callback', () => {
    storedSession = null;
    const view = renderAt(`/interview/${SESSION_ID}/prepare`);
    expect(view.getByTestId('prep')).toBeInTheDocument();
    expect(deviceReady).toBeUndefined();
  });
});
