import { describe, expect, it } from 'vitest';
import { NO_EVIDENCE } from '../types/cvAnalysis.types';
import { parseAnalysis } from './cvAnalysis.service';

const baseResponse = {
  id: 'analysis-1',
  cvId: 'cv-1',
  jdId: 'jd-1',
  jobCategory: 'BE',
  summary: 'Summary',
  strengths: ['PostgreSQL'],
  weaknesses: [],
  suggestions: [],
  createdAt: '2026-08-18T00:00:00Z',
};

describe('parseAnalysis', () => {
  it('parses the backend flattened requirement match shape', () => {
    const result = parseAnalysis({
      ...baseResponse,
      mustHaveMatches: [
        {
          requirementId: 'requirement-1',
          priority: 'MustHave',
          text: '3 năm PostgreSQL',
          level: 'Strong',
          evidence: 'Skills: PostgreSQL, Redis',
          page: 2,
          sectionTitle: 'Kỹ năng',
        },
      ],
      niceToHaveMatches: [],
    });

    expect(result.mustHaveMatches[0]).toEqual({
      requirementId: 'requirement-1',
      priority: 'MustHave',
      text: '3 năm PostgreSQL',
      level: 'Strong',
      evidence: 'Skills: PostgreSQL, Redis',
      page: 2,
      sectionTitle: 'Kỹ năng',
    });
  });

  it('keeps no-evidence as the backend sentinel', () => {
    const result = parseAnalysis({
      ...baseResponse,
      mustHaveMatches: [{
        requirementId: 'requirement-2',
        priority: 'MustHave',
        text: 'Docker',
        level: 'Weak',
        evidence: NO_EVIDENCE,
        page: null,
        sectionTitle: null,
      }],
    });

    expect(result.mustHaveMatches[0].evidence).toBe(NO_EVIDENCE);
    expect(result.mustHaveMatches[0].page).toBeNull();
  });

  it('parses cv section anchors and analysis citations', () => {
    const result = parseAnalysis({
      ...baseResponse,
      cvSections: [{ title: 'Kỹ năng', kind: 'Skills', startsWith: 'KỸ NĂNG' }],
      citations: [{
        chunkId: 'chunk-1',
        content: 'PostgreSQL and Redis',
        sourceUrl: null,
        sourceTitle: 'Candidate CV',
      }],
    });

    expect(result.cvSections).toEqual([
      { title: 'Kỹ năng', kind: 'Skills', startsWith: 'KỸ NĂNG' },
    ]);
    expect(result.citations).toEqual([
      {
        chunkId: 'chunk-1',
        content: 'PostgreSQL and Redis',
        sourceUrl: null,
        sourceTitle: 'Candidate CV',
      },
    ]);
  });

  it('supports the compact list response without detail fields', () => {
    const result = parseAnalysis(baseResponse);

    expect(result.mustHaveMatches).toEqual([]);
    expect(result.niceToHaveMatches).toEqual([]);
    expect(result.cvSections).toEqual([]);
    expect(result.citations).toEqual([]);
    expect(result.requirementSummary).toBeNull();
  });
});
