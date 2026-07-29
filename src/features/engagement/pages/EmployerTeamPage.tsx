import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { InviteTeamMemberForm } from '../components/InviteTeamMemberForm';
import { TeamMemberTable } from '../components/TeamMemberTable';
import { useEmployerTeam } from '../hooks/useEngagement';

export function EmployerTeamPage() {
  const { t } = useLanguage();
  const { team, isLoading, isMutating, errorKey, invite, updateRole } = useEmployerTeam();

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
        />
        <p className="text-xs text-muted-foreground">{t('engagement.team.roleRule')}</p>
      </div>
    </EngagementPageShell>
  );
}
