/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionImportDialog } from './QuestionImportDialog';
import type { CampaignQuestionImportResult } from '../../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

const result: CampaignQuestionImportResult = {
  totalRows: 3,
  items: [
    { rowNumber: 2, questionText: 'A', sampleAnswer: null, isRequired: false, questionGroup: null },
    { rowNumber: 3, questionText: 'B', sampleAnswer: null, isRequired: true, questionGroup: 'Kỹ thuật' },
    { rowNumber: 4, questionText: '', sampleAnswer: null, isRequired: false, questionGroup: null, error: 'Thiếu nội dung' },
  ],
  errors: [{ rowNumber: 9, message: 'Dòng rỗng' }],
};

/**
 * Hộp thoại xem trước CSV phải PORTAL ra `document.body`, không được vẽ inline trong cây bước 4.
 * Bản hỏng vẽ `fixed inset-0` ngay trong `<section class="backdrop-blur-xl">` của wizard ⇒
 * `backdrop-filter` biến section thành containing block ⇒ lớp phủ phủ lên section 3.400px và ô
 * hộp thoại căn giữa section, nằm ngoài viewport khi HR đã cuộn xuống nút "Nhập CSV". Không lỗi,
 * không cảnh báo — chỉ thấy màn tối. jsdom không tính layout nên phép kiểm là VỊ TRÍ TRONG CÂY.
 */
describe('QuestionImportDialog', () => {
  it('render qua portal: hộp thoại nằm NGOÀI container của component', () => {
    const { container } = render(
      <div className="backdrop-blur-xl">
        <QuestionImportDialog open result={result} accepted={result.items.slice(0, 2)} skipped={0} onClose={() => {}} onConfirm={() => {}} />
      </div>,
    );
    const dialog = screen.getByRole('dialog');
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });

  it('đọc được số dòng, lỗi từng dòng và số dòng bị cắt; nút nhập mang đúng số', () => {
    render(<QuestionImportDialog open result={result} accepted={result.items.slice(0, 2)} skipped={1} onClose={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText('employer.campaigns.campaignQuestions.import.rows')).toBeInTheDocument();
    expect(screen.getByText(/import\.row: Dòng rỗng/)).toBeInTheDocument();
    expect(screen.getByText(/import\.row: Thiếu nội dung/)).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.campaignQuestions.import.skipped')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'employer.campaigns.campaignQuestions.import.confirm' })).toBeEnabled();
  });

  it('0 dòng hợp lệ ⇒ nút nhập bị khoá; đóng gọi onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<QuestionImportDialog open result={{ ...result, items: [] }} accepted={[]} skipped={0} onClose={onClose} onConfirm={() => {}} />);
    expect(screen.getByRole('button', { name: 'employer.campaigns.campaignQuestions.import.confirm' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'employer.campaigns.campaignQuestions.import.cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('đang bận thì đóng bằng phím Escape KHÔNG gọi onClose (không cắt ngang lượt nhập)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<QuestionImportDialog open busy result={result} accepted={result.items.slice(0, 2)} skipped={0} onClose={onClose} onConfirm={() => {}} />);
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});
