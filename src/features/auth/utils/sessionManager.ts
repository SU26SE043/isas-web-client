const SESSION_STARTED_KEY = 'sessionStartedAt';
const LAST_ACTIVITY_KEY = 'lastActivityAt';

export const SESSION_LIMITS = {
  absoluteMs: 12 * 60 * 60 * 1000,
  idleAdminMs: 30 * 60 * 1000,
  idleCandidateMs: 60 * 60 * 1000,
  warningMs: 2 * 60 * 1000,
} as const;

export const sessionManager = {
  markSessionStart: () => {
    const now = Date.now().toString();
    sessionStorage.setItem(SESSION_STARTED_KEY, now);
    sessionStorage.setItem(LAST_ACTIVITY_KEY, now);
  },
  touchActivity: () => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  },
  clear: () => {
    sessionStorage.removeItem(SESSION_STARTED_KEY);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  },
  getSessionStartedAt: () => {
    const value = sessionStorage.getItem(SESSION_STARTED_KEY);
    return value ? Number(value) : null;
  },
  getLastActivityAt: () => {
    const value = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    return value ? Number(value) : null;
  },
};
