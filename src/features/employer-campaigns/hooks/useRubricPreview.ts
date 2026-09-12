// PLACEHOLDER — W1 thay bằng bản thật lúc gộp
import type { UseRubricPreviewApi } from '../types/rubricPreview.types';

export interface UseRubricPreviewOptions {
  campaignId: string | null;
  /** Wizard truyền hàm lưu thước đo + câu hỏi; trả campaignId sau khi lưu (null = lưu hỏng ⇒ không POST). */
  beforeRun?: () => Promise<string | null>;
}

const INERT: UseRubricPreviewApi = {
  runs: [],
  latest: null,
  isLoadingHistory: false,
  isRunning: false,
  freeRunsRemaining: null,
  error: null,
  run: async () => null,
  clearError: () => undefined,
};

/** API trơ đúng chữ ký `UseRubricPreviewApi` — component chỉ nhận `preview` qua props nên không phụ thuộc bản này. */
export function useRubricPreview(_options: UseRubricPreviewOptions): UseRubricPreviewApi {
  return INERT;
}
