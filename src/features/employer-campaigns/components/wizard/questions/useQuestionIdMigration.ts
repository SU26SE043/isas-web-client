import { useEffect, useRef } from 'react';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import { buildQuestionIdAliases } from '../../../utils/serverIdAdoption';

/**
 * SC2 · correction T9-R3 (F2) — sau "Lưu & chấm thử" lần đầu (create-mode), `persistForPreview` re-key câu
 * `client-…` → GUID server trong `state.questions`. Mọi state cục bộ KHOÁ THEO ID CÂU (map mở/đóng, câu đang có
 * lượt chấm thử bay) sẽ trỏ vào id không còn tồn tại ⇒ card HR đang làm tự đóng, kết quả về trong card đã
 * collapse, mọi card khác báo "Đang chấm câu #?" suốt 20–60s. Hook này gọi `migrate(aliases)` đúng lúc danh
 * sách câu đổi id (ghép theo `buildQuestionIdAliases`: nội dung câu, không theo vị trí), để chủ state tự đổi
 * khoá. Không alias nào ⇒ không gọi (thêm/xoá/sửa câu bình thường không đụng).
 */
export function useQuestionIdMigration(
  questions: CampaignQuestion[],
  migrate: (aliases: Map<string, string>) => void,
): void {
  const prevRef = useRef(questions);
  const migrateRef = useRef(migrate);
  migrateRef.current = migrate;
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = questions;
    if (prev === questions) return;
    const aliases = buildQuestionIdAliases(prev, questions);
    if (aliases.size > 0) migrateRef.current(aliases);
  }, [questions]);
}

/** Đổi khoá của một map theo alias; giữ nguyên tham chiếu khi không có khoá nào phải đổi. */
export function remapKeys<T>(map: Record<string, T>, aliases: Map<string, string>): Record<string, T> {
  let changed = false;
  const next: Record<string, T> = { ...map };
  for (const [localId, serverId] of aliases) {
    if (!(localId in next)) continue;
    next[serverId] = next[localId];
    delete next[localId];
    changed = true;
  }
  return changed ? next : map;
}
