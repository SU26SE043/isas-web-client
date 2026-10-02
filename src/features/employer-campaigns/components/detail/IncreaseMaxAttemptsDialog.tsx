import { useId, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SelectionOption } from '@/components/ui/selection-option';
import { useLanguage } from '@/shared/languages';
import { useIncreaseCampaignMaxAttempts } from '../../hooks/useIncreaseCampaignMaxAttempts';
import {
  getMaxAttemptsUpdateServerMessage,
  increaseMaxAttemptsOptions,
} from '../../utils/campaignAttemptRulesUpdate';

const K = 'employer.campaigns.detail.attemptRules';

interface IncreaseMaxAttemptsDialogProps {
  campaignId: string;
  /** Tiêu đề đang lưu — Backend coi `title` là bắt buộc trên PUT [C2]. */
  title: string;
  /** `maxAttempts` đang lưu; hộp thoại chỉ cho chọn giá trị LỚN HƠN. */
  current: number;
}

/**
 * ATT1-F2 — "Tăng số lần làm bài" khi chiến dịch Active. Lỗi 409 (MAX_ATTEMPTS_DECREASE /
 * TIME_LIMIT_LOCKED) hiện NGUYÊN lời server ngay trong hộp thoại và hộp thoại KHÔNG đóng.
 */
export function IncreaseMaxAttemptsDialog({ campaignId, title, current }: IncreaseMaxAttemptsDialogProps) {
  const { t } = useLanguage();
  const groupLabelId = useId();
  const options = increaseMaxAttemptsOptions(current);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(options[0] ?? null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const mutation = useIncreaseCampaignMaxAttempts(campaignId, title);
  const busy = mutation.isPending;

  const handleOpenChange = (next: boolean) => {
    if (busy) return;
    if (next) {
      // Mỗi lần mở: chọn sẵn giá trị nhỏ nhất còn được tăng, xoá lỗi của lần trước.
      setSelected(options[0] ?? null);
      setErrorText(null);
    }
    setOpen(next);
  };

  const handleConfirm = async () => {
    if (busy || selected == null || !options.includes(selected)) return;
    setErrorText(null);
    try {
      await mutation.mutateAsync(selected);
      setOpen(false);
      toast.success(t(`${K}.success`).replace('{{n}}', String(selected)));
    } catch (error) {
      setErrorText(getMaxAttemptsUpdateServerMessage(error) ?? t(`${K}.failed`));
    }
  };

  const currentText = t(current === 1 ? `${K}.dialogCurrentOne` : `${K}.dialogCurrentMany`).replace(
    '{{n}}',
    String(current),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" />}>
        {t(`${K}.increase`)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!busy} closeLabel={t(`${K}.cancel`)}>
        <DialogHeader>
          <DialogIcon>
            <RotateCcw aria-hidden />
          </DialogIcon>
          <DialogTitle>{t(`${K}.dialogTitle`)}</DialogTitle>
          <DialogDescription>{currentText}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2" role="group" aria-labelledby={groupLabelId}>
          <p id={groupLabelId} className="text-sm font-medium text-foreground">
            {t(`${K}.dialogNew`)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <SelectionOption
                key={option}
                title={t('employer.campaigns.form.attemptRules.attemptOptionMany').replace('{{n}}', String(option))}
                selected={selected === option}
                disabled={busy}
                showChevron={false}
                className="min-h-0 px-4 py-3"
                onClick={() => setSelected(option)}
              />
            ))}
          </div>
        </div>

        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>{t(`${K}.consequenceAllCandidates`)}</li>
          <li>{t(`${K}.consequenceCredit`)}</li>
          <li>{t(`${K}.consequenceNoDecrease`)}</li>
        </ul>

        {errorText ? (
          <Alert variant="error" data-testid="increase-max-attempts-error">
            {errorText}
          </Alert>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose render={<Button type="button" variant="outline" disabled={busy} />}>
            {t(`${K}.cancel`)}
          </DialogClose>
          <Button type="button" disabled={busy || selected == null} loading={busy} onClick={handleConfirm}>
            {busy ? t(`${K}.submitting`) : t(`${K}.confirm`).replace('{{n}}', String(selected ?? ''))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
