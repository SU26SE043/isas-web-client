// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminDirectoryService } from '../../services/adminDirectory.service';
import { EMPTY_OWNER, OwnerPicker, type OwnerSelection } from './OwnerPicker';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const USER = { id: 'u1000000-0000-0000-0000-000000000001', email: 'duc@example.com', fullName: 'Duc Le', role: 'Candidate' as const, createdAt: '2026-09-01T00:00:00Z' };

function Harness({ initial = EMPTY_OWNER, onChange }: { initial?: OwnerSelection; onChange: (v: OwnerSelection) => void }) {
  return <OwnerPicker value={initial} onChange={onChange} />;
}
const renderPicker = (initial?: OwnerSelection) => {
  const onChange = vi.fn();
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><Harness initial={initial} onChange={onChange} /></QueryClientProvider>);
  return onChange;
};
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('OwnerPicker — Tổ chức chọn theo tên, Cá nhân tìm theo email', () => {
  it('đổi loại chủ ví ⇒ xoá id cũ (id org không phải id user)', async () => {
    vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [], nextCursor: null });
    const onChange = renderPicker({ ownerType: 0, ownerId: 'org-1', ownerLabel: 'Acme' });
    fireEvent.change(await screen.findByLabelText('admin.picker.owner.type'), { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith({ ownerType: 1, ownerId: '', ownerLabel: '' });
  });

  it('Cá nhân: dưới 3 ký tự KHÔNG gọi API; đủ 3 ⇒ gọi getAdminUsers({search}) và bấm chọn ⇒ onChange mang email làm nhãn', async () => {
    const spy = vi.spyOn(adminDirectoryService, 'getAdminUsers').mockResolvedValue({ items: [USER], nextCursor: null });
    const onChange = renderPicker({ ownerType: 1, ownerId: '', ownerLabel: '' });
    const input = screen.getByLabelText('admin.picker.owner.email');
    fireEvent.change(input, { target: { value: 'du' } });
    await new Promise((r) => setTimeout(r, 400));
    expect(spy).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'duc' } });
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ search: 'duc' })), { timeout: 2000 });
    fireEvent.click(await screen.findByText('duc@example.com'));
    expect(onChange).toHaveBeenCalledWith({ ownerType: 1, ownerId: USER.id, ownerLabel: 'duc@example.com' });
  });

  it('đã chọn Cá nhân ⇒ hiện email + nút Đổi trả về rỗng', () => {
    const onChange = renderPicker({ ownerType: 1, ownerId: USER.id, ownerLabel: USER.email });
    expect(screen.getByText(USER.email)).toBeInTheDocument();
    fireEvent.click(screen.getByText('admin.picker.owner.change'));
    expect(onChange).toHaveBeenCalledWith({ ownerType: 1, ownerId: '', ownerLabel: '' });
  });
});
