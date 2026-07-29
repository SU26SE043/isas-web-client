import { Button } from '@/components/ui/button';

interface ProfileSectionRowActionsProps {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProfileSectionRowActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: ProfileSectionRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        {editLabel}
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
        {deleteLabel}
      </Button>
    </div>
  );
}
