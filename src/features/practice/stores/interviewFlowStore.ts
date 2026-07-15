import { create } from 'zustand';
import type { InterviewFlowProgress } from '../types/interviewFlow.types';
import { clearFlowProgress, loadFlowProgress, saveFlowProgress } from '../utils/interviewFlowStorage';

interface InterviewFlowState extends InterviewFlowProgress {
  hydratedSessionId: string | null;
  hydrate: (sessionId: string) => void;
  setConsentAccepted: (sessionId: string, value: boolean) => void;
  setDeviceCheckPassed: (sessionId: string, value: boolean) => void;
  setTermsAccepted: (sessionId: string, value: boolean) => void;
  setIdentityVerified: (sessionId: string, snapshot?: string) => void;
  reset: (sessionId?: string) => void;
}

const initialState: InterviewFlowProgress = {
  consentAccepted: false,
  deviceCheckPassed: false,
  termsAccepted: false,
  identityVerified: false,
  identitySnapshot: undefined,
};

function persist(sessionId: string, progress: InterviewFlowProgress) {
  saveFlowProgress(sessionId, progress);
}

export const useInterviewFlowStore = create<InterviewFlowState>((set, get) => ({
  ...initialState,
  hydratedSessionId: null,
  hydrate: (sessionId) => {
    const saved = loadFlowProgress(sessionId);
    set({
      ...initialState,
      ...saved,
      hydratedSessionId: sessionId,
    });
  },
  setConsentAccepted: (sessionId, value) => {
    set({ consentAccepted: value });
    const state = get();
    persist(sessionId, {
      consentAccepted: value,
      deviceCheckPassed: state.deviceCheckPassed,
      termsAccepted: state.termsAccepted,
      identityVerified: state.identityVerified,
      identitySnapshot: state.identitySnapshot,
    });
  },
  setDeviceCheckPassed: (sessionId, value) => {
    set({ deviceCheckPassed: value });
    const state = get();
    persist(sessionId, {
      consentAccepted: state.consentAccepted,
      deviceCheckPassed: value,
      termsAccepted: state.termsAccepted,
      identityVerified: state.identityVerified,
      identitySnapshot: state.identitySnapshot,
    });
  },
  setTermsAccepted: (sessionId, value) => {
    set({ termsAccepted: value });
    const state = get();
    persist(sessionId, {
      consentAccepted: state.consentAccepted,
      deviceCheckPassed: state.deviceCheckPassed,
      termsAccepted: value,
      identityVerified: state.identityVerified,
      identitySnapshot: state.identitySnapshot,
    });
  },
  setIdentityVerified: (sessionId, snapshot) => {
    set({ identityVerified: true, identitySnapshot: snapshot });
    const state = get();
    persist(sessionId, {
      consentAccepted: state.consentAccepted,
      deviceCheckPassed: state.deviceCheckPassed,
      termsAccepted: state.termsAccepted,
      identityVerified: true,
      identitySnapshot: snapshot,
    });
  },
  reset: (sessionId) => {
    if (sessionId) clearFlowProgress(sessionId);
    set({ ...initialState, hydratedSessionId: null });
  },
}));
