/**
 * MỘT khuôn lưới duy nhất cho hàng tiêu chí và dòng tiêu đề cột. Trước đây hai chỗ khai
 * hai template khác nhau (`1.1fr_1.3fr_7.5rem_7rem_auto` ở tiêu đề vs
 * `18rem-1.15fr_1.45fr_7.5rem_7rem_auto` ở hàng) nên nhãn cột không nằm đúng trên ô nó
 * mô tả. Sửa một chỗ là hai chỗ cùng đổi.
 */
export const CRITERIA_ROW_GRID = 'lg:grid-cols-[minmax(0,1fr)_7.5rem_7rem_auto]';

/**
 * Padding ngang của một hàng = viền 1px của `article` + `px-3` (`sm:px-4`). Dòng tiêu đề
 * phải khớp đúng số này, nếu không nhãn cột lệch khỏi ô nhập nó mô tả.
 */
export const CRITERIA_HEADER_PADDING = 'px-[calc(0.75rem+1px)] sm:px-[calc(1rem+1px)]';
