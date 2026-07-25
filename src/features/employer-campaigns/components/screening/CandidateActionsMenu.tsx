import { useEffect, useId, useRef, useState } from 'react';
import { Eye, MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { canEditCandidate } from '../../utils/campaignCandidateActions';

interface CandidateActionsMenuProps {
  candidate: CampaignCandidateListItem;
  onViewCv: () => void;
  onEdit: () => void;
  onViewDetail: () => void;
}

export function CandidateActionsMenu({
  candidate,
  onViewCv,
  onEdit,
  onViewDetail,
}: CandidateActionsMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const canEdit = canEditCandidate(candidate);
  const label = candidate.fullName?.trim() || candidate.email?.trim() || candidate.id;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onViewCv}>
        <Eye className="size-3.5" aria-hidden />
        {t('employer.campaigns.screening.actions.viewCv')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label={t('employer.campaigns.screening.actions.menuFor').replace('{{name}}', label)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="frame-satin absolute top-full right-0 z-20 mt-1 min-w-[12rem] overflow-hidden rounded-xl bg-surface-elevated py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-white/[0.06]"
            onClick={() => {
              setOpen(false);
              onViewDetail();
            }}
          >
            {t('employer.campaigns.screening.ranking.viewDetail')}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canEdit}
            title={
              canEdit
                ? undefined
                : t('employer.campaigns.screening.edit.invitedDisabled')
            }
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
              canEdit
                ? 'text-foreground hover:bg-white/[0.06]'
                : 'cursor-not-allowed text-muted-foreground opacity-60',
            )}
            onClick={() => {
              if (!canEdit) return;
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="size-3.5" aria-hidden />
            {t('employer.campaigns.screening.actions.edit')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
