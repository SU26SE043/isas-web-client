import { useMemo, useState } from 'react';
import { CalendarClock, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { useCampaignSlotMutations, useCampaignSlots } from '../../hooks/useCampaignSlots';
import type { CampaignSlotRequest, CampaignSlotResponse } from '../../types/campaign.api.types';
import { campaignSlotCapacity, getCampaignSlotErrorKey } from '../../utils/campaignSlots';
import { CampaignSlotDialog } from './CampaignSlotDialog';

interface CampaignSlotsPanelProps {
  campaignId: string;
  editable?: boolean;
}

export function CampaignSlotsPanel({ campaignId, editable = false }: CampaignSlotsPanelProps) {
  const { t, language } = useLanguage();
  const query = useCampaignSlots(campaignId);
  const mutations = useCampaignSlotMutations(campaignId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<CampaignSlotResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const slots = query.data ?? [];
  const summary = useMemo(() => campaignSlotCapacity(slots), [slots]);
  const isSaving = mutations.create.isPending || mutations.update.isPending;

  const openCreate = () => {
    setEditingSlot(null);
    setDialogOpen(true);
  };
  const openEdit = (slot: CampaignSlotResponse) => {
    setEditingSlot(slot);
    setDialogOpen(true);
  };
  const save = async (payload: CampaignSlotRequest) => {
    if (editingSlot) {
      await mutations.update.mutateAsync({ slotId: editingSlot.id, payload });
      toast.success(t('employer.campaigns.slots.updateSuccess'));
    } else {
      await mutations.create.mutateAsync(payload);
      toast.success(t('employer.campaigns.slots.createSuccess'));
    }
  };
  const remove = async (slot: CampaignSlotResponse) => {
    if (!window.confirm(t('employer.campaigns.slots.deleteConfirm'))) return;
    setDeletingId(slot.id);
    try {
      await mutations.remove.mutateAsync(slot.id);
      toast.success(t('employer.campaigns.slots.deleteSuccess'));
    } catch (error) {
      toast.error(t(getCampaignSlotErrorKey(error, 'delete')));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="frame-satin bg-surface-raised">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-info-light" aria-hidden />
            {t('employer.campaigns.slots.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.slots.summary')
              .replace('{total}', String(summary.total))
              .replace('{available}', String(summary.available))}
          </p>
        </div>
        {editable ? <Button type="button" onClick={openCreate}><Plus className="size-4" aria-hidden />{t('employer.campaigns.slots.add')}</Button> : null}
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />{t('employer.campaigns.slots.loading')}
          </div>
        ) : query.isError ? (
          <div className="rounded-xl border border-error/30 bg-error-bg p-4 text-sm text-error">
            <p>{t('employer.campaigns.slots.errors.load')}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              <RefreshCw className="size-4" aria-hidden />{t('employer.campaigns.slots.retry')}
            </Button>
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-satin bg-surface-overlay px-4 py-8 text-center">
            <p className="font-medium text-foreground">{t('employer.campaigns.slots.emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('employer.campaigns.slots.emptyDescription')}</p>
            {editable ? <Button type="button" variant="outline" className="mt-4" onClick={openCreate}><Plus className="size-4" aria-hidden />{t('employer.campaigns.slots.createFirst')}</Button> : null}
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                locale={language === 'vi' ? 'vi-VN' : 'en-US'}
                editable={editable}
                deleting={deletingId === slot.id}
                onEdit={() => openEdit(slot)}
                onDelete={() => void remove(slot)}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CampaignSlotDialog open={dialogOpen} slot={editingSlot} isSaving={isSaving} onOpenChange={setDialogOpen} onSave={save} />
    </Card>
  );
}

function SlotRow({ slot, locale, editable, deleting, onEdit, onDelete }: { slot: CampaignSlotResponse; locale: string; editable: boolean; deleting: boolean; onEdit: () => void; onDelete: () => void }) {
  const { t } = useLanguage();
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  return (
    <article className="rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(start)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(start)} – {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(end)}</p>
        </div>
        {editable ? <div className="flex gap-1"><Button type="button" variant="ghost" size="icon-sm" aria-label={t('employer.campaigns.slots.edit')} onClick={onEdit}><Pencil className="size-4" aria-hidden /></Button><Button type="button" variant="ghost" size="icon-sm" disabled={deleting} aria-label={t('employer.campaigns.slots.delete')} onClick={onDelete}>{deleting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4 text-error" aria-hidden />}</Button></div> : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p className="flex items-center gap-2 rounded-lg border border-satin bg-surface-raised px-3 py-2"><Users className="size-4 text-info-light" aria-hidden /><span>{t('employer.campaigns.slots.assigned')}: <strong className="text-foreground">{slot.assignedCount}/{slot.capacity}</strong></span></p>
        <p className="rounded-lg border border-satin bg-surface-raised px-3 py-2">{t('employer.campaigns.slots.started')}: <strong className="text-foreground">{slot.startedCount}</strong></p>
      </div>
    </article>
  );
}
