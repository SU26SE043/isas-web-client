import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { TeamMember, TeamRole } from '../types/engagement.types';

interface TeamMemberTableProps {
  team: TeamMember[];
  isLoading: boolean;
  isMutating: boolean;
  onRoleChange: (userId: string, orgRole: TeamRole) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

export function TeamMemberTable({
  team,
  isLoading,
  isMutating,
  onRoleChange,
  onRemove,
}: TeamMemberTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const formatJoinedAt = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
  };

  return (
    <section>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('engagement.team.member')}</TableHead>
              <TableHead>{t('engagement.team.role')}</TableHead>
              <TableHead>{t('engagement.team.joinedAt')}</TableHead>
              <TableHead className="text-right">{t('engagement.team.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} role="status">{t('engagement.team.loading')}</TableCell>
              </TableRow>
            ) : null}
            {!isLoading && team.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>{t('engagement.team.empty')}</TableCell>
              </TableRow>
            ) : null}
            {team.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <p className="font-medium text-foreground">{member.fullName || member.email}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </TableCell>
                <TableCell>{renderRoleSelect(member, false)}</TableCell>
                <TableCell>{formatJoinedAt(member.joinedAt)}</TableCell>
                <TableCell className="text-right">{renderRemoveButton(member, false)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? <p role="status">{t('engagement.team.loading')}</p> : null}
        {!isLoading && team.length === 0 ? <p>{t('engagement.team.empty')}</p> : null}
        {team.map((member) => (
          <article key={member.userId} className="frame-satin space-y-3 rounded-xl bg-surface-raised p-4">
            <div>
              <p className="font-medium text-foreground">{member.fullName || member.email}</p>
              <p className="break-all text-xs text-muted-foreground">{member.email}</p>
            </div>
            {renderRoleSelect(member, true)}
            <p className="text-xs text-muted-foreground">
              {t('engagement.team.joinedAt')}: {formatJoinedAt(member.joinedAt)}
            </p>
            {renderRemoveButton(member, true)}
          </article>
        ))}
      </div>
    </section>
  );

  function renderRoleSelect(member: TeamMember, fullWidth: boolean) {
    return (
      <>
        <label className="sr-only" htmlFor={`member-role-${fullWidth ? 'mobile' : 'desktop'}-${member.userId}`}>
          {t('engagement.team.changeRole')}
        </label>
        <select
          id={`member-role-${fullWidth ? 'mobile' : 'desktop'}-${member.userId}`}
          className={`h-8 rounded-lg border border-satin bg-surface-overlay px-2 text-sm text-foreground ${fullWidth ? 'w-full' : ''}`}
          value={member.orgRole}
          disabled={isMutating}
          onChange={(event) => {
            void onRoleChange(member.userId, event.target.value as TeamRole).catch(
              () => undefined,
            );
          }}
        >
          {(['HrMember', 'OrgAdmin'] as TeamRole[]).map((role) => (
            <option key={role} value={role}>{t(`engagement.team.role.${role}`)}</option>
          ))}
        </select>
      </>
    );
  }

  function renderRemoveButton(member: TeamMember, fullWidth: boolean) {
    const memberName = member.fullName || member.email;
    return (
      <Button
        type="button"
        variant="destructive"
        className={fullWidth ? 'w-full' : ''}
        disabled={isMutating}
        aria-label={t('engagement.team.removeMemberAria').replace('{name}', memberName)}
        onClick={() => onRemove(member)}
      >
        <Trash2 aria-hidden />
        {t('engagement.team.removeMember')}
      </Button>
    );
  }
}
