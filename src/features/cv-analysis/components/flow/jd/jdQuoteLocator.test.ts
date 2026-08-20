import { describe, expect, it } from 'vitest';
import { createJdQuoteLocator, locateJdQuote } from './jdQuoteLocator';

/**
 * X4 — these cases are the ones a naive `jdText.indexOf(jdQuote)` gets wrong.
 * Every rule here mirrors `find_verbatim` in AIService (`providers/gemini.py`),
 * which is what decided the quote was valid in the first place.
 */
describe('locateJdQuote', () => {
  const slice = (text: string, quote: string | null) => {
    const range = locateJdQuote(text, quote);
    return range ? text.slice(range.start, range.end) : null;
  };

  it('finds a byte-exact substring', () => {
    const jd = 'Yeu cau: 3 nam kinh nghiem ReactJS va TypeScript.';
    expect(locateJdQuote(jd, '3 nam kinh nghiem ReactJS')).toEqual({ start: 9, end: 34 });
  });

  it('ignores letter case', () => {
    const jd = 'Thanh thao ASP.NET Core va Entity Framework.';
    expect(slice(jd, 'asp.net core VA entity framework')).toBe('ASP.NET Core va Entity Framework');
  });

  it('collapses whitespace: a newline in the JD matches a space in the quote', () => {
    const jd = 'Kinh nghiem trien khai\n   RESTful API cho he thong lon.';
    expect(slice(jd, 'Kinh nghiem trien khai RESTful API')).toBe(
      'Kinh nghiem trien khai\n   RESTful API',
    );
  });

  it('treats a hyphen in the quote as optional in the JD', () => {
    const jd = 'Uu tien ung vien biet ASP.NET Core.';
    expect(slice(jd, 'ASP.NET-Core')).toBe('ASP.NET Core');
  });

  it('treats a hyphen in the JD as optional for the quote', () => {
    const jd = 'Uu tien ung vien biet ASP.NET-Core.';
    expect(slice(jd, 'ASP.NET Core')).toBe('ASP.NET-Core');
  });

  it('matches across a hyphen + newline injected by PDF extraction', () => {
    const jd = 'Kien truc micro-\nservices tren Kubernetes.';
    expect(slice(jd, 'microservices tren Kubernetes')).toBe('micro-\nservices tren Kubernetes');
  });

  it('folds non-breaking and thin spaces', () => {
    const jd = 'Bat buoc:\u00a0Docker\u2009va CI/CD.';
    expect(slice(jd, 'Docker va CI/CD')).toBe('Docker\u2009va CI/CD');
  });

  it('folds smart quotes and en/em dashes', () => {
    const jd = 'Vi tri \u201cSenior Backend\u201d \u2013 lam viec tai Ha Noi.';
    expect(slice(jd, '"Senior Backend" - lam viec')).toBe(
      '\u201cSenior Backend\u201d \u2013 lam viec',
    );
  });

  it('matches a decomposed JD against a precomposed quote', () => {
    const precomposed = 'Ky nang giao ti\u00e9p tot';
    const decomposed = 'Ky nang giao tie\u0301p tot';
    const jd = `Yeu cau khac: ${decomposed}.`;
    const range = locateJdQuote(jd, precomposed);
    expect(range).not.toBeNull();
    expect(jd.slice(range!.start, range!.end)).toBe(decomposed);
  });

  it('returns null when the quote is not in the JD', () => {
    const jd = 'Yeu cau: 3 nam kinh nghiem ReactJS.';
    expect(locateJdQuote(jd, 'Kinh nghiem Kubernetes')).toBeNull();
  });

  it('returns null for empty, blank or separator-only quotes', () => {
    const jd = 'Yeu cau: 3 nam kinh nghiem ReactJS.';
    expect(locateJdQuote(jd, '')).toBeNull();
    expect(locateJdQuote(jd, '   ')).toBeNull();
    expect(locateJdQuote(jd, ' - -- ')).toBeNull();
    expect(locateJdQuote(jd, null)).toBeNull();
    expect(locateJdQuote(jd, undefined)).toBeNull();
  });

  it('returns null when the JD is empty', () => {
    expect(locateJdQuote('', 'anything')).toBeNull();
  });

  it('does not let regex metacharacters in the quote match arbitrary text', () => {
    const jd = 'Ky nang: C++ va Node.js.';
    expect(slice(jd, 'C++ va Node.js')).toBe('C++ va Node.js');
    expect(locateJdQuote(jd, 'C.. va Node?js')).toBeNull();
  });

  it('reuses one folded document across quotes', () => {
    const jd = 'Bat buoc: Docker, Kubernetes.\nUu tien: Kafka.';
    const locate = createJdQuoteLocator(jd);
    expect(locate('Docker, Kubernetes')).toEqual({ start: 10, end: 28 });
    expect(locate('Uu tien: Kafka')).not.toBeNull();
    expect(locate('Terraform')).toBeNull();
  });
});
