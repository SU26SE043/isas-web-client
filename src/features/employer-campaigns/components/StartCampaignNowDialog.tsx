import { useState } from 'react';
import { Zap } from 'lucide-react';
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
import { useLanguage } from '@/shared/languages';

interface StartCampaignNowDialogProps {
  /** Giờ mở HIỆN TẠI (đã định dạng) — hộp thoại phải nêu ra để HR biết mình đang kéo mốc nào về. */
  formattedStart: string;
  onConfirm: () => Promise<void>;
  /** Trang cha đang gọi start-now (khoá trigger khi bận). */
  busy?: boolean;
  /** Blocker phía FE (D-3: có ca ⇒ khoá) — KHÔNG mở hộp thoại, KHÔNG gọi API. */
  disabledReason?: string | null;
}

/**
 * "Mở ngay" trên trang chi tiết (T13 R2): xác nhận TRƯỚC khi `POST /campaign/{id}/start-now`.
 * Nút này kéo giờ mở về hiện tại cho MỌI ứng viên và backend gửi lại thư cho người đã nhận lời
 * mời — không phải thao tác nên chạy từ một cú bấm trượt.
 */
export function StartCampaignNowDialog({ formattedStart, onConfirm, busy = false, disabledReason = null }: StartCampaignNowDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blocked = Boolean(disabledReason);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Trang cha (`CampaignDetailPage.handleStartNow`) đã toast lỗi; giữ hộp thoại mở để HR
      // đọc rồi tự quyết thử lại hay huỷ — không ném tiếp ra event handler.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (isSubmitting) return;
          if (next && blocked) return;
          setOpen(next);
        }}
      >
        <DialogTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={blocked || busy}
              loading={busy}
              title={disabledReason ?? undefined}
            />
          }
        >
          {t('employer.campaigns.detail.startNow')}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
          <DialogHeader>
            <DialogIcon className="border border-info/35 bg-info/15 text-info">
              <Zap aria-hidden />
            </DialogIcon>
            <DialogTitle>{t('employer.campaigns.detail.startNowConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('employer.campaigns.detail.startNowConfirmDescription').replace('{{start}}', formattedStart)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
              {t('employer.campaigns.detail.startNowCancel')}
            </DialogClose>
            <Button type="button" disabled={isSubmitting} loading={isSubmitting} onClick={handleConfirm}>
              {t(isSubmitting ? 'employer.campaigns.detail.startNowSubmitting' : 'employer.campaigns.detail.startNowConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {disabledReason ? <p className="max-w-xs text-right text-xs text-muted-foreground" data-testid="start-now-blocked">{disabledReason}</p> : null}
    </div>
  );
}
