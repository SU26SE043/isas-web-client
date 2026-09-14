import { useEffect, useId, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import { hasResultOverride } from '../../utils/campaignResultsActions';
import { candidateDisplayName } from './ResultBadges';

interface ResultsActionsMenuProps {
  item: CampaignResultItem;
  onViewDetails: () => void;
  onOverride: () => void;
  onClearOverride: () => void;
}

export function ResultsActionsMenu({
  item,
  onViewDetails,
  onOverride,
  onClearOverride,
}: ResultsActionsMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = candidateDisplayName(item, t);
  const canClear = hasResultOverride(item);

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

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={t('employer.campaigns.results.actions.menuFor').replace('{{name}}', label)}
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
          className="absolute right-0 z-20 mt-1 min-w-52 rounded-xl border border-satin bg-popover p-1 shadow-[var(--shadow-lg)]"
        >
          <MenuItem
            label={t('employer.campaigns.results.actions.viewDetails')}
            onClick={() => run(onViewDetails)}
          />
          <MenuItem
            label={t('employer.campaigns.results.actions.override')}
            onClick={() => run(onOverride)}
          />
          {canClear ? (
            <MenuItem
              label={t('employer.campaigns.results.actions.clearOverride')}
              onClick={() => run(onClearOverride)}
              danger
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        danger
          ? 'block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10'
          : 'block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-surface-overlay'
      }
    >
      {label}
    </button>
  );
}
