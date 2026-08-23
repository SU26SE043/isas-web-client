import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { getPracticeSessionHistory } from '../services/history.service';
import type { GetPracticeSessionHistoryParams } from '../types/history.types';

/**
 * Chuẩn hoá tham số MỘT LẦN, rồi dùng CHUNG cho `queryKey` và `queryFn`.
 *
 * 🔴 Trước bản này hook dựng hai object literal riêng — một cho key, một cho lời gọi — từ danh sách
 * field liệt kê TAY. Thêm bộ lọc mới mà quên thêm vào vế key thì hai bộ lọc khác nhau dùng CHUNG
 * một ô cache react-query: bấm "Theo lộ trình" rồi bấm "Tự do" sẽ thấy lại kết quả lần trước —
 * không lỗi, không cảnh báo, chỉ là số liệu sai. Một object dùng hai nơi làm lớp hỏng đó không
 * còn diễn đạt được: thêm field ở đây là tự động chảy vào cả key lẫn request.
 */
function normalizePracticeHistoryParams(
  params: GetPracticeSessionHistoryParams,
): GetPracticeSessionHistoryParams {
  return {
    cursor: params.cursor || undefined,
    limit: params.limit ?? DEFAULT_PAGE_SIZE,
    source: params.source,
  };
}

export const practiceHistoryKeys = {
  all: ['practice-session-history'] as const,
  list: (params: GetPracticeSessionHistoryParams) =>
    [...practiceHistoryKeys.all, normalizePracticeHistoryParams(params)] as const,
};

export function usePracticeSessionHistory(params: GetPracticeSessionHistoryParams) {
  const normalized = normalizePracticeHistoryParams(params);

  return useQuery({
    queryKey: practiceHistoryKeys.list(normalized),
    queryFn: () => getPracticeSessionHistory(normalized),
    placeholderData: (previous) => previous,
  });
}
