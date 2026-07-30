import { Navigate, useParams } from 'react-router-dom';

type WorkspaceTarget =
  | 'overview-details'
  | 'overview-results'
  | 'invitation-screening'
  | 'invitation-compose'
  | 'invitation-list';

const TARGETS: Record<WorkspaceTarget, { workspace: 'overview' | 'invitations'; tab: string }> = {
  'overview-details': { workspace: 'overview', tab: 'details' },
  'overview-results': { workspace: 'overview', tab: 'results' },
  'invitation-screening': { workspace: 'invitations', tab: 'cv-screening' },
  'invitation-compose': { workspace: 'invitations', tab: 'invite' },
  'invitation-list': { workspace: 'invitations', tab: 'invitation-list' },
};

export function CampaignWorkspaceRedirect({ target }: { target: WorkspaceTarget }) {
  const { id = '' } = useParams();
  const destination = TARGETS[target];

  return (
    <Navigate
      to={`/employer/campaigns/${id}/${destination.workspace}?tab=${destination.tab}`}
      replace
    />
  );
}
