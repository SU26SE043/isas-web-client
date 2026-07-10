import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useLanguage } from '@/shared/languages';
import { useState } from 'react';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface-base px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-foreground mb-2">{t('nav.signIn')}</h1>
        <p className="text-muted-foreground mb-6">{t('auth.loginPrompt')}</p>
        <button type="button" className="btn-primary px-6 py-2" onClick={() => setIsAuthModalOpen(true)}>
          {t('nav.signIn')}
        </button>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
