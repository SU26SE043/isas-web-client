import type {
  CampaignCandidateListItem,
  InviteCampaignCandidatesResponse,
} from '../../types/campaign.api.types';
import { CandidateCvViewerModal } from './CandidateCvViewerModal';
import { CandidateDetailDrawer } from './CandidateDetailDrawer';
import { EditCandidateModal } from './EditCandidateModal';
import { InviteConfirmModal } from './InviteConfirmModal';
import { InviteResultModal } from './InviteResultModal';

interface CvScreeningModalsProps {
  campaignId: string;
  detailCandidateId: string | null;
  detail: Parameters<typeof CandidateDetailDrawer>[0]['detail'];
  detailLoading: boolean;
  detailError: boolean;
  isDetailSelected: boolean;
  canSelectDetail: boolean;
  onCloseDetail: () => void;
  onToggleDetailSelect: () => void;
  onViewCvFromDetail: () => void;
  onEditFromDetail: () => void;
  editingCandidate: CampaignCandidateListItem | null;
  onCloseEdit: () => void;
  viewingCvCandidate: CampaignCandidateListItem | null;
  onCloseCv: () => void;
  inviteConfirmOpen: boolean;
  inviteCount: number;
  inviteConfirming: boolean;
  onCancelInvite: () => void;
  onConfirmInvite: () => void;
  inviteResult: InviteCampaignCandidatesResponse | null;
  onCloseInviteResult: () => void;
  onRetryInviteFailed: () => void;
}

export function CvScreeningModals({
  campaignId,
  detailCandidateId,
  detail,
  detailLoading,
  detailError,
  isDetailSelected,
  canSelectDetail,
  onCloseDetail,
  onToggleDetailSelect,
  onViewCvFromDetail,
  onEditFromDetail,
  editingCandidate,
  onCloseEdit,
  viewingCvCandidate,
  onCloseCv,
  inviteConfirmOpen,
  inviteCount,
  inviteConfirming,
  onCancelInvite,
  onConfirmInvite,
  inviteResult,
  onCloseInviteResult,
  onRetryInviteFailed,
}: CvScreeningModalsProps) {
  return (
    <>
      <CandidateDetailDrawer
        open={Boolean(detailCandidateId)}
        onClose={onCloseDetail}
        detail={detail}
        isLoading={detailLoading}
        isError={detailError}
        isSelected={isDetailSelected}
        canSelect={canSelectDetail}
        onToggleSelect={onToggleDetailSelect}
        onViewCv={onViewCvFromDetail}
        onEdit={onEditFromDetail}
      />

      <EditCandidateModal
        open={Boolean(editingCandidate)}
        campaignId={campaignId}
        candidate={editingCandidate}
        onClose={onCloseEdit}
      />

      <CandidateCvViewerModal
        open={Boolean(viewingCvCandidate)}
        campaignId={campaignId}
        candidateId={viewingCvCandidate?.id ?? null}
        candidateName={viewingCvCandidate?.fullName}
        onClose={onCloseCv}
      />

      <InviteConfirmModal
        open={inviteConfirmOpen}
        count={inviteCount}
        isConfirming={inviteConfirming}
        onCancel={onCancelInvite}
        onConfirm={onConfirmInvite}
      />

      <InviteResultModal
        open={Boolean(inviteResult)}
        result={inviteResult}
        onClose={onCloseInviteResult}
        onRetryFailed={onRetryInviteFailed}
      />
    </>
  );
}
