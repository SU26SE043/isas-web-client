import { create } from 'zustand';

export type InvitationCandidateSource = 'cv-screening' | 'manual' | 'file';

export interface SelectedInvitationCandidate {
  id?: string;
  fullName?: string;
  email: string;
  cvText?: string | null;
  eligible?: boolean | null;
  missingMustHave?: string[] | null;
  matchScore?: number;
  source: InvitationCandidateSource;
}

interface CampaignInvitationStore {
  campaignId: string | null;
  selectedCandidates: SelectedInvitationCandidate[];
  setSelectedCandidates: (
    campaignId: string,
    candidates: SelectedInvitationCandidate[],
  ) => void;
  addCandidates: (
    campaignId: string,
    candidates: SelectedInvitationCandidate[],
  ) => void;
  removeCandidate: (email: string) => void;
  clearCandidates: () => void;
}

export const useCampaignInvitationStore = create<CampaignInvitationStore>((set) => ({
  campaignId: null,
  selectedCandidates: [],
  setSelectedCandidates: (campaignId, candidates) =>
    set({ campaignId, selectedCandidates: uniqueByEmail(candidates) }),
  addCandidates: (campaignId, candidates) =>
    set((state) => ({
      campaignId,
      selectedCandidates: uniqueByEmail([
        ...(state.campaignId === campaignId ? state.selectedCandidates : []),
        ...candidates,
      ]),
    })),
  removeCandidate: (email) =>
    set((state) => ({
      selectedCandidates: state.selectedCandidates.filter(
        (candidate) => normalize(candidate.email) !== normalize(email),
      ),
    })),
  clearCandidates: () => set({ campaignId: null, selectedCandidates: [] }),
}));

function uniqueByEmail(candidates: SelectedInvitationCandidate[]) {
  const byEmail = new Map<string, SelectedInvitationCandidate>();
  candidates.forEach((candidate) => byEmail.set(normalize(candidate.email), candidate));
  return Array.from(byEmail.values());
}

function normalize(email: string) {
  return email.trim().toLowerCase();
}
