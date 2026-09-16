// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminDirectoryService } from '../../services/adminDirectory.service';
import { OrgPicker } from './OrgPicker';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const ORG_A = { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Zeta Corp', createdAt: '2026-09-01T00:00:00Z', memberCount: 2 };
const ORG_B = { id: 'bbbbbbbb-0000-0000-0000-000000000002', name: 'Acme HR', createdAt: '2026-09-02T00:00:00Z', memberCount: 1 };
const UNKNOWN = 'cccccccc-0000-0000-0000-000000000003';

const renderPicker = (value: string, onChange = vi.fn()) => {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><OrgPicker value={value} onChange={onChange} /></QueryClientProvider>);
  return onChange;
};
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('OrgPicker — chọn tổ chức theo tên thay vì gõ GUID', () => {
  it('tải danh sách (limit 500), sắp theo tên, chọn ⇒ onChange(id, org)', async () => {
    const spy = vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [ORG_A, ORG_B], nextCursor: null });
    const onChange = renderPicker('');
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ limit: 500 })));
    const select = await screen.findByLabelText('admin.picker.org.label');
    const labels = Array.from((select as HTMLSelectElement).options).map((o) => o.textContent);
    expect(labels).toEqual(['admin.picker.org.placeholder', 'Acme HR', 'Zeta Corp']);
    fireEvent.change(select, { target: { value: ORG_B.id } });
    expect(onChange).toHaveBeenCalledWith(ORG_B.id, ORG_B);
  });

  it('value đến từ ?orgId= mà không có trong danh sách ⇒ vẫn hiện option id rút gọn (select không im lặng về rỗng)', async () => {
    vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [ORG_A], nextCursor: null });
    renderPicker(UNKNOWN);
    const select = (await screen.findByLabelText('admin.picker.org.label')) as HTMLSelectElement;
    await waitFor(() => expect(select.value).toBe(UNKNOWN));
    expect(screen.getByText('admin.picker.org.unknownOption')).toBeInTheDocument();
  });

  it('ô tìm gửi ?search= xuống BE (org ngoài 500 dòng đầu vẫn tra được)', async () => {
    const spy = vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [], nextCursor: null });
    renderPicker('');
    fireEvent.change(await screen.findByLabelText('admin.picker.org.search'), { target: { value: 'acme' } });
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ search: 'acme' })), { timeout: 2000 });
  });
});
