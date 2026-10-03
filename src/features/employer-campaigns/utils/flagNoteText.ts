type Translate = (key: string) => string;

const KNOWN_NOTE_KEYS: Record<string, string> = {
  'Candidate exited fullscreen mode.': 'employer.campaigns.results.flagNotes.fullscreenExit',
  'Candidate switched away from the interview tab.': 'employer.campaigns.results.flagNotes.tabSwitch',
  'Candidate left the interview window using Alt+Tab or window switching.': 'employer.campaigns.results.flagNotes.windowSwitch',
  'Candidate lost focus from the interview window.': 'employer.campaigns.results.flagNotes.focusLost',
  'Candidate attempted to paste content during the interview.': 'employer.campaigns.results.flagNotes.paste',
  'Candidate camera became unavailable during the interview.': 'employer.campaigns.results.flagNotes.cameraUnavailable',
};

const RECOVERY_SUFFIX = ' (đang khắc phục thiết bị)';

/** Translate legacy FE-generated anti-cheat notes while leaving unknown server notes readable. */
export function flagNoteText(note: string, t: Translate): string {
  const trimmed = note.trim();
  const recovery = trimmed.endsWith(RECOVERY_SUFFIX);
  const base = recovery ? trimmed.slice(0, -RECOVERY_SUFFIX.length) : trimmed;
  const key = KNOWN_NOTE_KEYS[base];
  if (!key) return note;
  const translated = t(key);
  return recovery ? `${translated} ${t('employer.campaigns.results.flagNotes.recoverySuffix')}` : translated;
}
