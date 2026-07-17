import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthModal, type AuthModalView } from '@/features/auth/components/AuthModal';

export type MarketingAuthView = AuthModalView;

interface MarketingAuthModalContextValue {
  openAuthModal: (view?: MarketingAuthView) => void;
  closeAuthModal: () => void;
}

const MarketingAuthModalContext = createContext<MarketingAuthModalContextValue | null>(null);

export function useMarketingAuthModal(): MarketingAuthModalContextValue {
  const context = useContext(MarketingAuthModalContext);
  if (!context) {
    throw new Error('useMarketingAuthModal must be used within MarketingLayout');
  }
  return context;
}

function parseAuthView(value: string | null): MarketingAuthView | null {
  if (value === 'login' || value === 'signup' || value === 'signup-org') return value;
  return null;
}

export function MarketingAuthModalProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const authFromUrl = parseAuthView(searchParams.get('auth'));

  const [isOpen, setIsOpen] = useState(Boolean(authFromUrl));
  const [initialView, setInitialView] = useState<MarketingAuthView>(authFromUrl ?? 'login');

  useEffect(() => {
    if (!authFromUrl) return;
    setInitialView(authFromUrl);
    setIsOpen(true);
  }, [authFromUrl]);

  const openAuthModal = useCallback(
    (view: MarketingAuthView = 'login') => {
      setInitialView(view);
      setIsOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('auth', view);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('auth');
        next.delete('reason');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal],
  );

  return (
    <MarketingAuthModalContext.Provider value={value}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} initialView={initialView} />
    </MarketingAuthModalContext.Provider>
  );
}
