/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FullscreenExitBanner } from './FullscreenExitBanner';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

describe('FullscreenExitBanner', () => {
  let fullscreenElement: Element | null;
  let requestFullscreen: ReturnType<typeof vi.fn>;
  let exitFullscreenSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fullscreenElement = null;
    requestFullscreen = vi.fn(async () => {
      fullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    // ⚠ `document.exitFullscreen` PHẢI được mock cho MỌI test. Trước đây nó không được mock, nên
    // `exitInterviewFullscreen` thoát sớm ở guard `!document.exitFullscreen` ⇒ toàn bộ nhánh
    // teardown chưa từng chạy dòng nào trong test — và đó đúng là nhánh đã gây lỗi "đếm ngược
    // đứng ở 3" trên production.
    exitFullscreenSpy = vi.fn(async () => {
      fullscreenElement = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreenSpy,
    });
  });

  afterEach(async () => {
    cleanup();
    // Tháo component hẹn một lượt thoát fullscreen ở nhịp kế. Không xả ở đây thì nó nổ giữa test
    // SAU và làm hỏng test đó theo kiểu rất khó lần — đúng cái bẫy đã làm bài test này đỏ lần đầu.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  function exitFullscreen() {
    fullscreenElement = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));
    fullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
  }

  it('blocks after fullscreen exit and only closes after fullscreen is restored', async () => {
    const onBlockingChange = vi.fn();
    render(<FullscreenExitBanner onBlockingChange={onBlockingChange} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    exitFullscreen();

    const dialog = await screen.findByRole('dialog', {
      name: 'practice.fullscreen.exitedTitle',
    });
    expect(dialog).toBeVisible();
    expect(onBlockingChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard('{Escape}');
    expect(dialog).toBeVisible();

    await userEvent.click(screen.getByRole('button', {
      name: 'practice.fullscreen.reenter',
    }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(onBlockingChange).toHaveBeenLastCalledWith(false);
  });

  // Lỗi thật: ứng viên bấm "Bắt đầu" ở phòng chờ → vào toàn màn hình → vòng đếm ĐỨNG Ở 3, phải F5
  // mới chạy. Nguyên nhân: StrictMode chạy effect → cleanup → effect ngay trong cùng nhịp mount,
  // cleanup gọi `exitInterviewFullscreen()` huỷ đúng cái fullscreen vừa bật, rồi listener của lần
  // mount thứ hai đọc sự kiện thoát đó thành VI PHẠM ⇒ `onBlockingChange(true)` ⇒ `violationPaused`
  // ⇒ `useB2cPracticeRoom` return sớm trong vòng `setInterval` ⇒ số đếm không nhúc nhích.
  //
  // ⚠ Bộ test cũ không bắt được vì nó KHÔNG mock `document.exitFullscreen` — nhánh teardown thoát
  // sớm ở guard `!document.exitFullscreen`, tức đường gây lỗi chưa từng được chạy lần nào.
  it('không coi lượt thoát do chính mình gọi là vi phạm (StrictMode gắn-tháo-gắn)', async () => {
    // Vào phòng thi khi ĐANG toàn màn hình — đúng trạng thái sau khi bấm "Bắt đầu" ở phòng chờ.
    fullscreenElement = document.documentElement;

    const onBlockingChange = vi.fn();
    render(
      <StrictMode>
        <FullscreenExitBanner onBlockingChange={onBlockingChange} />
      </StrictMode>,
    );

    // Lượt thoát bị HOÃN một nhịp và bị huỷ khi effect chạy lại; chờ qua nhịp đó rồi mới khẳng định.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(exitFullscreenSpy).not.toHaveBeenCalled();
    expect(document.fullscreenElement).toBe(document.documentElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onBlockingChange).not.toHaveBeenCalledWith(true);
  });

  it('tháo THẬT thì vẫn thoát toàn màn hình, và lượt thoát đó không bị tính là vi phạm', async () => {
    fullscreenElement = document.documentElement;

    const onBlockingChange = vi.fn();
    const view = render(<FullscreenExitBanner onBlockingChange={onBlockingChange} />);
    view.unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(exitFullscreenSpy).toHaveBeenCalledTimes(1);
    expect(onBlockingChange).not.toHaveBeenCalledWith(true);
  });

  it('keeps the dialog open and shows retry feedback when recovery fails', async () => {
    requestFullscreen.mockImplementationOnce(async () => undefined);
    render(<FullscreenExitBanner />);
    exitFullscreen();

    await userEvent.click(await screen.findByRole('button', {
      name: 'practice.fullscreen.reenter',
    }));

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('practice.fullscreen.reenterFailed');
  });
});
