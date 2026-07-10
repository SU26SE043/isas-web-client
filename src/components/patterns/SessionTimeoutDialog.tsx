import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionTimeoutDialogProps {
  open: boolean;
  title: string;
  description: string;
  stayLabel: string;
  signInLabel: string;
  onStay: () => void;
  onSignIn: () => void;
}

export function SessionTimeoutDialog({
  open,
  title,
  description,
  stayLabel,
  signInLabel,
  onStay,
  onSignIn,
}: SessionTimeoutDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onStay}>
            {stayLabel}
          </Button>
          <Button onClick={onSignIn}>{signInLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
