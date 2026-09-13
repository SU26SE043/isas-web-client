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
 * FACT T9-R3 (P1, tiềm ẩn): hai tiêu chí tạm trùng tên khác hoa/thường ghép về CÙNG một GUID — hôm nay BE 400
 * (tên tiêu chí trùng) chặn hộ trước khi tới đây; nếu BE nới, phải ghép theo thứ tự xuất hiện thay vì `byName`.
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
 * BE `TrimDanglingQuestionTargets`: tiêu chí đó không còn tồn tại (FACT T9-R3 P8: nhãn toàn id tạm không resolve
 * ⇒ `[]` ⇒ PUT gửi `[]` = chỉ Always, thay vì omit như T7). `null` giữ `null` (I2: chưa gắn nhãn ≠ `[]`);
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
 * R2 — cắt nhãn câu về ⊆ `allowedIds` (id tiêu chí ĐANG tồn tại: rubric hiện tại trong state, hoặc rubric server
 * vừa trả sau PUT). BE `PUT /campaign/{id}` replace-all cắt tiêu chí đã xoá ngay trong DB, rồi `PUT …/questions`
 * nhận lại GUID đó ⇒ 400 "không thuộc chiến dịch" — HR chỉ thấy Triển khai hỏng, không thấy vì sao.
 * `null` giữ `null` (I2); cắt hết ⇒ `[]` (đã xét, tiêu chí nhắm tới không còn ⇒ chỉ Always); không đổi ⇒ giữ
 * nguyên tham chiếu mảng (không làm bẩn `autosaveStatus`/re-render).
 */
export function pruneQuestionTargetIds(
  questions: CampaignQuestion[],
  allowedIds: ReadonlySet<string>,
): CampaignQuestion[] {
  let changed = false;
  const next = questions.map((question) => {
    const targets = question.targetCriterionIds;
    if (targets == null) return question;
    const kept = targets.filter((id) => allowedIds.has(id));
    if (kept.length === targets.length) return question;
    changed = true;
    return { ...question, targetCriterionIds: kept };
  });
  return changed ? next : questions;
}

export interface RubricAdoption {
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  idMap: Map<string, string>;
  /** false = server không echo id nào (rubric rỗng / bản merge-fallback mang id tạm) ⇒ không có sự thật để ghép/cắt. */
  adopted: boolean;
}

/**
 * R1/R2 — MỘT chỗ dùng chung cho MỌI đường nhận rubric từ server (POST create · PUT metadata), thay vì chỉ
 * `persistForPreview`: ①ghép id tạm → id server theo tên · ②viết lại nhãn câu theo idMap · ③cắt nhãn về ⊆ id
 * server (GUID chết của tiêu chí đã xoá không đi vào `PUT …/questions`). Trước R1, `ensureDraftId`/Triển khai/
 * "Lưu câu hỏi" vứt response ⇒ `state.rubric` giữ id tạm mãi ⇒ nhãn `[temp]` bị omit lúc PUT ⇒ câu lưu `null`,
 * chip tắt im lặng; AI sinh câu ở create mode trả nhãn GUID ≠ id tạm rubric ⇒ chip không sáng, coverage cục bộ
 * báo "chưa phủ" giả.
 * Server không echo id ⇒ trả NGUYÊN (không cắt mù theo tập rỗng) — id tạm còn sót sẽ bị
 * `mapQuestionsToApiRequest` ném `UnresolvedCriterionIdError` (R1c) thay vì omit câm.
 */
export function adoptServerRubric(
  local: { rubric: RubricCriterion[]; questions: CampaignQuestion[] },
  serverRubric: RubricCriterion[] | null | undefined,
): RubricAdoption {
  const serverIds = new Set((serverRubric ?? []).filter((item) => isServerEntityId(item.id)).map((item) => item.id));
  if (serverIds.size === 0) {
    return { rubric: local.rubric, questions: local.questions, idMap: new Map(), adopted: false };
  }
  const { rubric, idMap } = adoptServerCriterionIds(local.rubric, serverRubric ?? []);
  const questions = pruneQuestionTargetIds(remapQuestionTargetIds(local.questions, idMap), serverIds);
  return { rubric, questions, idMap, adopted: true };
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
