import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { buildFocusButtonLabel } from '../../utils/focusTrackingSummary';
import { FocusEventsAnalysis } from './FocusEventsAnalysis';

export function FocusEventsButton({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  if (view.focusEvents == null) return null;
  if (view.focusEvents.length === 0) {
    return <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success"><ShieldCheck className="size-3.5" aria-hidden />{t('practice.result.focusTracking.none')}</Badge>;
  }
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <LogOut className="size-3.5" aria-hidden />
        {buildFocusButtonLabel(view, t)}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('practice.result.focusTracking.title')}</DialogTitle>
            <DialogDescription>{t('practice.result.focusTracking.description')}</DialogDescription>
          </DialogHeader>
          <FocusEventsAnalysis view={view} />
        </DialogContent>
      </Dialog>
    </>
  );
}
