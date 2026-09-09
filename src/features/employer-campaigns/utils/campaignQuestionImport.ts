import type {
  CampaignQuestionImportError,
  CampaignQuestionImportItem,
  CampaignQuestionImportResult,
} from '../types/campaign.api.types';
import type { CampaignQuestion } from '../types/campaignManagement.types';

type RecordValue = Record<string, unknown>;

export function isCampaignCsvFile(file: File | null): boolean {
  return Boolean(file?.name.toLowerCase().endsWith('.csv'));
}

function record(value: unknown): RecordValue | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function number(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseError(value: unknown, fallbackRow: number): CampaignQuestionImportError | null {
  const row = record(value);
  if (!row) return null;
  const message = text(row.message ?? row.Message ?? row.error ?? row.Error);
  return message ? { rowNumber: number(row.rowNumber ?? row.RowNumber ?? row.row ?? row.Row, fallbackRow), message } : null;
}

export function parseCampaignQuestionImport(data: unknown): CampaignQuestionImportResult {
  const root = record(data);
  const payload = record(root?.data ?? root?.Data) ?? root ?? {};
  const rawItems = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.Items) ? payload.Items : [];
  const errors = (Array.isArray(payload.errors) ? payload.errors : Array.isArray(payload.Errors) ? payload.Errors : [])
    .map((item, index) => parseError(item, index + 2))
    .filter((item): item is CampaignQuestionImportError => Boolean(item));
  const items = rawItems.flatMap((value, index) => {
    const row = record(value);
    if (!row) return [];
    const rowNumber = number(row.rowNumber ?? row.RowNumber ?? row.row ?? row.Row, index + 2);
    const error = text(row.error ?? row.Error ?? row.message ?? row.Message) || null;
    const requiredValue = row.isRequired ?? row.IsRequired;
    return [{
      rowNumber,
      questionText: text(row.questionText ?? row.QuestionText ?? row.prompt ?? row.Prompt),
      sampleAnswer: text(row.sampleAnswer ?? row.SampleAnswer) || null,
      isRequired: typeof requiredValue === 'boolean' ? requiredValue : null,
      questionGroup: text(row.questionGroup ?? row.QuestionGroup ?? row.nhom ?? row.Nhom) || null,
      error,
    } satisfies CampaignQuestionImportItem];
  });
  return {
    totalRows: number(payload.totalRows ?? payload.TotalRows, rawItems.length + errors.length),
    items,
    errors,
  };
}

export function validImportedQuestions(result: CampaignQuestionImportResult): CampaignQuestionImportItem[] {
  return result.items.filter((item) => item.questionText.trim() && !item.error);
}

export function limitImportedQuestions(
  existingCount: number,
  items: CampaignQuestionImportItem[],
  max = 20,
): { accepted: CampaignQuestionImportItem[]; skipped: number } {
  const available = Math.max(max - existingCount, 0);
  return { accepted: items.slice(0, available), skipped: Math.max(items.length - available, 0) };
}

export function importedItemToQuestion(
  item: CampaignQuestionImportItem,
  isRequired: boolean,
): CampaignQuestion {
  return {
    id: `client-import-${crypto.randomUUID()}`,
    prompt: item.questionText.trim(),
    skill: '',
    difficulty: 'middle',
    source: 'manual',
    isRequired,
    questionGroup: item.questionGroup ?? null,
  };
}
