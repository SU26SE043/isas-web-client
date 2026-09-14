import { describe, expect, it } from 'vitest';
import {
  importedItemsToQuestions,
  importedItemToQuestion,
  isCampaignCsvFile,
  limitImportedQuestions,
  parseCampaignQuestionImport,
  resolveTargetCriterionIds,
  validImportedQuestions,
} from './campaignQuestionImport';
import type { RubricCriterion } from '../types/campaignManagement.types';

const RUBRIC: RubricCriterion[] = [
  { id: 'c-depth', name: 'Chiều sâu kỹ thuật', description: '', weight: 60, maxScore: 5 },
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5 },
];

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

  // SC2 — cột `TargetCriteria` (chuỗi phân tách `|`/`;` HOẶC mảng đã tách sẵn) → `targetCriteriaNames`.
  it('parses the targetCriteria column (string split by | or ; and pre-split arrays)', () => {
    const result = parseCampaignQuestionImport({
      TotalRows: 3,
      Items: [
        { RowNumber: 2, QuestionText: 'Q1', TargetCriteria: 'Chiều sâu kỹ thuật|Giao tiếp' },
        { RowNumber: 3, QuestionText: 'Q2', targetCriteria: ['Giao tiếp', ' Chiều sâu kỹ thuật '] },
        { RowNumber: 4, QuestionText: 'Q3' },
      ],
    });
    expect(result.items[0]?.targetCriteriaNames).toEqual(['Chiều sâu kỹ thuật', 'Giao tiếp']);
    expect(result.items[1]?.targetCriteriaNames).toEqual(['Giao tiếp', 'Chiều sâu kỹ thuật']);
    expect(result.items[2]?.targetCriteriaNames).toBeNull();
  });
});

describe('resolveTargetCriterionIds — so tên KHÔNG phân biệt hoa/thường, gom tên lạ', () => {
  it('null/rỗng ⇒ chưa gắn nhãn (không phải gắn nhãn rỗng)', () => {
    expect(resolveTargetCriterionIds(null, RUBRIC)).toEqual({ ids: null, unresolvedNames: [] });
    expect(resolveTargetCriterionIds(undefined, RUBRIC)).toEqual({ ids: null, unresolvedNames: [] });
    expect(resolveTargetCriterionIds([], RUBRIC)).toEqual({ ids: null, unresolvedNames: [] });
  });

  it('khớp tên bỏ qua hoa/thường + khoảng trắng thừa; tên lạ bị BỎ và gom vào unresolvedNames', () => {
    expect(resolveTargetCriterionIds([' giao tiếp ', 'CHIỀU SÂU KỸ THUẬT', 'Tên lạ'], RUBRIC)).toEqual({
      ids: ['c-comm', 'c-depth'],
      unresolvedNames: ['Tên lạ'],
    });
  });

  it('mọi tên đều lạ ⇒ ids: [] (đã cố gắn nhãn, không phải chưa gắn), KHÔNG throw', () => {
    expect(resolveTargetCriterionIds(['Không tồn tại'], RUBRIC)).toEqual({
      ids: [],
      unresolvedNames: ['Không tồn tại'],
    });
  });
});

describe('importedItemToQuestion — SC2 giữ sampleAnswer + resolve targetCriterionIds', () => {
  it('không truyền rubric (tương thích ngược) ⇒ targetCriterionIds vẫn null, sampleAnswer được GIỮ', () => {
    const question = importedItemToQuestion(
      { rowNumber: 2, questionText: 'Q', sampleAnswer: 'Gợi ý' },
      true,
    );
    expect(question.sampleAnswer).toBe('Gợi ý');
    expect(question.targetCriterionIds).toBeNull();
  });

  it('truyền rubric ⇒ resolve targetCriterionIds từ targetCriteriaNames', () => {
    const question = importedItemToQuestion(
      { rowNumber: 2, questionText: 'Q', targetCriteriaNames: ['Giao tiếp'] },
      true,
      RUBRIC,
    );
    expect(question.targetCriterionIds).toEqual(['c-comm']);
  });
});

describe('importedItemsToQuestions — gom cảnh báo trả về caller, KHÔNG throw', () => {
  it('tên lạ ở một dòng không chặn các dòng khác; unresolvedTargets gắn đúng rowNumber', () => {
    const { questions, unresolvedTargets } = importedItemsToQuestions(
      [
        { rowNumber: 2, questionText: 'Q1', targetCriteriaNames: ['Giao tiếp', 'Tên lạ'] },
        { rowNumber: 3, questionText: 'Q2' },
      ],
      true,
      RUBRIC,
    );
    expect(questions).toHaveLength(2);
    expect(questions[0]?.targetCriterionIds).toEqual(['c-comm']);
    expect(questions[1]?.targetCriterionIds).toBeNull();
    expect(unresolvedTargets).toEqual([{ rowNumber: 2, names: ['Tên lạ'] }]);
  });
});
