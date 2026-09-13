import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import { isServerEntityId } from './campaignQuestionLimits';

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

/**
 * SC2 · T9 (quyết định (a) của scope picker) — sau `PUT /campaign/{id}` BE trả bộ tiêu chí ĐÃ có id server,
 * nhưng `persistForPreview` từng vứt response đó ⇒ tiêu chí vừa thêm ở bước 3 giữ id tạm (`criterion-N`,
 * `new-…`) trong state mãi, và nhãn câu hỏi trỏ vào id tạm bị lọc rớt lúc PUT câu hỏi (FACT T7-R1).
 *
 * Ghép theo TÊN (trim, không phân biệt hoa/thường — cùng luật carry-over mốc của BE) vì PUT replace-all
 * KHÔNG echo id tạm nên BE không biết "tiêu chí này là tiêu chí kia". Chỉ đụng tiêu chí CHƯA có id server;
 * tiêu chí đã mang GUID giữ nguyên (BE HĐ-5: echo id ⇒ giữ id). Chỉ thay `id`, giữ nguyên mọi field local
 * (mốc/mô tả HR đang gõ), không lấy bản server đè lên.
 */
export function adoptServerCriterionIds(
  local: RubricCriterion[],
  server: RubricCriterion[],
): { rubric: RubricCriterion[]; idMap: Map<string, string> } {
  const claimed = new Set(local.filter((item) => isServerEntityId(item.id)).map((item) => item.id));
  const byName = new Map<string, string>();
  for (const item of server) {
    if (!isServerEntityId(item.id) || claimed.has(item.id)) continue;
    const key = normalizeName(item.name);
    if (!byName.has(key)) byName.set(key, item.id);
  }
  const idMap = new Map<string, string>();
  const rubric = local.map((item) => {
    if (isServerEntityId(item.id)) return item;
    const serverId = byName.get(normalizeName(item.name));
    if (!serverId) return item;
    idMap.set(item.id, serverId);
    return { ...item, id: serverId };
  });
  return { rubric, idMap };
}

/**
 * Viết lại nhãn câu hỏi theo `idMap` (id tạm → id server). Id tạm KHÔNG resolve được thì BỎ — cùng ngữ nghĩa
 * BE `TrimDanglingQuestionTargets`: tiêu chí đó không còn tồn tại. `null` giữ `null` (I2: chưa gắn nhãn ≠ `[]`);
 * mảng giữ nguyên tham chiếu khi không có gì đổi để không làm bẩn `autosaveStatus`/re-render vô ích.
 */
export function remapQuestionTargetIds(
  questions: CampaignQuestion[],
  idMap: Map<string, string>,
): CampaignQuestion[] {
  if (idMap.size === 0) return questions;
  return questions.map((question) => {
    const targets = question.targetCriterionIds;
    if (targets == null) return question;
    let changed = false;
    const next: string[] = [];
    for (const id of targets) {
      if (isServerEntityId(id)) { next.push(id); continue; }
      const resolved = idMap.get(id);
      changed = true;
      if (resolved && !next.includes(resolved)) next.push(resolved);
    }
    return changed ? { ...question, targetCriterionIds: next } : question;
  });
}

/**
 * Ánh xạ id câu đúc cục bộ (`client-…`) → id server, đối chiếu payload ĐÃ GỬI với response `PUT …/questions`.
 * KHÔNG ghép theo vị trí: BE trả `Questions.OrderBy(CreatedAt)` nên câu MỚI chèn giữa hai câu cũ sẽ nằm CUỐI
 * response. Ghép: loại các câu response có id trùng id server đã echo → phần "fresh" còn lại ghép với câu
 * gửi lên chưa có id server theo NỘI DUNG (trim); trùng nội dung thì theo thứ tự xuất hiện.
 */
export function buildQuestionIdAliases(
  sent: CampaignQuestion[],
  saved: CampaignQuestion[],
): Map<string, string> {
  const aliases = new Map<string, string>();
  const echoed = new Set(sent.filter((item) => isServerEntityId(item.id)).map((item) => item.id));
  const fresh = saved.filter((item) => isServerEntityId(item.id) && !echoed.has(item.id));
  const used = new Set<string>();
  for (const question of sent) {
    if (isServerEntityId(question.id) || !question.prompt.trim()) continue;
    const text = question.prompt.trim();
    const match = fresh.find((item) => !used.has(item.id) && item.prompt.trim() === text)
      ?? fresh.find((item) => !used.has(item.id));
    if (!match) continue;
    used.add(match.id);
    aliases.set(question.id, match.id);
  }
  return aliases;
}
