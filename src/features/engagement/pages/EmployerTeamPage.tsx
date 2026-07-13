import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { TeamMemberTable } from '../components/TeamMemberTable';
import { useEmployerTeam } from '../hooks/useEngagement';

export function EmployerTeamPage() {
  const { t } = useLanguage();
  const { team, invite } = useEmployerTeam();

  return (
    <EngagementPageShell eyebrow="SCR-EMP-068" title={t('engagement.team.title')} description={t('engagement.team.description')}>
      <TeamMemberTable team={team} onInvite={invite} />
    </EngagementPageShell>
  );
}
