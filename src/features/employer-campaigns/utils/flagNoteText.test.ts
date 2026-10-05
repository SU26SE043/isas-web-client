import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX,
  CAMPAIGN_FLAG_NOTES,
  type CampaignFlagNoteName,
} from '@/shared/domain/campaignFlagNotes';
import { employerCampaignTranslations } from '../languages/translations';
import { flagNoteKey, flagNoteText, isServerMarkedNote } from './flagNoteText';

describe('flagNoteText', () => {
  const t = (key: string) => `translated:${key}`;
  const names = Object.keys(CAMPAIGN_FLAG_NOTES) as CampaignFlagNoteName[];

  it('translates the known note and its device recovery variant', () => {
    expect(flagNoteText('Candidate lost focus from the interview window.', t)).toBe(
      'translated:employer.campaigns.results.flagNotes.focusLost',
    );
    expect(flagNoteText('Candidate lost focus from the interview window. (đang khắc phục thiết bị)', t)).toBe(
      'translated:employer.campaigns.results.flagNotes.focusLost translated:employer.campaigns.results.flagNotes.recoverySuffix',
    );
  });

  it('keeps an unknown (server) note readable, trimmed like the old rendering', () => {
    expect(flagNoteText('  New server detail  ', t)).toBe('New server detail');
  });

  // MonitoringGapSweeper gắn marker dedup cuối ghi chú — đó là mã cho server, HR đọc vào chỉ thấy rác.
  it('strips the server dedup markers [gap#…] / [monitor#none] and recognises them', () => {
    expect(flagNoteText('Khoảng trống 300s [gap#638950000000000000]', t)).toBe('Khoảng trống 300s');
    expect(flagNoteText('Không có ảnh nào suốt 4 phút [monitor#none]', t)).toBe('Không có ảnh nào suốt 4 phút');
    expect(isServerMarkedNote('x [gap#1]')).toBe(true);
    expect(isServerMarkedNote('x [monitor#none]')).toBe(true);
    expect(isServerMarkedNote('Candidate lost focus from the interview window.')).toBe(false);
    expect(isServerMarkedNote(null)).toBe(false);
    // Chỉ cắt marker ở CUỐI — chuỗi giống marker giữa câu là nội dung thật.
    expect(flagNoteText('[gap#1] ở đầu câu', t)).toBe('[gap#1] ở đầu câu');
  });

  // Mọi câu phòng thi gửi đi phải dịch được — thêm một câu ở hằng số mà quên khoá dịch thì HR lại thấy
  // tiếng Anh thô (hoặc tên khoá) mà không test nào khác kêu.
  it.each(names)('translates the "%s" note the exam room sends, in both languages', (name) => {
    expect(flagNoteText(CAMPAIGN_FLAG_NOTES[name], t)).toBe(`translated:${flagNoteKey(name)}`);
    expect(flagNoteText(`${CAMPAIGN_FLAG_NOTES[name]}${CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX}`, t)).toBe(
      `translated:${flagNoteKey(name)} translated:employer.campaigns.results.flagNotes.recoverySuffix`,
    );
    expect(employerCampaignTranslations.vi[flagNoteKey(name)]).toBeTruthy();
    expect(employerCampaignTranslations.en[flagNoteKey(name)]).toBeTruthy();
  });
});
