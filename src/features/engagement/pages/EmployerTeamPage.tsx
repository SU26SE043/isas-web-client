import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { InviteTeamMemberForm } from '../components/InviteTeamMemberForm';
import { RemoveTeamMemberDialog } from '../components/RemoveTeamMemberDialog';
import { TeamMemberTable } from '../components/TeamMemberTable';
import { useEmployerTeam } from '../hooks/useEngagement';
import type { TeamMember } from '../types/engagement.types';

export function EmployerTeamPage() {
  const { t } = useLanguage();
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const { team, isLoading, isMutating, errorKey, invite, updateRole, removeMember } = useEmployerTeam();

  const confirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(memberToRemove.userId);
    } catch {
      // The hook exposes a localized API error after the dialog closes.
    } finally {
      setMemberToRemove(null);
    }
  };

  return (
    <EngagementPageShell eyebrow="SCR-EMP-068" title={t('engagement.team.title')} description={t('engagement.team.description')}>
      <div className="space-y-5">
        <InviteTeamMemberForm isSubmitting={isMutating} onInvite={invite} />
        {errorKey ? (
          <p className="rounded-lg border border-error/40 bg-error-bg px-4 py-3 text-sm text-error" role="alert">
            {t(errorKey)}
          </p>
        ) : null}
        <TeamMemberTable
          team={team}
          isLoading={isLoading}
          isMutating={isMutating}
          onRoleChange={updateRole}
          onRemove={setMemberToRemove}
        />
        <p className="text-xs text-muted-foreground">{t('engagement.team.roleRule')}</p>
      </div>
      <RemoveTeamMemberDialog
        member={memberToRemove}
        loading={isMutating}
        onOpenChange={(open) => {
          if (!open && !isMutating) setMemberToRemove(null);
        }}
        onConfirm={() => void confirmRemove()}
      />
    </EngagementPageShell>
  );
}
