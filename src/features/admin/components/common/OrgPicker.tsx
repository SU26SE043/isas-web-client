import { useEffect, useId, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useAdminOrgOptions } from '../../hooks/useAdminOrgOptions';
import { shortId } from '../../utils/adminBilling';
import type { AdminOrganization } from '../../types/adminDirectory.types';

interface OrgPickerProps {
  /** Org id đang chọn ('' = chưa chọn). Có thể là id đến từ `?orgId=` chưa nằm trong danh sách đã tải. */
  value: string;
  onChange: (orgId: string, org: AdminOrganization | null) => void;
  disabled?: boolean;
  /** Ghi đè nhãn (mặc định "Tổ chức"). */
  labelKey?: string;
}

export const SELECT_CLASS = 'h-9 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60';
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Chọn tổ chức theo TÊN thay vì gõ GUID (bản cũ ở Ví & Postpaid bắt admin dán id tay — và không màn nào
 * cho biết id đó là ai). Ô tìm gửi `?search=` xuống BE nên org ngoài 500 dòng đầu vẫn tra được.
 * `value` không có trong danh sách (đến từ link `?orgId=` hoặc org đã xoá) vẫn hiện thành một option
 * "id rút gọn" để select không im lặng nhảy về rỗng.
 */
export function OrgPicker({ value, onChange, disabled, labelKey = 'admin.picker.org.label' }: OrgPickerProps) {
  const { t } = useLanguage();
  const id = useId();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => { const handle = window.setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS); return () => window.clearTimeout(handle); }, [search]);
  const { options, isLoading, isError } = useAdminOrgOptions(debounced);
  const valueKnown = !value || options.some((org) => org.id === value);

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-search`}>{t('admin.picker.org.search')}</Label>
        <Input id={`${id}-search`} value={search} disabled={disabled} placeholder={t('admin.picker.org.searchPlaceholder')} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-select`}>{t(labelKey)}</Label>
        <select
          id={`${id}-select`}
          className={SELECT_CLASS}
          value={value}
          disabled={disabled || isLoading}
          onChange={(event) => { const next = event.target.value; onChange(next, options.find((org) => org.id === next) ?? null); }}
        >
          <option value="">{isLoading ? t('admin.picker.org.loading') : t('admin.picker.org.placeholder')}</option>
          {!valueKnown ? <option value={value}>{t('admin.picker.org.unknownOption').replace('{id}', shortId(value))}</option> : null}
          {options.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        {isError ? <p className="text-xs text-error">{t('admin.picker.org.loadError')}</p> : null}
        {!isLoading && !isError && options.length === 0 ? <p className="text-xs text-muted-foreground">{t('admin.picker.org.empty')}</p> : null}
      </div>
    </div>
  );
}
