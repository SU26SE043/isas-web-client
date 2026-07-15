import { useLanguage } from '@/shared/languages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionTimeoutModalProps {
  open: boolean;
  secondsLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutModal({ open, secondsLeft, onExtend, onLogout }: SessionTimeoutModalProps) {
  const { t } = useLanguage();
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('auth.sessionTimeoutTitle')}</DialogTitle>
          <DialogDescription>
            {t('auth.sessionTimeoutDescription').replace('{time}', timeLabel)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" type="button" onClick={onLogout}>
            {t('profile.logout')}
          </Button>
          <Button type="button" onClick={onExtend}>
            {t('auth.sessionTimeoutExtend')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
