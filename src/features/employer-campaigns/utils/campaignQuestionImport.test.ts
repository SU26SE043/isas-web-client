import { describe, expect, it } from 'vitest';
import {
  isCampaignCsvFile,
  limitImportedQuestions,
  parseCampaignQuestionImport,
  validImportedQuestions,
} from './campaignQuestionImport';

describe('campaign question CSV import contract', () => {
  it('maps a valid server preview into question rows', () => {
    const result = parseCampaignQuestionImport({
      TotalRows: 2,
      Items: [
        { RowNumber: 2, QuestionText: 'Explain a trade-off.', IsRequired: true, Nhom: 'Technical' },
        { RowNumber: 3, QuestionText: 'How do you collaborate?' },
      ],
    });

    expect(result.totalRows).toBe(2);
    expect(validImportedQuestions(result)).toHaveLength(2);
    expect(result.items[0]).toMatchObject({ rowNumber: 2, questionText: 'Explain a trade-off.', questionGroup: 'Technical' });
  });

  it('keeps a missing question error attached to its source row', () => {
    const result = parseCampaignQuestionImport({
      TotalRows: 2,
      Items: [{ RowNumber: 2, QuestionText: 'Valid row' }, { RowNumber: 3, Error: 'question_text is required' }],
    });

    expect(validImportedQuestions(result)).toHaveLength(1);
    expect(result.items[1]).toMatchObject({ rowNumber: 3, error: 'question_text is required' });
  });

  it('reports how many valid rows exceed the bank cap', () => {
    const items = Array.from({ length: 4 }, (_, index) => ({ rowNumber: index + 2, questionText: `Q${index + 1}` }));

    expect(limitImportedQuestions(18, items)).toEqual({ accepted: items.slice(0, 2), skipped: 2 });
  });

  it('rejects non-CSV files before any upload request', () => {
    expect(isCampaignCsvFile(new File(['x'], 'questions.txt', { type: 'text/plain' }))).toBe(false);
    expect(isCampaignCsvFile(new File(['x'], 'questions.CSV', { type: 'text/csv' }))).toBe(true);
  });
});
