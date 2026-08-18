import {
  NO_EVIDENCE,
  type CvAnalysisResult,
  type RequirementMatch,
} from '../types/cvAnalysis.types';

export interface CvEvidenceGroups {
  strengths: RequirementMatch[];
  gaps: RequirementMatch[];
}

export function groupRequirementEvidence(
  analysis: Pick<CvAnalysisResult, 'mustHaveMatches' | 'niceToHaveMatches'>,
): CvEvidenceGroups {
  const matches = [...analysis.mustHaveMatches, ...analysis.niceToHaveMatches];
  return {
    strengths: matches.filter((match) => match.level === 'Strong'),
    gaps: matches.filter((match) => match.level !== 'Strong'),
  };
}

export function hasVerifiedCvEvidence(match: RequirementMatch): boolean {
  const evidence = match.evidence.trim();
  return evidence.length > 0 && evidence.localeCompare(NO_EVIDENCE, 'vi', { sensitivity: 'base' }) !== 0;
}

export function buildPdfViewerUrl(objectUrl: string, page?: number | null): string {
  const safePage = Number.isFinite(page) && Number(page) > 0 ? Math.floor(Number(page)) : 1;
  return `${objectUrl}#page=${safePage}&zoom=page-width`;
}
