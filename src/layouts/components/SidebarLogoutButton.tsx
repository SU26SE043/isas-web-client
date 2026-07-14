import { useState, type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';

interface SidebarLogoutButtonProps {
  className?: string;
  title?: string;
  'aria-label'?: string;
  children: ReactNode;
}

export function SidebarLogoutButton({
  className,
  title,
  'aria-label': ariaLabel,
  children,
}: SidebarLogoutButtonProps) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        title={title}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        icon={<LogOut className="size-5" aria-hidden />}
        title={t('auth.logoutConfirmTitle')}
        description={t('auth.logoutConfirmDescription')}
        confirmLabel={t('auth.logoutConfirmOk')}
        cancelLabel={t('auth.logoutConfirmCancel')}
        destructive
        onConfirm={() => {
          setOpen(false);
          logout();
        }}
      />
    </>
  );
}
