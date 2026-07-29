import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import type { TeamMember } from '../types/engagement.types';

interface RemoveTeamMemberDialogProps {
  member: TeamMember | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveTeamMemberDialog({
  member,
  loading,
  onOpenChange,
  onConfirm,
}: RemoveTeamMemberDialogProps) {
  const { t } = useLanguage();
  const memberName = member?.fullName || member?.email || '';

  return (
    <ConfirmDialog
      open={Boolean(member)}
      onOpenChange={onOpenChange}
      title={t('engagement.team.removeTitle')}
      description={t('engagement.team.removeDescription').replace('{name}', memberName)}
      confirmLabel={t('engagement.team.removeMember')}
      cancelLabel={t('engagement.team.cancel')}
      destructive
      loading={loading}
      icon={<Trash2 className="size-5" aria-hidden />}
      onConfirm={onConfirm}
    />
  );
}
