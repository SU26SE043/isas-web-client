// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminInterviewService } from '../services/adminInterview.service';
import type { KnowledgeSource } from '../types/adminApi.types';
import { AdminKnowledgePage } from './AdminKnowledgePage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

// Shape `KnowledgeSourceResponse` (Interview, enum CHUỘI) — chép từ dev 2026-09-16.
const bdd: KnowledgeSource = { id: '4b072fae-8461-46b4-9fee-a948f084311f', title: 'Agile Alliance — BDD', jobCategory: 'BA', sourceType: 'Url', sourceRef: 'https://www.agilealliance.org/glossary/bdd/', reputation: null, status: 'Active', chunkCount: 52, createdAt: '2026-09-14T18:07:04Z' };
const react: KnowledgeSource = { ...bdd, id: 'r1', title: 'react.dev — Hooks', jobCategory: 'FE', sourceType: 'Context7', reputation: '10', chunkCount: 146 };

const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminKnowledgePage /></MemoryRouter></QueryClientProvider>);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminKnowledgePage', () => {
  it('liệt kê nguồn với loại/uy tín/số đoạn; lọc nghề gửi ?jobCategory= và về trang đầu', async () => {
    const spy = vi.spyOn(adminInterviewService, 'listKnowledge').mockResolvedValue({ items: [bdd, react], nextCursor: 'C2' });
    renderPage();
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ limit: 20 }));
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Agile Alliance — BDD')).toBeInTheDocument();
    expect(within(table).getByText('admin.knowledge.type.context7')).toBeInTheDocument();
    expect(within(table).getByText('146')).toBeInTheDocument();
    // Sang trang 2 rồi mới lọc: cursor của tập cũ KHÔNG được mang theo (trang 2 của "tất cả" không phải trang 2 của "BA").
    fireEvent.click(screen.getByRole('button', { name: 'ds.pagination.next' }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ cursor: 'C2', limit: 20 }));
    fireEvent.change(screen.getByLabelText('admin.knowledge.filter.category'), { target: { value: 'BA' } });
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ jobCategory: 'BA', limit: 20 }));
  });

  it('Thêm nguồn URL: jobCategory bắt buộc trong payload, chỉ gửi url (không content); 201 ⇒ đóng dialog + tải lại danh sách', async () => {
    const listSpy = vi.spyOn(adminInterviewService, 'listKnowledge').mockResolvedValue({ items: [bdd], nextCursor: null });
    const createSpy = vi.spyOn(adminInterviewService, 'createKnowledge').mockResolvedValue({ ...bdd, id: 'new' });
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(screen.getByRole('button', { name: 'admin.knowledge.add.open' }));
    const submit = await screen.findByRole('button', { name: 'admin.knowledge.add.submit' });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText('admin.knowledge.add.name'), { target: { value: 'MDN ARIA' } });
    fireEvent.change(screen.getByLabelText('admin.knowledge.add.category'), { target: { value: 'FE' } });
    fireEvent.change(screen.getByLabelText('admin.knowledge.add.url'), { target: { value: 'not a url' } });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText('admin.knowledge.add.url'), { target: { value: 'https://developer.mozilla.org/aria' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(createSpy).toHaveBeenCalledWith({ title: 'MDN ARIA', jobCategory: 'FE', sourceType: 'Url', url: 'https://developer.mozilla.org/aria' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'admin.knowledge.add.submit' })).toBeNull());
    await waitFor(() => expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it('Xoá có confirm nêu tên; huỷ ⇒ KHÔNG gọi API; xác nhận ⇒ DELETE đúng id', async () => {
    vi.spyOn(adminInterviewService, 'listKnowledge').mockResolvedValue({ items: [bdd], nextCursor: null });
    const delSpy = vi.spyOn(adminInterviewService, 'deleteKnowledge').mockResolvedValue(undefined);
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(screen.getByRole('button', { name: 'admin.knowledge.delete' }));
    expect(await screen.findByText('admin.knowledge.deleteConfirm.title')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.cancel' }));
    await waitFor(() => expect(screen.queryByText('admin.knowledge.deleteConfirm.title')).toBeNull());
    expect(delSpy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'admin.knowledge.delete' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'admin.knowledge.delete' })).at(-1)!);
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith(bdd.id));
  });

  it('Context7: Tìm ⇒ gọi search; chọn 1 thư viện + gõ chủ đề ⇒ Nạp gửi {libraryId, topics[], jobCategory}; kết quả là MỘT nguồn', async () => {
    vi.spyOn(adminInterviewService, 'listKnowledge').mockResolvedValue({ items: [], nextCursor: null });
    const searchSpy = vi.spyOn(adminInterviewService, 'searchContext7').mockResolvedValue([{ id: '/facebook/react', title: 'React', reputation: '10', snippets: 1200 }, { id: '/someone/react-fork', title: 'React', reputation: '3', snippets: 40 }]);
    const ingestSpy = vi.spyOn(adminInterviewService, 'ingestContext7').mockResolvedValue(react);
    renderPage();
    await screen.findByText('admin.knowledge.empty');
    fireEvent.click(screen.getByRole('button', { name: 'admin.knowledge.c7.open' }));
    fireEvent.change(await screen.findByLabelText('admin.knowledge.c7.library'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.knowledge.c7.search' }));
    await waitFor(() => expect(searchSpy).toHaveBeenCalledWith('react', undefined));
    const ingest = screen.getByRole('button', { name: 'admin.knowledge.c7.ingest' });
    expect(ingest).toBeDisabled();
    fireEvent.click(await screen.findByText('/facebook/react'));
    fireEvent.change(screen.getByLabelText('admin.knowledge.c7.topics'), { target: { value: 'hooks\nsuspense' } });
    fireEvent.change(screen.getByLabelText('admin.knowledge.add.category'), { target: { value: 'FE' } });
    expect(ingest).toBeEnabled();
    fireEvent.click(ingest);
    await waitFor(() => expect(ingestSpy).toHaveBeenCalledWith({ libraryId: '/facebook/react', topics: ['hooks', 'suspense'], jobCategory: 'FE' }));
  });
});
