import { useCallback, useEffect, useRef, useState } from 'react';
import { UserRole } from '../types/auth.types';
import type { UserRoleType } from '../types/auth.types';
import { SESSION_LIMITS, sessionManager } from '../utils/sessionManager';

function getIdleLimitMs(role: UserRoleType | null): number {
  if (role === UserRole.ADMIN || role === UserRole.HR || role === UserRole.ORGANIZE) {
    return SESSION_LIMITS.idleAdminMs;
  }
  return SESSION_LIMITS.idleCandidateMs;
}

interface UseSessionTimeoutOptions {
  enabled: boolean;
  role: UserRoleType | null;
  onExpire: () => void;
}

export function useSessionTimeout({ enabled, role, onExpire }: UseSessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const checkTimeouts = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    const startedAt = sessionManager.getSessionStartedAt();
    const lastActivity = sessionManager.getLastActivityAt();

    if (startedAt && now - startedAt >= SESSION_LIMITS.absoluteMs) {
      onExpireRef.current();
      return;
    }

    const idleLimit = getIdleLimitMs(role);
    const reference = lastActivity ?? startedAt;
    if (!reference) return;

    const idleElapsed = now - reference;
    const remaining = idleLimit - idleElapsed;

    if (remaining <= 0) {
      onExpireRef.current();
      return;
    }

    if (remaining <= SESSION_LIMITS.warningMs) {
      setShowWarning(true);
      setSecondsLeft(Math.ceil(remaining / 1000));
    } else {
      setShowWarning(false);
    }
  }, [enabled, role]);

  const extendSession = useCallback(() => {
    sessionManager.touchActivity();
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setShowWarning(false);
      return;
    }

    const onActivity = () => sessionManager.touchActivity();
    const events: Array<keyof WindowEventMap> = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const interval = window.setInterval(checkTimeouts, 1000);
    checkTimeouts();

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(interval);
    };
  }, [checkTimeouts, enabled]);

  return { showWarning, secondsLeft, extendSession, dismissWarning: () => setShowWarning(false) };
}
