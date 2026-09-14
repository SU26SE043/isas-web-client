import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestionImportResult } from '../../../types/campaign.api.types';
import { isCampaignCsvFile, limitImportedQuestions, validImportedQuestions } from '../../../utils/campaignQuestionImport';
import { QuestionImportDialog } from './QuestionImportDialog';

export interface QuestionImportControlHandle { open: () => void; }

interface QuestionImportControlProps {
  existingCount: number;
  max: number;
  disabled?: boolean;
  onImportCsv?: (file: File) => Promise<CampaignQuestionImportResult>;
  onConfirmImport?: (items: CampaignQuestionImportResult['items']) => Promise<void>;
}

export const QuestionImportControl = forwardRef<QuestionImportControlHandle, QuestionImportControlProps>(function QuestionImportControl({
  existingCount,
  max,
  disabled = false,
  onImportCsv,
  onConfirmImport,
}, ref) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CampaignQuestionImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Nút "Nhập CSV" phải mở HỘP CHỌN TỆP của trình duyệt. Bản trước chỉ setOpen(true) ⇒ hộp thoại
  // xem trước hiện lên RỖNG và không có đường nào chọn file bằng chuột (input file là sr-only,
  // không ref, không label) ⇒ nút chỉ là vỏ. selectFile tự mở hộp thoại sau khi có file.
  useImperativeHandle(ref, () => ({ open: () => { if (!disabled) inputRef.current?.click(); } }), [disabled]);
  const valid = validImportedQuestions(result ?? { totalRows: 0, items: [], errors: [] });
  const { accepted, skipped } = limitImportedQuestions(existingCount, valid, max);
  const selectFile = async (file: File | null) => {
    setError(null); setResult(null); setOpen(true);
    if (!file) return;
    if (!isCampaignCsvFile(file)) { setError(t('employer.campaigns.campaignQuestions.import.notCsv')); return; }
    if (!onImportCsv) return;
    setBusy(true);
    try { setResult(await onImportCsv(file)); }
    catch (caught) { setError(caught instanceof Error && caught.message === 'CAMPAIGN_NOT_DRAFT' ? t('employer.campaigns.campaignQuestions.errors.draftOnly') : t('employer.campaigns.campaignQuestions.import.failed')); }
    finally { setBusy(false); }
  };
  return <>
    <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" disabled={disabled} onChange={(event) => { void selectFile(event.target.files?.[0] ?? null); event.currentTarget.value = ''; }} />
    <QuestionImportDialog
      open={open}
      result={result}
      accepted={accepted}
      skipped={skipped}
      error={error}
      busy={busy}
      onClose={() => { if (!busy) setOpen(false); }}
      onPickAnother={() => { if (!busy) inputRef.current?.click(); }}
      onConfirm={() => {
        if (!onConfirmImport) return;
        setBusy(true);
        void onConfirmImport(accepted).then(() => { setOpen(false); setResult(null); }).catch(() => setError(t('employer.campaigns.campaignQuestions.import.saveFailed'))).finally(() => setBusy(false));
      }}
    />
  </>;
});
