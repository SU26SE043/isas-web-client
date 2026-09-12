export interface QuestionNumbering {
  /** questionId → số hiệu hiển thị: câu gốc "1", "2"…; câu đào sâu "1.1", "1.2"… */
  labels: Map<string, string>;
  /** Số câu GỐC — mẫu số của "Câu hỏi N / M". */
  rootCount: number;
}

/** Câu đào sâu (FollowUp/Clarify) = con của câu gốc gần nhất phía trước. Mọi kind khác (Seed, NewQuestion, 'question' của marker/mock) là câu gốc. */
export function isDeepDiveKind(kind?: string | null): boolean {
  const normalized = (kind ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  return normalized === 'followup' || normalized === 'clarify' || normalized === 'clarification';
}

/**
 * Đánh số PHÂN CẤP theo thứ tự mảng (server đã sắp theo `orderNo`, câu đào sâu xen ngay sau câu gốc của nó
 * — INT-17b): câu gốc giữ số cố định dù có bao nhiêu câu đào sâu về, nên "Câu hỏi 2" hôm nay vẫn là "2" sau
 * khi câu 1 sinh thêm 3 câu đào sâu; ứng viên thấy ngay còn mấy câu CHÍNH. Trước đó đánh số phẳng theo vị
 * trí: câu đào sâu lấy số kế tiếp và đẩy lùi mọi câu gốc phía sau.
 * Câu đào sâu đứng trước mọi câu gốc (dữ liệu lệch) được coi là câu gốc — không bao giờ sinh "0.1".
 */
export function numberQuestions(questions: readonly { id: string; kind?: string | null }[]): QuestionNumbering {
  const labels = new Map<string, string>();
  let rootCount = 0;
  let childCount = 0;
  for (const question of questions) {
    if (isDeepDiveKind(question.kind) && rootCount > 0) {
      childCount += 1;
      labels.set(question.id, `${rootCount}.${childCount}`);
    } else {
      rootCount += 1;
      childCount = 0;
      labels.set(question.id, String(rootCount));
    }
  }
  return { labels, rootCount };
}
