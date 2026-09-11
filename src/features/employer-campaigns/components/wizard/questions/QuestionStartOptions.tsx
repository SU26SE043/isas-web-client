import { FileSpreadsheet, PenLine, Sparkles } from 'lucide-react';
import { SelectionOption } from '@/components/ui/selection-option';
import { useLanguage } from '@/shared/languages';

interface QuestionStartOptionsProps {
  hasJd: boolean;
  disabled?: boolean;
  onGenerateAi: () => void;
  onImportCsv?: () => void;
  onAddManual: () => void;
}

/**
 * Màn RỖNG của bước 4. Ba lựa chọn KHÔNG ngang hàng nhau về giá trị: sinh từ JD là đường
 * chính. Thứ bậc thể hiện bằng VỊ TRÍ + KÍCH THƯỚC (ô đầu chiếm trọn hàng), không bằng màu —
 * `docs/UI_GUIDE.md` chốt light monochrome, màu semantic chỉ dành cho TRẠNG THÁI.
 *
 * ⚠ Dùng `SelectionOption` chứ không tự dựng ô chọn: UI_GUIDE §Agent rules #10 cấm fork style
 * ô chọn. Bản trước của chính file này vẽ ba thẻ riêng — vừa lệch hệ, vừa không có thứ bậc.
 */
export function QuestionStartOptions({
  hasJd,
  disabled = false,
  onGenerateAi,
  onImportCsv,
  onAddManual,
}: QuestionStartOptionsProps) {
  const { t } = useLanguage();
  const k = 'employer.campaigns.campaignQuestions.start';

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectionOption
          className="sm:col-span-2"
          icon={<Sparkles className="size-6" aria-hidden />}
          title={t(`${k}.ai`)}
          description={t(`${k}.aiHint`)}
          meta={t(`${k}.recommended`)}
          disabled={disabled || !hasJd}
          onClick={onGenerateAi}
        />
        <SelectionOption
          icon={<FileSpreadsheet className="size-6" aria-hidden />}
          title={t(`${k}.csv`)}
          description={t(`${k}.csvHint`)}
          disabled={disabled || !onImportCsv}
          onClick={onImportCsv}
        />
        <SelectionOption
          icon={<PenLine className="size-6" aria-hidden />}
          title={t(`${k}.manual`)}
          description={t(`${k}.manualHint`)}
          disabled={disabled}
          onClick={onAddManual}
        />
      </div>
      {/* Lý do KHÔNG bấm được phải đọc rõ. Để nó bên trong ô bị `disabled` thì nó chìm theo
          opacity-50 — đúng câu giải thích lại thành thứ khó đọc nhất màn hình. */}
      {!hasJd ? <p className="text-xs leading-relaxed text-muted-foreground">{t(`${k}.aiNeedsJd`)}</p> : null}
    </div>
  );
}
