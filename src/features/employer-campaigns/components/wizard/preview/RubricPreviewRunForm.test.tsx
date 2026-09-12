/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { previewQuestions } from '../../../mocks/rubricPreview.fixtures';
import { RubricPreviewRunForm, truncatePrompt } from './RubricPreviewRunForm';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.confirm.description': 'Lưu sẽ tạo thước đo v{{next}}, người đã thi giữ v{{current}}.',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

const base = {
  questions: previewQuestions,
  isRunning: false,
  savesBeforeRun: false,
  requireConfirm: false,
  currentRubricVersion: null,
};

describe('RubricPreviewRunForm', () => {
  it('mặc định chọn câu BẮT BUỘC đầu tiên; option hiện prompt cắt 80 ký tự', () => {
    render(<RubricPreviewRunForm {...base} onRun={vi.fn()} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('q-2');
    const longOption = screen.getByRole('option', { name: /^Câu 2 \(bắt buộc\)/ });
    expect(longOption.textContent?.length).toBeLessThanOrEqual(81);
    expect(longOption.textContent?.endsWith('…')).toBe(true);
    expect(truncatePrompt('ngắn')).toBe('ngắn');
  });

  it('gửi questionId đã chọn; custom answer chỉ gửi khi mở ô và có nội dung (đã trim)', async () => {
    const onRun = vi.fn();
    const user = userEvent.setup();
    render(<RubricPreviewRunForm {...base} onRun={onRun} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'q-3' } });
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' }));
    expect(onRun).toHaveBeenLastCalledWith({ questionId: 'q-3', customAnswer: null });

    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.custom.toggle' }));
    expect(screen.getByText('employer.campaigns.rubricPreview.custom.hint')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), '  transcript ứng viên  ');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' }));
    expect(onRun).toHaveBeenLastCalledWith({ questionId: 'q-3', customAnswer: 'transcript ứng viên' });
  });

  it('nhãn nút đổi theo có/không bước lưu; bị chặn ⇒ disabled; đang chạy ⇒ spinner + chữ đang chạy', () => {
    const { unmount } = render(<RubricPreviewRunForm {...base} savesBeforeRun onRun={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).toBeEnabled();
    unmount();
    const { unmount: unmount2 } = render(<RubricPreviewRunForm {...base} disabled onRun={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeDisabled();
    unmount2();
    render(<RubricPreviewRunForm {...base} isRunning onRun={vi.fn()} />);
    const button = screen.getByRole('button', { name: /rubricPreview\.running/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('campaign Active + có bước lưu ⇒ HỎI TRƯỚC, nêu v{N+1}/v{N}; huỷ thì KHÔNG chạy, xác nhận mới chạy', async () => {
    const onRun = vi.fn();
    const user = userEvent.setup();
    render(<RubricPreviewRunForm {...base} savesBeforeRun requireConfirm currentRubricVersion={2} onRun={onRun} />);

    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' }));
    expect(onRun).not.toHaveBeenCalled();
    expect(await screen.findByText('Lưu sẽ tạo thước đo v3, người đã thi giữ v2.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.confirm.cancel' }));
    await waitFor(() => expect(screen.queryByText('employer.campaigns.rubricPreview.confirm.title')).not.toBeInTheDocument());
    expect(onRun).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' }));
    await user.click(await screen.findByRole('button', { name: 'employer.campaigns.rubricPreview.confirm.confirm' }));
    expect(onRun).toHaveBeenCalledWith({ questionId: 'q-2', customAnswer: null });
  });

  it('không biết version hiện tại ⇒ câu confirm không bịa số', async () => {
    const user = userEvent.setup();
    render(<RubricPreviewRunForm {...base} savesBeforeRun requireConfirm onRun={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' }));
    expect(await screen.findByText('employer.campaigns.rubricPreview.confirm.descriptionUnknown')).toBeInTheDocument();
  });

  it('compact: chỉ có nút, vẫn hỏi trước khi Active + lưu', async () => {
    const onRun = vi.fn();
    const user = userEvent.setup();
    render(<RubricPreviewRunForm {...base} compact savesBeforeRun requireConfirm currentRubricVersion={1} onRun={onRun} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' }));
    expect(onRun).not.toHaveBeenCalled();
    await user.click(await screen.findByRole('button', { name: 'employer.campaigns.rubricPreview.confirm.confirm' }));
    expect(onRun).toHaveBeenCalledWith({ questionId: 'q-2', customAnswer: null });
  });

  it('không có câu hỏi nào ⇒ nút disabled, select KHÔNG trống (option "chưa có câu hỏi")', () => {
    render(<RubricPreviewRunForm {...base} questions={[]} onRun={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeDisabled();
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveTextContent('employer.campaigns.rubricPreview.question.empty');
  });

  it('initialQuestionId hợp lệ được giữ; không hợp lệ rơi về mặc định', () => {
    const { unmount } = render(<RubricPreviewRunForm {...base} initialQuestionId="q-1" onRun={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('q-1');
    unmount();
    render(<RubricPreviewRunForm {...base} initialQuestionId="q-ghost" onRun={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('q-2');
  });
});
