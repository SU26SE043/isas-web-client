import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/shared/languages';
import { campaignManagementService } from '../../../services/campaignManagement.service';
import { AnswerAudioPlayer, audioExtension } from './AnswerAudioPlayer';

// jsdom không có media pipeline: play()/pause() không tồn tại → stub, createObjectURL cũng vậy.
beforeEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: vi.fn().mockResolvedValue(undefined) });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: vi.fn() });
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:answer') as never;
  globalThis.URL.revokeObjectURL = vi.fn() as never;
});
afterEach(() => cleanup());

function renderPlayer() {
  return render(
    <LanguageProvider>
      <AnswerAudioPlayer campaignId="c1" sessionId="s1" answerId="a1" />
    </LanguageProvider>,
  );
}

describe('AnswerAudioPlayer', () => {
  it('KHÔNG tải bản ghi lúc mount — chỉ khi bấm phát lần đầu, và chỉ một lần', async () => {
    const get = vi
      .spyOn(campaignManagementService, 'getCampaignResultAnswerAudio')
      .mockResolvedValue(new Blob(['x'], { type: 'audio/mp4' }));
    renderPlayer();

    expect(get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /phát/i }));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(get).toHaveBeenCalledWith('c1', 's1', 'a1');
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());

    // Bấm dừng rồi phát lại → không tải lại.
    fireEvent.click(screen.getByRole('button', { name: /dừng/i }));
    fireEvent.click(screen.getByRole('button', { name: /phát/i }));
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('tải lỗi → hiện thông báo, không ném', async () => {
    vi.spyOn(campaignManagementService, 'getCampaignResultAnswerAudio').mockRejectedValue(new Error('404'));
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: /phát/i }));
    expect(await screen.findByText('Không tải được bản ghi')).toBeInTheDocument();
  });

  it('đổi tốc độ → playbackRate của <audio>; nút tải dùng đuôi theo MIME thật', async () => {
    vi.spyOn(campaignManagementService, 'getCampaignResultAnswerAudio')
      .mockResolvedValue(new Blob(['x'], { type: 'audio/mp4' }));
    const { container } = renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: /phát/i }));
    await waitFor(() => expect(container.querySelector('a[download]')).not.toBeNull());

    const audio = container.querySelector('audio') as HTMLAudioElement;
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: /tốc độ/i }), { target: { value: '1.5' } });
    });
    expect(audio.playbackRate).toBe(1.5);
    expect(container.querySelector('a[download]')?.getAttribute('download')).toBe('answer-a1.m4a');
  });

  it('hiện tổng thời lượng ngay khi metadata tải xong (không chờ timeupdate)', async () => {
    vi.spyOn(campaignManagementService, 'getCampaignResultAnswerAudio')
      .mockResolvedValue(new Blob(['x'], { type: 'audio/webm' }));
    const { container } = renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: /phát/i }));
    const audio = await waitFor(() => {
      const el = container.querySelector('audio') as HTMLAudioElement;
      expect(el.getAttribute('src')).toBe('blob:answer');
      return el;
    });
    Object.defineProperty(audio, 'duration', { configurable: true, value: 84 });
    fireEvent.loadedMetadata(audio);
    expect(screen.getByText('0:00 / 1:24')).toBeInTheDocument();
  });

  it('chỉ MỘT player phát tại một thời điểm', async () => {
    vi.spyOn(campaignManagementService, 'getCampaignResultAnswerAudio')
      .mockResolvedValue(new Blob(['x'], { type: 'audio/webm' }));
    render(
      <LanguageProvider>
        <AnswerAudioPlayer campaignId="c1" sessionId="s1" answerId="a1" />
        <AnswerAudioPlayer campaignId="c1" sessionId="s1" answerId="a2" />
      </LanguageProvider>,
    );
    const [first, second] = screen.getAllByRole('button', { name: /phát/i });
    fireEvent.click(first);
    await screen.findByRole('button', { name: /dừng/i });
    fireEvent.click(second);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /dừng/i })).toHaveLength(1));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});

describe('audioExtension', () => {
  it.each([
    ['audio/mp4', 'm4a'],
    ['audio/mp4; codecs=mp4a', 'm4a'],
    ['audio/wav', 'wav'],
    ['audio/mpeg', 'mp3'],
    ['audio/webm', 'webm'],
    [null, 'webm'],
  ])('%s → %s', (mime, ext) => {
    expect(audioExtension(mime)).toBe(ext);
  });
});
