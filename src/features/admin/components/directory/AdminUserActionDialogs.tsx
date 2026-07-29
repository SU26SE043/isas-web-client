import { useEffect, useState } from 'react';
import { KeyRound, ShieldBan } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import type { AdminDirectoryUser } from '../../types/adminDirectory.types';

interface Props {
  action: 'ban' | 'unban' | 'reset' | null;
  user: AdminDirectoryUser | null;
  errorMessage: string | null;
  loading: boolean;
  onClose: () => void;
  onBan: (reason?: string) => void;
  onUnban: () => void;
  onResetPassword: (newPassword: string) => void;
}

export function AdminUserActionDialogs({
  action,
  user,
  errorMessage,
  loading,
  onClose,
  onBan,
  onUnban,
  onResetPassword,
}: Props) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setReason('');
    setNewPassword('');
  }, [action, user?.id]);

  if (!user) return null;
  const name = user.fullName || user.email;

  if (action === 'unban') {
    return (
      <ConfirmDialog
        open
        onOpenChange={(open) => { if (!open) onClose(); }}
        title={t('admin.users.actions.unbanTitle').replace('{name}', name)}
        description={t('admin.users.actions.unbanDescription')}
        confirmLabel={t('admin.users.actions.unban')}
        cancelLabel={t('admin.users.actions.cancel')}
        loading={loading}
        errorMessage={errorMessage}
        onConfirm={onUnban}
      />
    );
  }

  if (action === 'ban') {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent showCloseButton={!loading}>
          <DialogHeader>
            <DialogIcon><ShieldBan /></DialogIcon>
            <DialogTitle>{t('admin.users.actions.banTitle').replace('{name}', name)}</DialogTitle>
            <DialogDescription>{t('admin.users.actions.banDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertDescription>{t('admin.users.actions.tokenWarning')}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="admin-ban-reason">{t('admin.users.actions.reason')}</Label>
              <textarea
                id="admin-ban-reason"
                value={reason}
                maxLength={500}
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-xl border border-satin bg-surface-overlay/80 px-3 py-2 text-sm shadow-[var(--satin-inset)] outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-3 focus-visible:ring-white/10"
                placeholder={t('admin.users.actions.reasonPlaceholder')}
                onChange={(event) => setReason(event.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">{reason.length}/500</p>
            </div>
            {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={onClose}>
              {t('admin.users.actions.cancel')}
            </Button>
            <Button variant="destructive" loading={loading} onClick={() => onBan(reason.trim() || undefined)}>
              {t('admin.users.actions.ban')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (action === 'reset') {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent showCloseButton={!loading}>
          <DialogHeader>
            <DialogIcon><KeyRound /></DialogIcon>
            <DialogTitle>{t('admin.users.actions.resetTitle').replace('{name}', name)}</DialogTitle>
            <DialogDescription>{t('admin.users.actions.resetDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertDescription>{t('admin.users.actions.resetSessionWarning')}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="admin-new-password">{t('admin.users.actions.newPassword')}</Label>
              <Input
                id="admin-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                disabled={loading}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={onClose}>
              {t('admin.users.actions.cancel')}
            </Button>
            <Button
              loading={loading}
              disabled={!newPassword}
              onClick={() => onResetPassword(newPassword)}
            >
              {t('admin.users.actions.reset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
