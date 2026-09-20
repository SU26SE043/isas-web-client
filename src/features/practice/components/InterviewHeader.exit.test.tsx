// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { InterviewHeader } from './InterviewHeader';

vi.mock('../../../shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <span>logo</span> }));

afterEach(() => cleanup());

function renderAt(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/interview/s1/room']}>
      <Routes>
        <Route path="/interview/:id/room" element={ui} />
        <Route path="/interview/:id/complete" element={<div>COMPLETE_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('InterviewHeader — nút Thoát (CAMP-21)', () => {
  it('có onExit ⇒ gọi callback, KHÔNG điều hướng sang /complete', async () => {
    const onExit = vi.fn();
    renderAt(<InterviewHeader sessionId="s1" isRecording={false} onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: 'practice.exit' }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('COMPLETE_PAGE')).toBeNull();
  });

  it('không có onExit ⇒ giữ hành vi cũ: điều hướng /complete', async () => {
    renderAt(<InterviewHeader sessionId="s1" isRecording={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'practice.exit' }));
    expect(screen.getByText('COMPLETE_PAGE')).toBeInTheDocument();
  });
});
