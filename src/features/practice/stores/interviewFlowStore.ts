import { create } from 'zustand';
import type { InterviewFlowProgress } from '../types/interviewFlow.types';

interface InterviewFlowState extends InterviewFlowProgress {
  setConsentAccepted: (value: boolean) => void;
  setDeviceCheckPassed: (value: boolean) => void;
  setIdentityVerified: (snapshot?: string) => void;
  reset: () => void;
}

const initialState: InterviewFlowProgress = {
  consentAccepted: false,
  deviceCheckPassed: false,
  identityVerified: false,
  identitySnapshot: undefined,
};

export const useInterviewFlowStore = create<InterviewFlowState>((set) => ({
  ...initialState,
  setConsentAccepted: (value) => set({ consentAccepted: value }),
  setDeviceCheckPassed: (value) => set({ deviceCheckPassed: value }),
  setIdentityVerified: (snapshot) =>
    set({ identityVerified: true, identitySnapshot: snapshot }),
  reset: () => set(initialState),
}));
