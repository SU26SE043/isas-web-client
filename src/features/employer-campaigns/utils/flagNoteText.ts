import {
  CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX,
  CAMPAIGN_FLAG_NOTES,
  type CampaignFlagNoteName,
} from '@/shared/domain/campaignFlagNotes';

type Translate = (key: string) => string;

export function flagNoteKey(name: CampaignFlagNoteName): string {
  return `employer.campaigns.results.flagNotes.${name}`;
}

// Dựng từ CÙNG hằng số phòng thi gửi đi: thêm/sửa một câu ở đó thì bảng dịch đi theo, không trôi.
const KNOWN_NOTE_KEYS: Record<string, string> = Object.fromEntries(
  (Object.entries(CAMPAIGN_FLAG_NOTES) as [CampaignFlagNoteName, string][])
    .map(([name, note]) => [note, flagNoteKey(name)]),
);

/**
 * Marker dedup mà `MonitoringGapSweeper` (server) gắn cuối ghi chú: `[gap#<ticks>]` (LUẬT 1) và
 * `[monitor#none]` (LUẬT 2). Chỉ để server khỏi ghi trùng — HR đọc vào chỉ thấy mã rác.
 */
const SERVER_NOTE_MARKER = /\s*\[(?:gap#\d+|monitor#none)\]\s*$/;

/** Ghi chú mang marker của server ⇒ cờ do server suy ra, mốc giờ là lúc server QUÉT, không phải lúc xảy ra. */
export function isServerMarkedNote(note: string | null | undefined): boolean {
  return Boolean(note && SERVER_NOTE_MARKER.test(note));
}

/** Translate FE-generated anti-cheat notes while leaving unknown (server) notes readable. */
export function flagNoteText(note: string, t: Translate): string {
  const trimmed = note.replace(SERVER_NOTE_MARKER, '').trim();
  const recovery = trimmed.endsWith(CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX);
  const base = recovery ? trimmed.slice(0, -CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX.length) : trimmed;
  const key = KNOWN_NOTE_KEYS[base];
  if (!key) return trimmed;
  const translated = t(key);
  return recovery ? `${translated} ${t('employer.campaigns.results.flagNotes.recoverySuffix')}` : translated;
}
