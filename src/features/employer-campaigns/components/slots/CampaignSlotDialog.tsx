import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignSlotRequest, CampaignSlotResponse } from '../../types/campaign.api.types';
import {
  getCampaignSlotErrorKey,
  toCampaignSlotRequest,
  toSlotDatetimeLocal,
  validateCampaignSlot,
} from '../../utils/campaignSlots';

interface CampaignSlotDialogProps {
  open: boolean;
  slot: CampaignSlotResponse | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CampaignSlotRequest) => Promise<void>;
}

function defaultValues(slot: CampaignSlotResponse | null) {
  if (slot) {
    return {
      startsAt: toSlotDatetimeLocal(slot.startsAt),
      endsAt: toSlotDatetimeLocal(slot.endsAt),
      capacity: String(slot.capacity),
    };
  }
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    startsAt: toSlotDatetimeLocal(start.toISOString()),
    endsAt: toSlotDatetimeLocal(end.toISOString()),
    capacity: '1',
  };
}

export function CampaignSlotDialog({
  open,
  slot,
  isSaving,
  onOpenChange,
  onSave,
}: CampaignSlotDialogProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState(() => defaultValues(slot));
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(defaultValues(slot));
    setErrorKey(null);
  }, [open, slot]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = validateCampaignSlot(values, slot?.assignedCount ?? 0);
    if (code) {
      setErrorKey(`employer.campaigns.slots.validation.${code}`);
      return;
    }
    try {
      await onSave(toCampaignSlotRequest(values));
      onOpenChange(false);
    } catch (error) {
      setErrorKey(getCampaignSlotErrorKey(error, slot ? 'update' : 'create'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={(event) => void submit(event)} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {t(slot ? 'employer.campaigns.slots.editTitle' : 'employer.campaigns.slots.createTitle')}
            </DialogTitle>
            <DialogDescription>{t('employer.campaigns.slots.formDescription')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slot-starts-at">{t('employer.campaigns.slots.startsAt')}</Label>
              <Input
                id="slot-starts-at"
                type="datetime-local"
                required
                value={values.startsAt}
                aria-invalid={Boolean(errorKey)}
                onChange={(event) => setValues((prev) => ({ ...prev, startsAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-ends-at">{t('employer.campaigns.slots.endsAt')}</Label>
              <Input
                id="slot-ends-at"
                type="datetime-local"
                required
                value={values.endsAt}
                aria-invalid={Boolean(errorKey)}
                onChange={(event) => setValues((prev) => ({ ...prev, endsAt: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-capacity">{t('employer.campaigns.slots.capacity')}</Label>
            <Input
              id="slot-capacity"
              type="number"
              inputMode="numeric"
              required
              min={slot?.assignedCount ? Math.max(1, slot.assignedCount) : 1}
              step={1}
              value={values.capacity}
              aria-invalid={Boolean(errorKey)}
              onChange={(event) => setValues((prev) => ({ ...prev, capacity: event.target.value }))}
            />
            {slot?.assignedCount ? (
              <p className="text-xs text-muted-foreground">
                {t('employer.campaigns.slots.assignedMinimum').replace('{count}', String(slot.assignedCount))}
              </p>
            ) : null}
          </div>

          {errorKey ? <p role="alert" className="text-sm text-error">{t(errorKey)}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              {t('employer.campaigns.slots.cancel')}
            </Button>
            <Button type="submit" loading={isSaving} disabled={isSaving}>
              {t(slot ? 'employer.campaigns.slots.save' : 'employer.campaigns.slots.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
