import { describe, expect, it } from 'vitest';
import { flagNoteText } from './flagNoteText';

describe('flagNoteText', () => {
  const t = (key: string) => `translated:${key}`;

  it('translates the known note and its device recovery variant', () => {
    expect(flagNoteText('Candidate lost focus from the interview window.', t)).toBe(
      'translated:employer.campaigns.results.flagNotes.focusLost',
    );
    expect(flagNoteText('Candidate lost focus from the interview window. (đang khắc phục thiết bị)', t)).toBe(
      'translated:employer.campaigns.results.flagNotes.focusLost translated:employer.campaigns.results.flagNotes.recoverySuffix',
    );
  });

  it('preserves an unknown note verbatim apart from surrounding whitespace', () => {
    expect(flagNoteText('  New server detail  ', t)).toBe('  New server detail  ');
  });
});
