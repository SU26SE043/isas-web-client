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

  const handleConfirm = async () => {
    if (!item) return;
    try {
      await mutation.mutateAsync({
        sessionId: item.sessionId,
        payload: {
          score: null,
          result: null,
          note: t('employer.campaigns.results.override.clearNote'),
        },
      });
      toast.success(t('employer.campaigns.results.override.clearSuccess'));
      onClose();
    } catch (error) {
      const mapped = getOverrideErrorMessage(
        error,
        t('employer.campaigns.results.errors.overrideBadRequest'),
      );
      toast.error(mapped.startsWith('employer.') ? t(mapped) : mapped);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.override.clearTitle')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.results.override.clearDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('employer.campaigns.results.override.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending || !item}
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
