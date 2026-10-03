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

/** Translate FE-generated anti-cheat notes while leaving unknown (server) notes readable. */
export function flagNoteText(note: string, t: Translate): string {
  const trimmed = note.trim();
  const recovery = trimmed.endsWith(CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX);
  const base = recovery ? trimmed.slice(0, -CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX.length) : trimmed;
  const key = KNOWN_NOTE_KEYS[base];
  if (!key) return trimmed;
  const translated = t(key);
  return recovery ? `${translated} ${t('employer.campaigns.results.flagNotes.recoverySuffix')}` : translated;
}
