import type {
  PracticeSessionHistoryItem,
  PracticeSessionHistoryPage,
} from '../types/history.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export function readPracticeHistoryNextCursor(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & {
    get?: (name: string) => unknown;
  };
  let raw: unknown;
  if (typeof record.get === 'function') {
    raw = record.get('x-next-cursor') ?? record.get('X-Next-Cursor');
  } else {
    raw = record['x-next-cursor'] ?? record['X-Next-Cursor'];
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    return typeof first === 'string' && first.trim() ? first.trim() : null;
  }
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function parsePracticeSessionHistoryItem(
  raw: unknown,
): PracticeSessionHistoryItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id', 'Id');
  const createdAt = pickString(record, 'createdAt', 'CreatedAt');
  const status = pickString(record, 'status', 'Status') ?? '';
  if (!id || !createdAt) return null;

  return {
    id,
    status,
    jobCategory:
      pickString(record, 'jobCategory', 'JobCategory', 'jobTitle', 'JobTitle') ?? '',
    createdAt,
    completedAt: pickString(record, 'completedAt', 'CompletedAt'),
    overallScore: pickNumber(record, 'overallScore', 'OverallScore'),
    seniority: pickString(record, 'seniority', 'Seniority', 'level', 'Level'),
    // `pickString` trả `null` cho cả "vắng field" lẫn "chuỗi rỗng" — đúng ngữ nghĩa ở đây, vì cả
    // hai đều nghĩa là "không có nhãn bài học", tức buổi luyện tự do.
    lessonTitle: pickString(record, 'lessonTitle', 'LessonTitle'),
  };
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const root = asRecord(data);
  if (!root) return [];
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.items)) return root.items;
  return [];
}

export function parsePracticeSessionHistoryPage(
  data: unknown,
  headers: unknown,
): PracticeSessionHistoryPage {
  const items = unwrapList(data)
    .map(parsePracticeSessionHistoryItem)
    .filter((item): item is PracticeSessionHistoryItem => item != null);
  return {
    items,
    nextCursor: readPracticeHistoryNextCursor(headers),
  };
}
