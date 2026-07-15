import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { isEnterpriseSsoEnabled } from '@/shared/config/env';
import { authService } from '../services/authService';

export function SSOButton() {
  const { t } = useLanguage();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isEnterpriseSsoEnabled()) {
    return null;
  }

  const handleClick = () => {
    setIsRedirecting(true);
    authService.loginWithSso();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRedirecting}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-subtle text-sm font-medium text-muted-foreground transition-colors hover:border-default hover:bg-surface-overlay/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span>{isRedirecting ? t('auth.ssoRedirecting') : t('auth.continueWithSso')}</span>
    </button>
  );
}
