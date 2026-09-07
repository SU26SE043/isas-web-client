import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppPagination } from '@/components/ui/app-pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminDirectoryToolbar } from '../components/directory/AdminDirectoryToolbar';
import { AdminUsersTable } from '../components/directory/AdminUsersTable';
import { AdminUserActionDialogs } from '../components/directory/AdminUserActionDialogs';
import { useAdminUserActions, useAdminUsers } from '../hooks/useAdminDirectory';
import { useDirectoryCursor } from '../hooks/useDirectoryCursor';
import type { AdminDirectoryRoleFilter, AdminDirectoryUser } from '../types/adminDirectory.types';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 500] as const;

export function AdminUsersPage() {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<AdminDirectoryRoleFilter>('all');
  const pagination = useDirectoryCursor();
  const actions = useAdminUserActions();
  const [selectedAction, setSelectedAction] = useState<'ban' | 'unban' | 'reset' | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminDirectoryUser | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const query = useAdminUsers({
    ...(search ? { search } : {}),
    ...(role !== 'all' ? { role } : {}),
    ...(pagination.currentCursor ? { cursor: pagination.currentCursor } : {}),
    limit: pagination.pageSize,
  });
  const nextCursor = query.data?.nextCursor ?? null;

  const commitSearch = () => {
    const next = searchInput.trim();
    if (next === search) return;
    setSearch(next);
    pagination.reset();
  };

  const changeRole = (next: AdminDirectoryRoleFilter) => {
    setRole(next);
    pagination.reset();
  };

  const refresh = () => {
    if (searchInput.trim() !== search) {
      commitSearch();
      return;
    }
    void query.refetch();
  };

  const status = getApiStatusCode(query.error);
  const errorKey = status === 401
    ? 'admin.directory.errors.unauthorized'
    : status === 403
      ? 'admin.directory.errors.forbidden'
      : 'admin.directory.errors.load';
  const activeMutation = selectedAction === 'ban'
    ? actions.ban
    : selectedAction === 'unban'
      ? actions.unban
      : actions.resetPassword;
  const actionStatus = getApiStatusCode(activeMutation.error);
  const actionErrorKey = actionStatus === 401
    ? 'admin.users.actions.errors.unauthorized'
    : actionStatus === 403
      ? 'admin.users.actions.errors.forbidden'
      : actionStatus === 404
        ? 'admin.users.actions.errors.notFound'
        : actionStatus === 409
          ? `admin.users.actions.errors.${selectedAction === 'unban' ? 'notBanned' : 'conflict'}`
          : actionStatus === 400
            ? `admin.users.actions.errors.${selectedAction === 'reset' ? 'weakPassword' : 'invalid'}`
            : 'admin.users.actions.errors.failed';

  const openAction = (action: 'ban' | 'unban' | 'reset', user: AdminDirectoryUser) => {
    actions.ban.reset();
    actions.unban.reset();
    actions.resetPassword.reset();
    setActionSuccess(null);
    setSelectedAction(action);
    setSelectedUser(user);
  };

  const closeAction = () => {
    if (activeMutation.isPending) return;
    setSelectedAction(null);
    setSelectedUser(null);
  };

  const completeAction = (successKey: string) => {
    setActionSuccess(t(successKey));
    setSelectedAction(null);
    setSelectedUser(null);
  };

  return (
    <AdminPageShell
      title={t('admin.users.title')}
      description={t('admin.users.description')}
      actions={query.data ? <p className="text-sm text-muted-foreground">{t('admin.directory.pageCount').replace('{count}', String(query.data.items.length))}</p> : null}
    >
      <AdminDirectoryToolbar
        search={searchInput}
        role={role}
        isFetching={query.isFetching}
        onSearchChange={setSearchInput}
        onSearchCommit={commitSearch}
        onRoleChange={changeRole}
        onRefresh={refresh}
      />

      {actionSuccess ? (
        <Alert variant="success"><AlertDescription>{actionSuccess}</AlertDescription></Alert>
      ) : null}
      {query.isLoading ? <div aria-label={t('admin.directory.loading')} className="h-72 animate-pulse rounded-xl border border-satin bg-surface-raised" /> : null}
      {query.isError ? (
        <div className="space-y-3">
          <Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert>
          {status !== 401 && status !== 403 ? <Button variant="outline" onClick={() => void query.refetch()}>{t('admin.directory.retry')}</Button> : null}
        </div>
      ) : null}
      {query.data && !query.isError ? (
        query.data.items.length === 0 ? (
          <EmptyState variant="no-results" title={t('admin.directory.empty')} description={t('admin.directory.emptyDescription')} />
        ) : (
          <div className="space-y-4">
            <AdminUsersTable
              items={query.data.items}
              disabled={activeMutation.isPending}
              onAction={openAction}
            />
            <AppPagination
              mode="cursor"
              currentPage={pagination.pageNumber}
              pageSize={pagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              itemCount={query.data.items.length}
              itemLabel={t('admin.users.itemLabel')}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={Boolean(nextCursor)}
              isLoading={query.isFetching}
              onPageSizeChange={pagination.changePageSize}
              onPreviousPage={pagination.previous}
              onNextPage={() => pagination.next(nextCursor)}
            />
          </div>
        )
      ) : null}
      <AdminUserActionDialogs
        action={selectedAction}
        user={selectedUser}
        errorMessage={activeMutation.isError ? t(actionErrorKey) : null}
        loading={activeMutation.isPending}
        onClose={closeAction}
        onBan={(reason) => {
          if (!selectedUser) return;
          actions.ban.mutate(
            { userId: selectedUser.id, input: { ...(reason ? { reason } : {}) } },
            { onSuccess: () => completeAction('admin.users.actions.banSuccess') },
          );
        }}
        onUnban={() => {
          if (!selectedUser) return;
          actions.unban.mutate(
            selectedUser.id,
            { onSuccess: () => completeAction('admin.users.actions.unbanSuccess') },
          );
        }}
        onResetPassword={(newPassword) => {
          if (!selectedUser) return;
          actions.resetPassword.mutate(
            { userId: selectedUser.id, input: { newPassword } },
            { onSuccess: () => completeAction('admin.users.actions.resetSuccess') },
          );
        }}
      />
    </AdminPageShell>
  );
}
