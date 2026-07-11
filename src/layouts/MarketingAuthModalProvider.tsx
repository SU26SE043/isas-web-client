import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AuthModal } from '@/features/auth/components/AuthModal';

export type MarketingAuthView = 'login' | 'signup';

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

export function MarketingAuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<MarketingAuthView>('login');

  const openAuthModal = useCallback((view: MarketingAuthView = 'login') => {
    setInitialView(view);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

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
