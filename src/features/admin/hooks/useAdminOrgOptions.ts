import { useMemo } from 'react';
import { useAdminOrganizations } from './useAdminDirectory';
import type { AdminOrganization } from '../types/adminDirectory.types';

/** BE `GET /auth/admin/organizations` cap cứng 500/trang (`KeysetPage.cs`); một trang đủ cho quy mô hiện tại. */
export const ORG_OPTIONS_LIMIT = 500;

/**
 * Danh sách tổ chức để CHỌN thay vì gõ GUID (Ví & Postpaid · Đơn hàng · Cấp credit). `search` đi thẳng
 * xuống BE (`?search=` lọc theo tên) nên org rơi ngoài 500 dòng đầu vẫn tra được bằng ô tìm.
 */
export function useAdminOrgOptions(search = '') {
  const query = useAdminOrganizations({ limit: ORG_OPTIONS_LIMIT, ...(search.trim() ? { search: search.trim() } : {}) });
  const options = useMemo(
    () => [...(query.data?.items ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [query.data],
  );
  return { ...query, options };
}

/**
 * Map id → tên cho bảng (worklist postpaid, đơn hàng). Không tra được (org ngoài 500 dòng đầu, org đã xoá)
 * ⇒ caller hiện id rút gọn — không rỗng, không GUID đầy đủ.
 */
export function useAdminOrgNameMap() {
  const query = useAdminOrganizations({ limit: ORG_OPTIONS_LIMIT });
  const names = useMemo(() => new Map((query.data?.items ?? []).map((org: AdminOrganization) => [org.id, org.name] as const)), [query.data]);
  return { names, isLoading: query.isLoading };
}
