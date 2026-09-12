import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionHistoryItem } from '../../types/history.types';
import { getPracticeHistoryStatusGroup } from '../../utils/practiceSessionHistoryActions';

interface PracticeHistoryRowActionsProps {
  item: PracticeSessionHistoryItem;
  onViewResult: (id: string) => void;
  onResume: (id: string) => void;
}

export function PracticeHistoryRowActions({
  item,
  onViewResult,
  onResume,
}: PracticeHistoryRowActionsProps) {
  const { t } = useLanguage();
  const group = getPracticeHistoryStatusGroup(item.status);

  if (group === 'completed') {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={t('practice.history.actions.viewResultFor').replace(
          '{{name}}',
          item.jobCategory || item.id,
        )}
        onClick={() => onViewResult(item.id)}
      >
        {t('practice.history.actions.viewResult')}
      </Button>
    );
  }

  if (group === 'inProgress') {
    return (
      <Button type="button" size="sm" onClick={() => onResume(item.id)}>
        {t('practice.history.actions.resume')}
      </Button>
    );
  }

  if (group === 'pendingScore') {
    return (
      <Button type="button" size="sm" variant="outline" disabled>
        {t('practice.history.actions.processing')}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => onViewResult(item.id)}
    >
      {t('practice.history.actions.viewDetails')}
    </Button>
  );
}
