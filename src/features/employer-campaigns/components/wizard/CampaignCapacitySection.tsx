import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { useCampaignSlots } from '../../hooks/useCampaignSlots';
import { campaignSlotCapacity } from '../../utils/campaignSlots';
import { slotCapacityOverflow, slotsOutsideCampaignWindow } from '../../utils/campaignCapacityChecks';
import { WizardNumberField } from './WizardNumberField';
import { WizardSection } from './WizardSection';

interface CampaignCapacitySectionProps {
  campaignId: string | null;
  maxCandidates: number | null;
  campaignStartsAt: string;
  campaignExpiresAt: string;
  invalid?: boolean;
  /**
   * Trần ĐÃ LƯU trên server (khác `maxCandidates`, là state nháp đang gõ) — chỉ có khi sửa
   * chiến dịch có sẵn. Dùng để cảnh báo mềm khi ô đang trống: `buildCampaignCreateRequest`
   * chỉ gửi khoá này lúc có giá trị dương, và BE chỉ ghi khi payload mang khoá đó (`HasValue`)
   * ⇒ bỏ trống ở đây KHÔNG xoá được trần đã lưu, nó GIỮ NGUYÊN chứ không thành "không giới hạn".
   */
  savedMaxCandidates?: number | null;
  onChange: (value: number | null) => void;
}

function Warn({ text }: { text: string }) {
  return (
    <Alert variant="warning">
      <AlertDescription className="flex items-start gap-2 text-xs leading-relaxed">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{text}</span>
      </AlertDescription>
    </Alert>
  );
}

export function CampaignCapacitySection({
  campaignId, maxCandidates, campaignStartsAt, campaignExpiresAt, invalid, savedMaxCandidates, onChange,
}: CampaignCapacitySectionProps) {
  const { t } = useLanguage();
  const f = 'employer.campaigns.form';
  const slotsQuery = useCampaignSlots(campaignId ?? undefined);
  const slots = campaignId ? (slotsQuery.data ?? []) : [];
  const overflow = slotCapacityOverflow(campaignSlotCapacity(slots).total, maxCandidates);
  const outside = slotsOutsideCampaignWindow(slots, campaignStartsAt, campaignExpiresAt);
  // Ô đang trống mà campaign này TỪNG có trần > 0 đã lưu ⇒ PUT sẽ KHÔNG xoá nó (xem prop doc).
  const keepsSavedCap = maxCandidates == null && Boolean(savedMaxCandidates && savedMaxCandidates > 0);

  return (
    <WizardSection title={t(`${f}.group.capacity`)} hint={t(`${f}.group.capacityHint`)}>
      <div className="grid gap-4 @md:grid-cols-2">
        <WizardNumberField
          id="campaign-max"
          label={t(`${f}.maxCandidates`)}
          tag={t(`${f}.optional`)}
          help={t(`${f}.maxCandidatesHelp`)}
          value={maxCandidates}
          min={1}
          placeholder={t(`${f}.maxCandidatesPlaceholder`)}
          invalid={invalid}
          onChange={(value) => onChange(value == null ? null : Math.max(1, value))}
        />
      </div>
      {keepsSavedCap ? (
        <Warn text={t(`${f}.maxCandidatesKeepSaved`).replace('{n}', String(savedMaxCandidates))} />
      ) : null}
      {overflow > 0 ? <Warn text={t(`${f}.slotCapacityOverflow`).replace('{n}', String(overflow))} /> : null}
      {outside.length > 0 ? <Warn text={t(`${f}.slotOutsideWindow`).replace('{n}', String(outside.length))} /> : null}
    </WizardSection>
  );
}
