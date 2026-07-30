import { RefreshCw, Search } from 'lucide-react';
import { type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { AdminDirectoryRoleFilter } from '../../types/adminDirectory.types';

interface AdminDirectoryToolbarProps {
  search: string;
  role?: AdminDirectoryRoleFilter;
  isFetching: boolean;
  onSearchChange: (value: string) => void;
  onSearchCommit: () => void;
  onRoleChange?: (value: AdminDirectoryRoleFilter) => void;
  onRefresh: () => void;
}

export function AdminDirectoryToolbar({
  search,
  role,
  isFetching,
  onSearchChange,
  onSearchCommit,
  onRoleChange,
  onRefresh,
}: AdminDirectoryToolbarProps) {
  const { t } = useLanguage();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearchCommit();
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-satin bg-surface-raised p-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('admin.directory.searchPlaceholder')}
          aria-label={t('admin.directory.search')}
        />
      </label>
      {role != null && onRoleChange ? (
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value as AdminDirectoryRoleFilter)}
          className="h-9 rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('admin.directory.roleFilter')}
        >
          <option value="all">{t('admin.directory.allRoles')}</option>
          {(['Candidate', 'OrgAdmin', 'HrMember', 'Admin'] as const).map((item) => (
            <option key={item} value={item}>{t(`admin.userRole.${item}`)}</option>
          ))}
        </select>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" variant="outline">{t('admin.directory.apply')}</Button>
        <Button type="button" variant="outline" disabled={isFetching} onClick={onRefresh}>
          <RefreshCw className={isFetching ? 'animate-spin' : ''} aria-hidden />
          {t('admin.directory.refresh')}
        </Button>
      </div>
    </form>
  );
}
