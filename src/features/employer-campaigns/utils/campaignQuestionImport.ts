import type {
  CampaignQuestionImportError,
  CampaignQuestionImportItem,
  CampaignQuestionImportResult,
} from '../types/campaign.api.types';
import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';

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

/** SC2 — tách tên tiêu chí bằng `|` hoặc `;` (cột `targetCriteria` trong file import), bỏ chuỗi rỗng. */
function splitCriteriaNames(value: string): string[] {
  return value.split(/[|;]/).map((entry) => entry.trim()).filter(Boolean);
}

/**
 * SC2 — chấp nhận CẢ HAI hình dạng BE có thể trả cho cột `targetCriteria`: một chuỗi
 * `"Tên A|Tên B"` (tách bằng `|`/`;`) HOẶC một mảng tên đã tách sẵn. Không có cột ⇒ `null`
 * (khác `[]` — `[]` nghĩa là "cột có nhưng rỗng", hiếm gặp nhưng vẫn phải phân biệt được).
 */
function parseTargetCriteriaNames(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    const names = raw.flatMap((entry) => (typeof entry === 'string' ? splitCriteriaNames(entry) : []));
    return names.length ? names : null;
  }
  if (typeof raw === 'string' && raw.trim()) {
    const names = splitCriteriaNames(raw);
    return names.length ? names : null;
  }
  return null;
}

function parseError(value: unknown, fallbackRow: number): CampaignQuestionImportError | null {
  const row = record(value);
  if (!row) return null;
  const message = text(row.message ?? row.Message ?? row.error ?? row.Error);
  // BE gửi `line` (ImportRowError.Line) = số dòng TRONG FILE tính cả tiêu đề — HR mở Excel nhảy
  // đúng dòng đó. Thiếu tên này thì rơi về chỉ số mảng ⇒ số dòng bịa.
  return message ? { rowNumber: number(row.line ?? row.Line ?? row.rowNumber ?? row.RowNumber ?? row.row ?? row.Row, fallbackRow), message } : null;
}

export function parseCampaignQuestionImport(data: unknown): CampaignQuestionImportResult {
  const root = record(data);
  const payload = record(root?.data ?? root?.Data) ?? root ?? {};
  // ⚠ Backend trả khoá `questions` (ImportQuestionsResult.Questions), KHÔNG phải `items`.
  // Đọc thiếu tên này thì import 200 nhưng hộp thoại báo "0 dòng hợp lệ" và nút xác nhận
  // disabled vĩnh viễn — hỏng IM LẶNG, đúng lớp lỗi lệch tên khoá đã cắn repo nhiều lần.
  const rawItems = [payload.questions, payload.Questions, payload.items, payload.Items]
    .find((value): value is unknown[] => Array.isArray(value)) ?? [];
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
      targetCriteriaNames: parseTargetCriteriaNames(
        row.targetCriteria ?? row.TargetCriteria ?? row.targetCriterionNames ?? row.TargetCriterionNames,
      ),
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

function normalizeCriterionName(name: string): string {
  return name.trim().toLowerCase();
}

export type ImportedTargetWarning = { rowNumber: number; names: string[] };

/**
 * SC2 — đối chiếu TÊN tiêu chí (cột `targetCriteria` của file import) với rubric hiện tại đang
 * hiển thị trong wizard — so KHÔNG phân biệt hoa/thường, bỏ khoảng trắng thừa. Tên KHÔNG khớp bị
 * BỎ (không throw) và trả về trong `unresolvedNames` để caller tự quyết định hiển thị cảnh báo.
 * `names` rỗng/`null` (không có cột trong file) ⇒ `{ ids: null, unresolvedNames: [] }` — giữ ĐÚNG
 * ngữ nghĩa "chưa gắn nhãn" của `CampaignQuestion.targetCriterionIds`, KHÔNG phải "gắn nhãn rỗng".
 */
export function resolveTargetCriterionIds(
  names: string[] | null | undefined,
  rubric: RubricCriterion[],
): { ids: string[] | null; unresolvedNames: string[] } {
  if (!names || names.length === 0) return { ids: null, unresolvedNames: [] };
  const byName = new Map(rubric.map((criterion) => [normalizeCriterionName(criterion.name), criterion.id]));
  const ids: string[] = [];
  const unresolvedNames: string[] = [];
  for (const name of names) {
    const id = byName.get(normalizeCriterionName(name));
    if (!id) {
      unresolvedNames.push(name);
    } else if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return { ids, unresolvedNames };
}

/**
 * `rubric` VẮNG (2-arg, tương thích ngược) ⇒ KHÔNG đụng `targetCriterionIds` — vẫn `null` như hành
 * vi trước SC2. Truyền `rubric` để resolve tên cột `targetCriteria` thành id thật; tên lạ bị BỎ
 * (dùng `resolveTargetCriterionIds`/`importedItemsToQuestions` nếu cần gom cảnh báo cho caller).
 */
export function importedItemToQuestion(
  item: CampaignQuestionImportItem,
  isRequired: boolean,
  rubric?: RubricCriterion[],
): CampaignQuestion {
  const resolved = rubric ? resolveTargetCriterionIds(item.targetCriteriaNames, rubric) : null;
  return {
    id: `client-import-${crypto.randomUUID()}`,
    prompt: item.questionText.trim(),
    skill: '',
    difficulty: 'middle',
    source: 'manual',
    isRequired,
    questionGroup: item.questionGroup ?? null,
    targetCriterionIds: resolved ? resolved.ids : null,
    sampleAnswer: item.sampleAnswer ?? null,
  };
}

/**
 * Bản BATCH của `importedItemToQuestion` — "gom cảnh báo trả về caller (không throw)": mỗi dòng có
 * tên tiêu chí không khớp rubric hiện tại được gom vào `unresolvedTargets` thay vì làm hỏng cả lượt
 * import. Câu hỏi vẫn được tạo (với `targetCriterionIds` chỉ gồm phần khớp được, `[]` nếu 0 tên khớp).
 */
export function importedItemsToQuestions(
  items: CampaignQuestionImportItem[],
  isRequired: boolean,
  rubric: RubricCriterion[],
): { questions: CampaignQuestion[]; unresolvedTargets: ImportedTargetWarning[] } {
  const unresolvedTargets: ImportedTargetWarning[] = [];
  const questions = items.map((item) => {
    const { unresolvedNames } = resolveTargetCriterionIds(item.targetCriteriaNames, rubric);
    if (unresolvedNames.length > 0) {
      unresolvedTargets.push({ rowNumber: item.rowNumber, names: unresolvedNames });
    }
    return importedItemToQuestion(item, isRequired, rubric);
  });
  return { questions, unresolvedTargets };
}
