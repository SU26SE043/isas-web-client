import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useOverrideCampaignResult } from '../../hooks/useCampaignResults';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import { getOverrideErrorMessage } from '../../utils/campaignResultsActions';

interface ClearOverrideDialogProps {
  open: boolean;
  campaignId: string;
  item: CampaignResultItem | null;
  onClose: () => void;
}

export function ClearOverrideDialog({
  open,
  campaignId,
  item,
  onClose,
}: ClearOverrideDialogProps) {
  const { t } = useLanguage();
  const mutation = useOverrideCampaignResult(campaignId);
  // Lý do BẮT BUỘC, đồng bộ với modal "Điều chỉnh kết quả": mỗi dòng "Huỷ điều chỉnh" trong lịch sử phải
  // nói được vì sao — trước đây dialog không có ô này nên mọi lần huỷ đều mang cùng một câu mẫu.
  const [note, setNote] = useState('');
  const noteId = useId();
  const noteValid = note.trim().length > 0;

  const close = () => {
    setNote('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!item || !noteValid) return;
    try {
      await mutation.mutateAsync({
        sessionId: item.sessionId,
        payload: { score: null, result: null, note: note.trim() },
      });
      toast.success(t('employer.campaigns.results.override.clearSuccess'));
      close();
    } catch (error) {
      const mapped = getOverrideErrorMessage(
        error,
        t('employer.campaigns.results.errors.overrideBadRequest'),
      );
      toast.error(mapped.startsWith('employer.') ? t(mapped) : mapped);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.override.clearTitle')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.results.override.clearDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={noteId}>{t('employer.campaigns.results.override.clearNoteLabel')}</Label>
          <textarea
            id={noteId}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder={t('employer.campaigns.results.override.clearNotePlaceholder')}
            className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!noteValid && note.length > 0}
          />
          {!noteValid && note.length > 0 ? (
            <p className="text-xs text-destructive">{t('employer.campaigns.results.override.noteRequired')}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            {t('employer.campaigns.results.override.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending || !item || !noteValid}
            onClick={() => void handleConfirm()}
          >
            {mutation.isPending
              ? t('employer.campaigns.results.override.saving')
              : t('employer.campaigns.results.actions.clearOverride')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
