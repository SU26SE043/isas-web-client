/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionImportControl, type QuestionImportControlHandle } from './QuestionImportControl';
import { parseCampaignQuestionImport } from '../../../utils/campaignQuestionImport';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

/**
 * CMP3-F6 — nút "Nhập CSV" bấm được nhưng KHÔNG nhập được file. Hai lỗi độc lập, mỗi cái
 * đủ để chặn hoàn toàn, và không lỗi nào làm test cũ đỏ vì luồng này chưa có test nào.
 */
describe('CMP3-F6 — nhập câu hỏi từ CSV', () => {
  it('bấm "Nhập CSV" phải MỞ HỘP CHỌN TỆP, không phải mở hộp thoại rỗng', () => {
    // Bản hỏng: open() chỉ setOpen(true) ⇒ hộp thoại xem trước hiện lên mà không có ô chọn
    // file nào (input là sr-only, không ref, không label) ⇒ người dùng chuột hết đường.
    const ref = createRef<QuestionImportControlHandle>();
    const { container } = render(<QuestionImportControl ref={ref} existingCount={0} max={20} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    const clicked = vi.spyOn(input, 'click');
    ref.current?.open();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('disabled thì không mở hộp chọn tệp', () => {
    const ref = createRef<QuestionImportControlHandle>();
    const { container } = render(<QuestionImportControl ref={ref} existingCount={0} max={20} disabled />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clicked = vi.spyOn(input, 'click');
    ref.current?.open();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('đọc được mảng "questions" — tên khoá THẬT mà backend trả về', () => {
    // ImportQuestionsResult.Questions → JSON camelCase `questions`. Bản hỏng chỉ đọc `items`
    // ⇒ import 200 nhưng hộp thoại báo "0 dòng hợp lệ", nút xác nhận disabled vĩnh viễn.
    // Hỏng IM LẶNG: không lỗi, không cảnh báo.
    const parsed = parseCampaignQuestionImport({
      totalRows: 2,
      questions: [
        { questionText: 'Câu một', sampleAnswer: 'Gợi ý', isRequired: true, questionGroup: 'Kỹ thuật' },
        { questionText: 'Câu hai', sampleAnswer: null, isRequired: false, questionGroup: null },
      ],
      errors: [],
    });
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].questionText).toBe('Câu một');
    expect(parsed.items[0].isRequired).toBe(true);
    expect(parsed.items[0].questionGroup).toBe('Kỹ thuật');
  });

  it('số dòng lỗi lấy từ "line" — số dòng TRONG FILE, không phải chỉ số mảng', () => {
    // HR mở Excel nhảy theo số này; đọc sai tên khoá thì số bị bịa theo thứ tự phần tử.
    const parsed = parseCampaignQuestionImport({
      totalRows: 9,
      questions: [],
      errors: [{ line: 7, column: 'question_text', message: 'Thiếu nội dung câu hỏi' }],
    });
    expect(parsed.errors[0].rowNumber).toBe(7);
  });
});
