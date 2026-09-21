import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';

interface CandidateEmailCellProps {
  candidate: CampaignCandidateListItem;
  onUpdateEmail?: (candidateId: string, email: string) => Promise<void>;
  updating: boolean;
}

/**
 * Email trong bảng sàng CV: HIỆN CHỮ, không hiện ô nhập thường trực.
 *
 * <p>Trước: mỗi dòng luôn có `<Input>` + nút "Lưu email" — trong wizard ô bị co ~0px nên HR chỉ thấy
 * một nút "Lưu email" lơ lửng cạnh ô trống, đọc thành "hệ thống chưa lấy được email" dù email đã có.
 * Nay: có email ⇒ in email + nút bút chì (sửa khi CV ghi sai); chưa có ⇒ dòng "Chưa có email" + nút
 * "Thêm email". Ô nhập chỉ mở khi HR bấm, và đóng lại sau khi lưu / huỷ.</p>
 */
export function CandidateEmailCell({ candidate, onUpdateEmail, updating }: CandidateEmailCellProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(candidate.email ?? '');

  if (!onUpdateEmail) {
    return <p className="text-xs text-muted-foreground">{candidate.email ?? t('employer.campaigns.screening.ranking.noEmail')}</p>;
  }

  if (!editing) {
    return (
      <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
        {candidate.email ? (
          <span className="text-xs text-muted-foreground">{candidate.email}</span>
        ) : (
          <span className="text-xs text-warning">{t('employer.campaigns.screening.ranking.noEmail')}</span>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 px-1.5 text-xs"
          aria-label={candidate.email ? t('employer.campaigns.screening.ranking.editEmail') : t('employer.campaigns.screening.ranking.addEmail')}
          onClick={() => { setDraft(candidate.email ?? ''); setEditing(true); }}
        >
          <Pencil className="size-3" aria-hidden />
          {candidate.email ? null : t('employer.campaigns.screening.ranking.addEmail')}
        </Button>
      </div>
    );
  }

  const dirty = draft.trim().toLowerCase() !== (candidate.email ?? '').trim().toLowerCase();
  return (
    <div className="mt-2 flex w-full max-w-sm items-center gap-2">
      <Input
        type="email"
        value={draft}
        placeholder="candidate@example.com"
        aria-label={t('employer.campaigns.screening.ranking.email')}
        onChange={(event) => setDraft(event.target.value)}
        disabled={updating}
        autoFocus
        className="h-8 min-w-40 text-xs"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!dirty || updating}
        loading={updating}
        onClick={() => void onUpdateEmail(candidate.id, draft).then(() => setEditing(false))}
      >
        {t('employer.campaigns.screening.ranking.saveEmail')}
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={updating} onClick={() => setEditing(false)}>
        {t('employer.campaigns.screening.ranking.cancelEmail')}
      </Button>
    </div>
  );
}
