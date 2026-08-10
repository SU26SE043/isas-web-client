import { describe, expect, it } from 'vitest';
import { cvAnalysisEndpoints } from './cvAnalysis.endpoints';

describe('cvAnalysisEndpoints file contract', () => {
  it('uses the repeated files/files list path', () => {
    expect(cvAnalysisEndpoints.listFiles).toBe('/api/v1/interview/files/files');
  });

  it('exposes parsed text as a separate endpoint', () => {
    expect(cvAnalysisEndpoints.parsedText('file/123')).toBe(
      '/api/v1/interview/files/file%2F123/parsed-text',
    );
  });
});
