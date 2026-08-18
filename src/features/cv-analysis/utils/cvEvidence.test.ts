import { describe, expect, it } from 'vitest';
import { NO_EVIDENCE, type RequirementMatch } from '../types/cvAnalysis.types';
import {
  buildPdfViewerUrl,
  groupRequirementEvidence,
  hasVerifiedCvEvidence,
} from './cvEvidence';

const strong: RequirementMatch = {
  requirementId: 'r-1',
  text: 'ASP.NET Core',
  priority: 'MustHave',
  level: 'Strong',
  evidence: 'Developed ASP.NET Core APIs',
  page: 2,
  sectionTitle: 'Experience',
};

const weak: RequirementMatch = {
  requirementId: 'r-2',
  text: 'Kubernetes',
  priority: 'NiceToHave',
  level: 'Weak',
  evidence: NO_EVIDENCE,
  page: null,
  sectionTitle: null,
};

describe('CV evidence helpers', () => {
  it('groups Strong requirements separately from Partial and Weak gaps', () => {
    expect(groupRequirementEvidence({ mustHaveMatches: [strong], niceToHaveMatches: [weak] })).toEqual({
      strengths: [strong],
      gaps: [weak],
    });
  });

  it('never treats the backend no-evidence sentinel as a quote', () => {
    expect(hasVerifiedCvEvidence(strong)).toBe(true);
    expect(hasVerifiedCvEvidence(weak)).toBe(false);
    expect(hasVerifiedCvEvidence({ ...weak, evidence: '   ' })).toBe(false);
  });

  it('opens a PDF at a valid page with page-width zoom', () => {
    expect(buildPdfViewerUrl('blob:cv', 3)).toBe('blob:cv#page=3&zoom=page-width');
    expect(buildPdfViewerUrl('blob:cv', null)).toBe('blob:cv#page=1&zoom=page-width');
  });
});
