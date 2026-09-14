import { describe, expect, it } from 'vitest';

/**
 * UX3-F4 — con số chênh lệch phải NHÌN THẤY ĐƯỢC.
 *
 * Trước UX3, `GapAnalysisList` tô `{gap}%` bằng `text-white` trên thẻ nền sáng: tương phản 1.00:1,
 * con số biến mất hoàn toàn. Mũi tên ngay cạnh nó lại là `text-foreground` màu tối nên vẫn hiện —
 * người dùng thấy MỘT MŨI TÊN TRỎ LÊN KHÔNG CÓ SỐ.
 *
 * Đây là di sản nền tối: `text-white` đúng khi nền còn tối, chết lặng từ ngày 03/09/2026.
 * Lưới màu `theme-regression` không bắt được vì `text-white` không thuộc bậc pallet nào.
 *
 * ⚠ GIỚI HẠN CỦA LƯỚI NÀY, đọc trước khi thêm file vào danh sách miễn trừ.
 * Quét theo DÒNG nên không thấy được nền của phần tử TỔ TIÊN. Bản đầu của lưới này bắt oan cả ba
 * ca đầu tiên — `text-white` ở đó nằm trong container `bg-black/55`, `bg-black/45`, `bg-black/70`.
 * Vì vậy miễn trừ theo FILE, kèm lý do đọc được, thay vì nới biểu thức cho tới lúc nó hết bắt gì.
 *
 * Thêm file vào danh sách chỉ khi TOÀN BỘ component render trên một bề mặt tối tường minh (lớp phủ,
 * video, scrim). Nếu chỉ MỘT phần tử nằm trên nền tối thì đừng miễn trừ cả file — tách component.
 */
const darkSurfaceComponents: Record<string, string> = {
  'src/features/practice/components/AIInterviewerPanel.tsx':
    'nhãn + tên đặt trên khung video, container bg-black/55 và bg-black/45',
  'src/features/practice/components/QuestionStartCountdown.tsx':
    'lớp phủ đếm ngược toàn màn, gốc component bg-black/70 backdrop-blur-xl',
};

const sources = import.meta.glob('/src/features/practice/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('UX3-F4 — chữ trắng trên nền sáng ở luồng luyện tập', () => {
  it('không có class text-white nào ngoài các component render trên nền tối', () => {
    expect(Object.keys(sources).length, 'glob hụt — lưới này vô hiệu').toBeGreaterThan(0);

    const offenders = Object.entries(sources)
      .map(([file, source]) => [file.replace(/^\//, ''), source] as const)
      .filter(([rel]) => !(rel in darkSurfaceComponents))
      .flatMap(([rel, source]) =>
        source
          .split('\n')
          .flatMap((line, i) =>
            /\btext-white\b/.test(line) && !/\bbg-[\w[\]/.-]+/.test(line)
              ? [`${rel}:${i + 1}: ${line.trim()}`]
              : [],
          ),
      );

    expect(
      offenders,
      'text-white trên nền sáng = chữ vô hình (tương phản 1.00:1).\n' +
        'Đã xảy ra thật với con số {gap}% ở GapAnalysisList: mũi tên hiện, con số biến mất.\n' +
        'Dùng token màu chữ (text-foreground / text-muted-foreground).\n' +
        'Nếu component thật sự render trên nền tối, thêm nó vào darkSurfaceComponents KÈM LÝ DO.\n\n' +
        offenders.join('\n'),
    ).toEqual([]);
  });

  it('danh sách miễn trừ hữu hạn và mọi file trong đó còn tồn tại', () => {
    const known = new Set(Object.keys(sources).map((f) => f.replace(/^\//, '')));
    const stale = Object.keys(darkSurfaceComponents).filter((f) => !known.has(f));
    expect(
      stale,
      'File trong danh sách miễn trừ đã bị xoá hoặc đổi tên — gỡ khỏi danh sách,\n' +
        'nếu không nó sẽ âm thầm che một file mới trùng đường dẫn về sau.',
    ).toEqual([]);
  });
});
