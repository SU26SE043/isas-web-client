import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useAdminUsers } from '../../hooks/useAdminDirectory';
import { OWNER_TYPE_ORG, OWNER_TYPE_USER } from '../../utils/adminBilling';
import { OrgPicker, SELECT_CLASS } from './OrgPicker';

export interface OwnerSelection { ownerType: number; ownerId: string; /** Tên/email để hiện trong confirm — không gửi lên BE. */ ownerLabel: string }
export const EMPTY_OWNER: OwnerSelection = { ownerType: OWNER_TYPE_ORG, ownerId: '', ownerLabel: '' };

interface OwnerPickerProps { value: OwnerSelection; onChange: (next: OwnerSelection) => void; disabled?: boolean }

const USER_SEARCH_MIN = 3;
const USER_SEARCH_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Chủ ví cho các thao tác tiền: Tổ chức → chọn theo tên (`OrgPicker`); Cá nhân → tìm theo email rồi
 * bấm chọn 1 người. Đổi loại chủ ví ⇒ xoá lựa chọn cũ (id của org không phải id của user).
 */
export function OwnerPicker({ value, onChange, disabled }: OwnerPickerProps) {
  const { t } = useLanguage();
  const id = useId();
  const [email, setEmail] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => { const handle = window.setTimeout(() => setDebounced(email.trim()), SEARCH_DEBOUNCE_MS); return () => window.clearTimeout(handle); }, [email]);
  const canSearch = value.ownerType === OWNER_TYPE_USER && debounced.length >= USER_SEARCH_MIN && !value.ownerId;
  const users = useAdminUsers({ search: debounced, limit: USER_SEARCH_LIMIT }, { enabled: canSearch });
  const results = canSearch ? users.data?.items ?? [] : [];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-type`}>{t('admin.picker.owner.type')}</Label>
        <select id={`${id}-type`} className={SELECT_CLASS} value={value.ownerType} disabled={disabled} onChange={(event) => onChange({ ownerType: Number(event.target.value), ownerId: '', ownerLabel: '' })}>
          <option value={OWNER_TYPE_ORG}>{t('admin.money.owner.org')}</option>
          <option value={OWNER_TYPE_USER}>{t('admin.money.owner.user')}</option>
        </select>
      </div>
      {value.ownerType === OWNER_TYPE_ORG ? (
        <OrgPicker value={value.ownerId} disabled={disabled} onChange={(orgId, org) => onChange({ ownerType: OWNER_TYPE_ORG, ownerId: orgId, ownerLabel: org?.name ?? orgId })} />
      ) : value.ownerId ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-satin bg-surface-overlay/60 px-3 py-2 text-sm">
          <span className="font-medium text-foreground">{value.ownerLabel}</span>
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => { setEmail(''); onChange({ ownerType: OWNER_TYPE_USER, ownerId: '', ownerLabel: '' }); }}>{t('admin.picker.owner.change')}</Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-email`}>{t('admin.picker.owner.email')}</Label>
          <Input id={`${id}-email`} value={email} disabled={disabled} placeholder={t('admin.picker.owner.emailPlaceholder')} onChange={(event) => setEmail(event.target.value)} />
          {debounced.length > 0 && debounced.length < USER_SEARCH_MIN ? <p className="text-xs text-muted-foreground">{t('admin.picker.owner.minChars').replace('{n}', String(USER_SEARCH_MIN))}</p> : null}
          {canSearch && users.isFetched && results.length === 0 ? <p className="text-xs text-muted-foreground">{t('admin.picker.owner.noResults')}</p> : null}
          {results.length ? (
            <ul className="max-h-48 divide-y divide-satin overflow-auto rounded-lg border border-satin" aria-label={t('admin.picker.owner.results')}>
              {results.map((user) => (
                <li key={user.id}>
                  <button type="button" className="flex w-full flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-overlay" onClick={() => onChange({ ownerType: OWNER_TYPE_USER, ownerId: user.id, ownerLabel: user.email })}>
                    <span className="text-foreground">{user.email}</span>
                    <span className="text-xs text-muted-foreground">{user.fullName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
