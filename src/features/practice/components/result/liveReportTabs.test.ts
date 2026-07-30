import { describe, expect, it } from 'vitest';
import { parseLiveReportTab, parseQuestionIndex } from './liveReportTabs';

describe('liveReportTabs', () => {
  it('defaults invalid tabs to overview', () => {
    expect(parseLiveReportTab(null)).toBe('overview');
    expect(parseLiveReportTab('feedback')).toBe('overview');
    expect(parseLiveReportTab('criteria')).toBe('criteria');
  });

  it('parses 1-based question query into a safe 0-based index', () => {
    expect(parseQuestionIndex(null, 4)).toBe(0);
    expect(parseQuestionIndex('2', 4)).toBe(1);
    expect(parseQuestionIndex('99', 4)).toBe(3);
    expect(parseQuestionIndex('0', 4)).toBe(0);
  });
});
