import type { RoadmapProgressPoint } from '../types/roadmapPractice.api.types';

/** Khoá dataKey của một tiêu chí trên biểu đồ đường. */
export function criterionKey(index: number): string {
  return `crit_${index}`;
}

export interface ProgressRow {
  label: string;
  order: number;
  overall: number;
  /** `null` = tiêu chí KHÔNG được chấm ở buổi này ⇒ để hở, không nối liền. */
  [key: string]: string | number | null;
}

/**
 * Cần TỐI THIỂU HAI điểm mới có xu hướng để vẽ.
 *
 * Một điểm không phải là một đường đi lên hay đi xuống — vẽ nó ra chỉ tạo một
 * chấm lơ lửng mà người đọc sẽ diễn giải thành một xu hướng không tồn tại.
 *
 * Ca này KHÁC ca "báo cáo rỗng hoàn toàn": ở đây radar vẫn có nan và vẫn vẽ được,
 * chỉ riêng biểu đồ đường là vô nghĩa — nên hai điều kiện phải tách nhau.
 */
export function canPlotTrend(progress: readonly RoadmapProgressPoint[]): boolean {
  return progress.length >= 2;
}

/**
 * Tên tiêu chí theo thứ tự XUẤT HIỆN LẦN ĐẦU trên trục thời gian.
 *
 * Không sắp xếp lại theo bảng chữ cái: màu của mỗi tiêu chí lấy theo chỉ số, nên
 * thứ tự phải ổn định giữa các lần render, nếu không người đọc thấy màu nhảy.
 */
export function collectCriterionNames(progress: readonly RoadmapProgressPoint[]): string[] {
  const seen: string[] = [];
  for (const point of progress) {
    for (const score of point.scores) {
      if (!seen.includes(score.name)) seen.push(score.name);
    }
  }
  return seen;
}

/**
 * Dựng dữ liệu cho recharts.
 *
 * Dùng khoá `crit_<index>` chứ KHÔNG dùng thẳng tên tiêu chí làm `dataKey`:
 * recharts hiểu `dataKey` dạng chuỗi là một ĐƯỜNG DẪN (`a.b` = `row.a.b`), mà tên
 * tiêu chí thật có dấu chấm/dấu `&`/khoảng trắng ⇒ tra cứu sẽ trượt trong im lặng
 * và đường vẽ ra rỗng mà không lỗi ở đâu cả.
 */
export function buildProgressRows(
  progress: readonly RoadmapProgressPoint[],
  criterionNames: readonly string[],
): ProgressRow[] {
  return progress.map((point, index) => {
    const byName = new Map(point.scores.map((score) => [score.name, score.percentage]));
    const row: ProgressRow = {
      label: point.lessonTitle || `#${point.order || index + 1}`,
      order: point.order,
      overall: point.overallPercentage,
    };
    criterionNames.forEach((name, criterionIndex) => {
      const value = byName.get(name);
      // `?? null` chứ không `?? 0`: buổi không chấm tiêu chí này thì đường phải HỞ.
      // Điền 0 sẽ vẽ một cú rơi thẳng xuống đáy trông y như tụt trình độ.
      row[criterionKey(criterionIndex)] = value ?? null;
    });
    return row;
  });
}
