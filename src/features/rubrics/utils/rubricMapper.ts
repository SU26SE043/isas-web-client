import { CV_ANALYSIS_DOMAIN_KEY } from '@/features/cv-analysis/hooks/useCvAnalysisFlow';
import { domainToJobCategoryEnum, isJobDomainId } from '@/shared/domain/jobDomains';
import type {
  EditableRubricCriterion,
  JobCategory,
  RubricResponse,
  UpdateRubricRequest,
} from '../types/rubric.types';

let tempCriterionCounter = 0;

export function getInitialJobCategory(): JobCategory {
  if (typeof window === 'undefined') return 'FE';
  const stored = localStorage.getItem(CV_ANALYSIS_DOMAIN_KEY);
  if (isJobDomainId(stored)) return domainToJobCategoryEnum(stored);
  return 'FE';
}

export function mapResponseToEditable(response: RubricResponse): EditableRubricCriterion[] {
  return response.criteria.map((criterion) => ({
    clientId: criterion.id,
    serverId: criterion.id,
    name: criterion.name,
    description: criterion.description ?? '',
    weightPercent: Math.round(criterion.weight * 10000) / 100,
    maxScore: criterion.maxScore,
    levels: criterion.levels ?? undefined,
    originalMaxScore: criterion.maxScore,
  }));
}

export function mapEditableToUpdateRequest(criteria: EditableRubricCriterion[]): UpdateRubricRequest {
  return {
    criteria: criteria.map((criterion) => ({
      name: criterion.name.trim(),
      description: criterion.description.trim() || null,
      weight: criterion.weightPercent / 100,
      maxScore: criterion.maxScore,
      // Mang mốc điểm ĐI VÀ VỀ. Lưu rubric riêng là replace-all: server dựng hàng mới từ ĐÚNG
      // payload này, nên field nào không gửi lại coi như bị xoá. Màn này không có ô sửa mốc, nên
      // không echo lại nghĩa là mỗi lần đổi một con số trọng lượng là thang neo do admin soạn biến
      // mất — chấm điểm lặng lẽ rơi về dải mặc định 0..maxScore. Cùng lớp lỗi F10 (mất `id` câu
      // hỏi qua vòng đọc-sửa-lưu).
      ...(keepLevels(criterion) ? { levels: criterion.levels } : {}),
    })),
  };
}

/**
 * Chỉ gửi lại mốc khi chúng CÒN HỢP LỆ với thang điểm hiện tại.
 *
 * Server bắt buộc bộ mốc phải chứa cả `0` lẫn `maxScore`. Người dùng sửa `maxScore` (ô này CÓ trên
 * màn) làm bộ mốc cũ hết khớp ⇒ echo lại nguyên xi sẽ biến một thao tác đang chạy được thành **400**.
 * Bỏ mốc trong đúng ca đó = quay về hành vi trước bản vá (server ghi rỗng), không phải mất mát mới:
 * mốc cũ vốn đã không mô tả được thang mới.
 */
function keepLevels(criterion: EditableRubricCriterion): boolean {
  return (
    Array.isArray(criterion.levels) &&
    criterion.levels.length > 0 &&
    criterion.originalMaxScore === criterion.maxScore
  );
}

export function createEmptyCriterion(): EditableRubricCriterion {
  tempCriterionCounter += 1;
  return {
    clientId: `new-${Date.now()}-${tempCriterionCounter}`,
    name: '',
    description: '',
    weightPercent: 0,
    maxScore: 10,
  };
}

export function serializeCriteria(criteria: EditableRubricCriterion[]): string {
  return JSON.stringify(criteria);
}
