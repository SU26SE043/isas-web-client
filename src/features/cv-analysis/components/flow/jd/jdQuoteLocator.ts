/**
 * Locate a `jdQuote` inside the JD text the user can see.
 *
 * X4 — `jdQuote` is NOT a byte-exact substring of `jdText`. AIService accepts a
 * quote when `find_verbatim` (`providers/gemini.py`) finds it, and that check is
 * deliberately forgiving:
 *
 *   NFKC · nbsp/thin-space → space · smart quotes and dashes folded · casefold
 *   · every space becomes `\s+` · every hyphen becomes `(?:-|\s)?`
 *   · fallback that drops whitespace and hyphens entirely
 *
 * A naive `jdText.indexOf(quote)` therefore misses a real share of *valid*
 * quotes, and "Xem trong JD" would silently do nothing on those rows — a bug
 * nobody reports because it looks like the requirement simply has no source.
 * This module mirrors the backend rule set so the two agree.
 */

export interface JdQuoteRange {
  /** Index in the ORIGINAL `jdText` (what the textarea holds). */
  start: number;
  end: number;
}

const SPACE_LIKE = /[\u00a0\u2007\u2009\u202f]/g;
const DOUBLE_QUOTE_LIKE = /[\u201c\u201d]/g;
const SINGLE_QUOTE_LIKE = /[\u2018\u2019]/g;
const HYPHEN_LIKE = /[\u2010\u2013\u2014]/g;

/**
 * One base code point plus any combining marks. Folding per *cluster* (rather
 * than per code point) makes `e` + U+0301 and a precomposed `é` fold to the
 * same character, so a quote and a JD that disagree about NFC/NFD still match.
 */
const CLUSTER_PATTERN = /.\p{M}*/gsu;

function translate(value: string): string {
  return value
    .replace(SPACE_LIKE, ' ')
    .replace(DOUBLE_QUOTE_LIKE, '"')
    .replace(SINGLE_QUOTE_LIKE, "'")
    .replace(HYPHEN_LIKE, '-');
}

function foldCluster(cluster: string): string {
  return translate(cluster.normalize('NFKC')).toLowerCase();
}

interface FoldedText {
  text: string;
  /** `starts[i]` / `ends[i]` — span in the original string for folded char `i`. */
  starts: number[];
  ends: number[];
}

function foldText(source: string): FoldedText {
  const chars: string[] = [];
  const starts: number[] = [];
  const ends: number[] = [];
  CLUSTER_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CLUSTER_PATTERN.exec(source)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    for (const char of foldCluster(match[0])) {
      chars.push(char);
      starts.push(start);
      ends.push(end);
    }
    if (match[0].length === 0) CLUSTER_PATTERN.lastIndex += 1;
  }
  return { text: chars.join(''), starts, ends };
}

/** Only the characters that are special *outside* a character class. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build the tolerant matcher for an already-folded quote.
 * Mirrors `re.escape(evidence)` + `\ → \s+` + `\- → (?:-|\s)?`.
 */
export function buildJdQuotePattern(foldedQuote: string): RegExp | null {
  if (!foldedQuote) return null;
  let pattern = '';
  let previousWasSpace = false;
  for (const char of foldedQuote) {
    if (/\s/.test(char)) {
      if (!previousWasSpace) pattern += '\\s+';
      previousWasSpace = true;
      continue;
    }
    previousWasSpace = false;
    pattern += char === '-' ? '(?:-|\\s)?' : escapeRegExp(char);
  }
  try {
    return new RegExp(pattern, 'u');
  } catch {
    return null;
  }
}

export interface JdQuoteLocator {
  (quote: string | null | undefined): JdQuoteRange | null;
}

/**
 * Fold `jdText` once, then reuse it for every requirement row. The list asks
 * "can this quote be shown?" for up to 20 rows on every render; folding a
 * 20k-character JD each time would be wasteful.
 */
export function createJdQuoteLocator(jdText: string): JdQuoteLocator {
  const doc = foldText(jdText ?? '');
  const compactChars: string[] = [];
  const compactIndexes: number[] = [];
  for (let index = 0; index < doc.text.length; index += 1) {
    const char = doc.text[index];
    if (/\s/.test(char) || char === '-') continue;
    compactChars.push(char);
    compactIndexes.push(index);
  }
  const compactText = compactChars.join('');

  return (quote) => {
    if (!quote || !doc.text) return null;
    const foldedQuote = foldText(quote).text.trim();
    if (!foldedQuote) return null;
    const compactQuote = foldedQuote.replace(/[\s-]+/g, '');
    // A quote made only of separators would match everywhere — the backend
    // rejects it too.
    if (!compactQuote) return null;

    const pattern = buildJdQuotePattern(foldedQuote);
    const match = pattern ? pattern.exec(doc.text) : null;
    if (match && match[0].length > 0) {
      return {
        start: doc.starts[match.index],
        end: doc.ends[match.index + match[0].length - 1],
      };
    }

    // PDF extraction sometimes injects a hyphen + newline mid-word
    // (`micro-\nservices`); compare with every separator removed.
    const compactStart = compactText.indexOf(compactQuote);
    if (compactStart < 0) return null;
    const firstFolded = compactIndexes[compactStart];
    const lastFolded = compactIndexes[compactStart + compactQuote.length - 1];
    return { start: doc.starts[firstFolded], end: doc.ends[lastFolded] };
  };
}

/** One-shot convenience — prefer `createJdQuoteLocator` inside a list. */
export function locateJdQuote(jdText: string, quote: string | null | undefined): JdQuoteRange | null {
  return createJdQuoteLocator(jdText)(quote);
}
