/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampaignCandidateError, campaignCandidateService } from '../services/campaignCandidate.service';
import {
  __resetCampaignFlagQueueForTests,
  enqueueCampaignFlag,
  flushCampaignFlagQueue,
  pendingCampaignFlagCount,
} from './campaignFlagQueue';

vi.mock('../services/campaignCandidate.service', async () => {
  const actual = await vi.importActual<typeof import('../services/campaignCandidate.service')>(
    '../services/campaignCandidate.service',
  );
  return {
    ...actual,
    campaignCandidateService: { createCampaignFlag: vi.fn() },
  };
});

const createFlag = vi.mocked(campaignCandidateService.createCampaignFlag);
const CAMPAIGN = 'c1';
const SESSION = 's1';

beforeEach(() => {
  __resetCampaignFlagQueueForTests();
  createFlag.mockReset();
  createFlag.mockResolvedValue(undefined);
});

afterEach(() => {
  __resetCampaignFlagQueueForTests();
  vi.useRealTimers();
});

describe('hàng đợi cờ chống gian lận', () => {
  it('GHI vào localStorage TRƯỚC khi gửi — đóng tab giữa chừng không mất cờ', () => {
    // Không await: bắt đúng khoảnh khắc request còn đang bay.
    createFlag.mockImplementation(() => new Promise(() => {}));

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'rời tab');

    expect(pendingCampaignFlagCount()).toBe(1);
    const raw = localStorage.getItem('isas-campaign-flag-queue');
    expect(raw).toContain('tab_switch');
  });

  it('gửi xong thì gỡ khỏi hàng đợi', async () => {
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'paste', 'dán');
    await flushCampaignFlagQueue();

    expect(createFlag).toHaveBeenCalledWith(CAMPAIGN, SESSION, {
      signalType: 'paste',
      note: 'dán',
    });
    expect(pendingCampaignFlagCount()).toBe(0);
  });

  it('MẤT MẠNG (không có status) thì GIỮ LẠI để gửi lần sau', async () => {
    // Đây là ca cũ làm mất cờ vĩnh viễn: `.catch(() => undefined)` nuốt rồi thôi.
    createFlag.mockRejectedValue(new Error('Network Error'));

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'rời tab');
    await flushCampaignFlagQueue();

    expect(pendingCampaignFlagCount()).toBe(1);
  });

  it('lần vào sau đẩy nốt phần còn tồn của tab trước', async () => {
    createFlag.mockRejectedValueOnce(new Error('Network Error'));
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'focus_lost', 'mất focus');
    await flushCampaignFlagQueue();
    expect(pendingCampaignFlagCount()).toBe(1);

    // Mạng trở lại (hoặc mở lại trang) → flush lần nữa.
    createFlag.mockResolvedValue(undefined);
    await flushCampaignFlagQueue();

    expect(pendingCampaignFlagCount()).toBe(0);
    expect(createFlag).toHaveBeenCalledTimes(2);
  });

  it('mất mạng ĐÃ BỌC (status undefined) vẫn phải GIỮ LẠI — đây mới là đường thật', async () => {
    // `createCampaignFlag` luôn bọc lỗi qua `toCampaignCandidateError`, nên khi mất mạng thứ
    // hàng đợi nhận được là `CampaignCandidateError` với `status === undefined`, KHÔNG phải
    // `Error` trần. Test dùng `Error` trần thoát sớm ở nhánh `instanceof` nên không phủ
    // được dòng này — mutation "coi undefined là từ chối" từng chạy qua XANH vì vậy.
    createFlag.mockRejectedValue(new CampaignCandidateError('serverError', 'Network Error', undefined));

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'rời tab');
    await flushCampaignFlagQueue();

    expect(pendingCampaignFlagCount()).toBe(1);
  });

  it('lỗi 4xx là từ chối dứt khoát — BỎ, không thử lại vô ích', async () => {
    createFlag.mockRejectedValue(new CampaignCandidateError('forbidden', 'không phải chủ phiên', 403));

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'x');
    await flushCampaignFlagQueue();

    expect(pendingCampaignFlagCount()).toBe(0);
    expect(createFlag).toHaveBeenCalledTimes(1);
  });

  it('5xx / 429 thì VẪN thử lại (server bảo thử lại, không phải từ chối)', async () => {
    createFlag.mockRejectedValue(new CampaignCandidateError('serverError', 'lỗi máy chủ', 503));
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'x');
    await flushCampaignFlagQueue();
    expect(pendingCampaignFlagCount()).toBe(1);

    __resetCampaignFlagQueueForTests();
    createFlag.mockRejectedValue(new CampaignCandidateError('conflict', 'quá nhiều', 429));
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'paste', 'x');
    await flushCampaignFlagQueue();
    expect(pendingCampaignFlagCount()).toBe(1);
  });

  it('một cờ hỏng KHÔNG chặn những cờ phía sau (bài học poison message)', async () => {
    createFlag
      .mockRejectedValueOnce(new CampaignCandidateError('conflict', 'loại cờ không hợp lệ', 400))
      .mockResolvedValueOnce(undefined);

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'hỏng');
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'paste', 'tốt');

    // `enqueue` tự kích hoạt flush nền, nên phải CHỜ nó lắng chứ không giả định đã xong —
    // await trên một flush bị khoá `flushing` sẽ trả về ngay và ta đo nhầm trạng thái giữa chừng.
    await vi.waitFor(() => expect(pendingCampaignFlagCount()).toBe(0));

    expect(createFlag).toHaveBeenLastCalledWith(CAMPAIGN, SESSION, {
      signalType: 'paste',
      note: 'tốt',
    });
  });

  it('cờ thêm vào TRONG LÚC đang gửi không bị ghi đè mất', async () => {
    // Bản đầu giữ ảnh chụp hàng đợi rồi ghi đè lúc kết thúc ⇒ xoá mất cờ đến giữa chừng.
    // Cờ hay đến theo chùm (rời tab rồi dán ngay) nên đây là ca thường, không phải hiếm.
    let releaseFirst: (() => void) | null = null;
    createFlag.mockImplementationOnce(
      () => new Promise<void>((resolve) => { releaseFirst = () => resolve(); }),
    );

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'đầu tiên');
    await vi.waitFor(() => expect(releaseFirst).not.toBeNull());

    enqueueCampaignFlag(CAMPAIGN, SESSION, 'paste', 'chen vào giữa');
    releaseFirst!();

    await vi.waitFor(() => expect(pendingCampaignFlagCount()).toBe(0));
    expect(createFlag).toHaveBeenCalledTimes(2);
    expect(createFlag).toHaveBeenLastCalledWith(CAMPAIGN, SESSION, {
      signalType: 'paste',
      note: 'chen vào giữa',
    });
  });

  it('bỏ cuộc sau nhiều lần hỏng — không quay vòng vô hạn', async () => {
    createFlag.mockRejectedValue(new Error('Network Error'));
    enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'x');

    for (let i = 0; i < 8; i += 1) await flushCampaignFlagQueue();

    expect(pendingCampaignFlagCount()).toBe(0);
  });

  it('localStorage bị chặn thì KHÔNG ném — cờ là đường phụ, không được giết buổi thi', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => enqueueCampaignFlag(CAMPAIGN, SESSION, 'tab_switch', 'x')).not.toThrow();

    spy.mockRestore();
  });

  it('thiếu campaignId/sessionId thì không ghi gì', () => {
    enqueueCampaignFlag('', SESSION, 'tab_switch', 'x');
    enqueueCampaignFlag(CAMPAIGN, '', 'tab_switch', 'x');

    expect(pendingCampaignFlagCount()).toBe(0);
    expect(createFlag).not.toHaveBeenCalled();
  });
});
