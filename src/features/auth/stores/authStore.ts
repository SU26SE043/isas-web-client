import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

const SESSION_USER_KEY = 'isas-auth-user';

function readSessionUser(): User | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(SESSION_USER_KEY);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
}

const initialUser = readSessionUser();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: initialUser,
      isAuthenticated: Boolean(initialUser),
      isLoading: false,
      hasHydrated: false,
      setUser: (user) => {
        if (typeof sessionStorage !== 'undefined') {
          if (user) sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
          else sessionStorage.removeItem(SESSION_USER_KEY);
        }
        set({ user, isAuthenticated: !!user });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => {
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_USER_KEY);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined;

        if (initialUser && currentState.user === initialUser && !persisted?.isAuthenticated) {
          return { ...currentState, user: null, isAuthenticated: false };
        }

        // Storage hydration can finish after the login request on slower
        // browsers. In that race, an empty persisted snapshot must not erase
        // the session that was just established in memory.
        if (currentState.isAuthenticated && currentState.user && !persisted?.isAuthenticated) {
          return currentState;
        }

        return { ...currentState, ...persisted };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
