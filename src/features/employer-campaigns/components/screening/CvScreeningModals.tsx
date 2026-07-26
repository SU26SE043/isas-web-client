import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { CandidateCvViewerModal } from './CandidateCvViewerModal';
import { CandidateDetailDrawer } from './CandidateDetailDrawer';
import { EditCandidateModal } from './EditCandidateModal';

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
    </>
  );
}
