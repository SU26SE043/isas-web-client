// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { adminInterviewService } from '../services/adminInterview.service';
import { AdminPromptsPage } from './AdminPromptsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const prompt = { key: 'seniority.Senior.profile', version: 1, body: null };
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminPromptsPage /></MemoryRouter></QueryClientProvider>);

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminPromptsPage', () => {
  it('shows loading state', () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(screen.getByText('admin.prompts.loading')).toBeInTheDocument();
  });

  it('shows a forbidden error without retry', async () => {
    const error = new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', undefined, undefined, { status: 403, statusText: 'Forbidden', headers: {}, config: {} as never, data: {} });
    vi.spyOn(adminInterviewService, 'listPrompts').mockRejectedValue(error);
    renderPage();
    expect(await screen.findByText('admin.prompts.forbidden')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.prompts.retry' })).not.toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('admin.prompts.emptyTitle')).toBeInTheDocument();
  });

  it('shows default badge and saves the selected prompt', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([prompt]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    const update = vi.spyOn(adminInterviewService, 'updatePrompt').mockResolvedValue({ ...prompt, body: 'new body', version: 2 });
    renderPage();
    expect((await screen.findAllByText('admin.prompts.defaultBadge')).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('admin.prompts.body'), { target: { value: 'new body' } });
    fireEvent.change(screen.getByLabelText(/admin\.prompts\.changeNote/), { target: { value: 'explain change' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.prompts.save' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('seniority.Senior.profile', { body: 'new body', changeNote: 'explain change' }));
  });

  it('ẨN 5 khoá chết (khai ở .NET nhưng không builder Python nào đọc) — sửa chúng không có tác dụng', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      prompt,
      { key: 'roadmap.guidance', version: 0, body: null },
      { key: 'lesson_theory.guidance', version: 0, body: null },
      { key: 'summarize_session.guidance', version: 0, body: null },
      { key: 'decide_next.guidance', version: 0, body: null },
      { key: 'criteria.guidance', version: 0, body: null },
      { key: 'questions.guidance', version: 1, body: 'Mỗi câu ≤ 20 từ.' },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    expect((await screen.findAllByText('admin.prompts.key.questions.guidance')).length).toBeGreaterThan(0);
    // Sidebar chỉ còn ĐÚNG 2 mục sống. Đo bằng số nút (aria-pressed) — không đo bằng "không thấy chuỗi khoá
    // thô", vì khoá chết không có nhãn sẽ hiện là "admin.prompts.key.unknown" chứ không hiện khoá thô
    // (mutation bỏ lọc từng XANH với phép đo cũ).
    const items = screen.getAllByRole('button', { pressed: false }).concat(screen.getAllByRole('button', { pressed: true }));
    expect(items).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /admin\.prompts\.key\.unknown/ })).not.toBeInTheDocument();
    // Nhãn người đọc thay khoá máy ở sidebar; khoá máy chỉ còn ở header editor (font-mono).
    expect(screen.getByRole('button', { name: /admin\.prompts\.key\.seniority\.profile/ })).toBeInTheDocument();
  });

  it('khoá ĐẦU tự chọn cũng tải lịch sử (bản cũ: selectedKey khởi tạo rỗng ⇒ history disabled)', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([prompt]);
    const history = vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([
      { key: prompt.key, version: 2, body: 'y', updatedBy: '11111111-2222-3333-4444-555555555555', updatedByEmail: 'admin@isas.local', changeNote: 'lý do đổi', createdAt: '2026-09-16T01:02:03Z' },
      // Bản cũ (trước B4) không có email ⇒ "không rõ người sửa", KHÔNG lộ Guid, KHÔNG gọi là "Hệ thống" (có người sửa, chỉ không biết ai).
      { key: prompt.key, version: 1, body: 'x', updatedBy: '11111111-2222-3333-4444-555555555555', updatedByEmail: null, changeNote: 'lần đầu', createdAt: '2026-09-15T01:02:03Z' },
    ]);
    renderPage();
    expect(await screen.findByText('lý do đổi')).toBeInTheDocument();
    expect(history).toHaveBeenCalledWith(prompt.key);
    // B4: hiện EMAIL người sửa; không in Guid thô ra mặt admin.
    expect(screen.getByText('admin@isas.local')).toBeInTheDocument();
    expect(screen.queryByText('11111111-2222-3333-4444-555555555555')).not.toBeInTheDocument();
    expect(screen.getByText('admin.prompts.unknownActor')).toBeInTheDocument();
    expect(screen.queryByText('admin.prompts.system')).not.toBeInTheDocument();
  });

  it('khe CHẤM mang cảnh báo "ảnh hưởng điểm số"; khe SINH thì không', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'scoring.extra_guidance', version: 0, body: null },
      { key: 'questions.guidance', version: 0, body: null },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    // Sắp theo nhóm: questions trước scoring ⇒ khoá đầu là questions.guidance (không cảnh báo).
    await screen.findAllByText('admin.prompts.key.questions.guidance');
    expect(screen.queryByText('admin.prompts.riskHint.scoring')).not.toBeInTheDocument();
    // Khe SINH: không có nút tự thử (chấm thử không đo thứ này).
    expect(screen.queryByRole('button', { name: /admin\.prompts\.tryRubric/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /admin\.prompts\.key\.scoring\.extra_guidance/ }));
    expect(await screen.findByText('admin.prompts.riskHint.scoring')).toBeInTheDocument();
    // Khe CHẤM: sửa xong phải thấy được hậu quả ⇒ nút nhảy thẳng sang tab tự thử (URL ghim `?tab=try`).
    // `Button render={<Link/>}` gắn role="button" lên <a> ⇒ tìm theo role button rồi kiểm href.
    expect(screen.getByRole('button', { name: /admin\.prompts\.tryRubric/ })).toHaveAttribute('href', '/admin/rubrics?tab=try');
  });

  it('ô ĐỔ SẴN đúng câu mặc định đang chạy; Lưu tắt khi chưa đổi gì, bật khi sửa và gửi đúng chữ đã sửa (bản cũ: ô trống câm)', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'questions.intro', version: 0, body: null, defaultBody: 'Bạn là một interviewer chuyên nghiệp cho vị trí {role}.' },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    const update = vi.spyOn(adminInterviewService, 'updatePrompt').mockResolvedValue({ key: 'questions.intro', version: 1, body: 'x', defaultBody: 'y' });
    renderPage();
    const box = await screen.findByLabelText('admin.prompts.body');
    expect(box).toHaveValue('Bạn là một interviewer chuyên nghiệp cho vị trí {role}.');
    expect(box).not.toHaveAttribute('readonly');
    expect(screen.getByRole('status')).toHaveTextContent('admin.prompts.effective.default');
    expect(screen.getByText('admin.prompts.placeholderHint')).toBeInTheDocument();
    expect(screen.queryByText('admin.prompts.defaultUnavailable')).not.toBeInTheDocument();
    // Chưa đổi gì ⇒ Lưu tắt kể cả khi đã ghi lý do — lưu y nguyên mặc định là tạo "bản tuỳ chỉnh" nói dối.
    fireEvent.change(screen.getByLabelText(/admin\.prompts\.changeNote/), { target: { value: 'lý do' } });
    expect(screen.getByRole('button', { name: 'admin.prompts.save' })).toBeDisabled();
    expect(screen.getByText('admin.prompts.unchangedHint')).toBeInTheDocument();
    fireEvent.change(box, { target: { value: 'Bạn là một interviewer chuyên nghiệp, kỹ tính, cho vị trí {role}.' } });
    expect(screen.queryByText('admin.prompts.unchangedHint')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.prompts.save' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('questions.intro', { body: 'Bạn là một interviewer chuyên nghiệp, kỹ tính, cho vị trí {role}.', changeNote: 'lý do' }));
  });

  it('"Hoàn tác sửa" trả ô về đúng chữ đang chạy', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'questions.intro', version: 0, body: null, defaultBody: 'Câu mặc định.' },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    const box = await screen.findByLabelText('admin.prompts.body');
    expect(screen.queryByRole('button', { name: 'admin.prompts.revert' })).not.toBeInTheDocument();
    fireEvent.change(box, { target: { value: 'Câu đã sửa.' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.prompts.revert' }));
    expect(box).toHaveValue('Câu mặc định.');
    expect(screen.queryByRole('button', { name: 'admin.prompts.revert' })).not.toBeInTheDocument();
  });

  it('khe ĐÃ TUỲ CHỈNH: ô đổ sẵn bản đã sửa (không phải mặc định) + có "Xem bản mặc định của hệ" để đối chiếu', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'questions.guidance', version: 1, body: 'Mỗi câu ≤ 20 từ.', defaultBody: '' },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByLabelText('admin.prompts.body')).toHaveValue('Mỗi câu ≤ 20 từ.');
    expect(screen.getByRole('status')).toHaveTextContent('admin.prompts.effective.custom');
    expect(screen.getByText('admin.prompts.showDefault')).toBeInTheDocument();
    expect(screen.getByText('admin.prompts.defaultEmpty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.prompts.reset' })).toBeEnabled();
  });

  it('defaultBody = "" (khe THÊM) ⇒ ô trống + nói "hệ không thêm gì"; defaultBody = null ⇒ nói "chưa lấy được", không giả vờ trống', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'questions.guidance', version: 0, body: null, defaultBody: '' },
      { key: 'scoring.persona', version: 0, body: null, defaultBody: null },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByLabelText('admin.prompts.body')).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('admin.prompts.effective.empty');
    expect(screen.queryByText('admin.prompts.showDefault')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /admin\.prompts\.key\.scoring\.persona/ }));
    expect(await screen.findByText('admin.prompts.defaultUnavailable')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('admin.prompts.body')).toHaveValue('');
  });
});
