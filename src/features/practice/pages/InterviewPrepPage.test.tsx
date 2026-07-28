// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InterviewPrepPage } from './InterviewPrepPage';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  setConsentAccepted: vi.fn(),
}));

const messages: Record<string, string> = {
  'practice.flow.prepare.title': 'Chuẩn bị phỏng vấn',
  'practice.flow.prepare.description': 'Kiểm tra thông tin trước khi bắt đầu.',
  'practice.session.loading': 'Đang tải phiên phỏng vấn...',
  'practice.session.loadErrorTitle': 'Không thể tải phiên phỏng vấn',
  'practice.session.loadErrorDescription':
    'Không thể tải thông tin phiên phỏng vấn. Vui lòng thử lại.',
  'practice.session.forbidden': 'Bạn không có quyền truy cập phiên phỏng vấn này.',
  'practice.session.notFound': 'Không tìm thấy phiên phỏng vấn.',
  'practice.session.missingSessionId': 'Không tìm thấy mã phiên phỏng vấn.',
  'practice.session.retry': 'Thử lại',
  'practice.session.backToPractice': 'Quay lại luyện tập',
  'practice.flow.prepare.checklistTitle': 'Danh sách chuẩn bị',
  'practice.flow.prepare.checklistHint': 'Hãy hoàn tất các bước.',
  'practice.flow.prepare.checkQuiet': 'Không gian yên tĩnh',
  'practice.flow.prepare.checkCamera': 'Camera sẵn sàng',
  'practice.flow.prepare.checkTime': 'Đủ thời gian',
  'practice.flow.prepare.consentPractice': 'Tôi đã sẵn sàng',
  'practice.flow.continue': 'Tiếp tục',
  'practice.flow.cancel': 'Hủy',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => messages[key] ?? key }),
}));

vi.mock('../services/practiceSession.service', () => ({
  practiceSessionService: {
    getSession: (...args: unknown[]) => mocks.getSession(...args),
  },
}));

vi.mock('../hooks/useInterviewFlowSession', () => ({
  useInterviewFlowSession: vi.fn(),
}));

vi.mock('../hooks/useInterviewGate', () => ({
  useInterviewGate: () => ({
    isLoading: false,
    canStart: true,
    meetsProfileGate: true,
    hasCredits: true,
    completenessPercent: 100,
    tokenAvailable: 10,
    reserveEstimate: 1,
  }),
}));

vi.mock('../stores/interviewFlowStore', () => ({
  useInterviewFlowStore: () => ({
    consentAccepted: false,
    setConsentAccepted: mocks.setConsentAccepted,
  }),
}));

vi.mock('../components/flow/InterviewFlowShell', () => ({
  InterviewFlowShell: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}));

vi.mock('../components/flow/InterviewGatePanel', () => ({
  InterviewGatePanel: () => <div>Interview gate</div>,
}));

const session = {
  sessionId: 'session-123',
  title: '',
  description: '',
  jobCategory: 'FE',
  status: 'ready' as const,
  questions: [],
};

function renderPage(path = '/interview/session-123/prepare', strict = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const page = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/interview/:sessionId/prepare" element={<InterviewPrepPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(strict ? <StrictMode>{page}</StrictMode> : page);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('InterviewPrepPage session loading', () => {
  it('shows loading without rendering preparation content', () => {
    mocks.getSession.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText('Đang tải phiên phỏng vấn...')).toBeInTheDocument();
    expect(screen.queryByText('Danh sách chuẩn bị')).not.toBeInTheDocument();
  });

  it('loads once with the route session id and renders the session data', async () => {
    mocks.getSession.mockResolvedValue(session);
    renderPage('/interview/session-123/prepare', true);

    expect(await screen.findByText('Danh sách chuẩn bị')).toBeInTheDocument();
    expect(screen.getByText('FE')).toBeInTheDocument();
    expect(screen.queryByText('Không thể tải phiên phỏng vấn')).not.toBeInTheDocument();
    expect(mocks.getSession).toHaveBeenCalledOnce();
    expect(mocks.getSession).toHaveBeenCalledWith('session-123');
  });

  it.each([
    [403, 'Bạn không có quyền truy cập phiên phỏng vấn này.'],
    [404, 'Không tìm thấy phiên phỏng vấn.'],
  ])('renders the mapped %s error without a request loop', async (status, message) => {
    mocks.getSession.mockRejectedValue({
      isAxiosError: true,
      response: { status },
    });
    renderPage();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(mocks.getSession).toHaveBeenCalledOnce();
  });

  it('retries exactly once from the error action', async () => {
    mocks.getSession
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 403 } })
      .mockResolvedValueOnce(session);
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Danh sách chuẩn bị')).toBeInTheDocument();
    expect(mocks.getSession).toHaveBeenCalledTimes(2);
  });

  it.each(['undefined', 'null'])(
    'does not call the API for invalid route session id %s',
    async (invalidId) => {
      renderPage(`/interview/${invalidId}/prepare`);

      expect(
        await screen.findByText('Không tìm thấy mã phiên phỏng vấn.'),
      ).toBeInTheDocument();
      expect(mocks.getSession).not.toHaveBeenCalled();
    },
  );
});
