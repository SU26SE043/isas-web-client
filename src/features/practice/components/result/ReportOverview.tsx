import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { FocusEventsSection } from './FocusEventsSection';
import { SessionSummaryCard } from './SessionSummaryCard';

/** Overview tab content for the live practice report. */
export function ReportOverview({ view }: { view: PracticeSessionResultViewModel }) {
  return (
    <div className="space-y-6">
      <SessionSummaryCard view={view} />
      <FocusEventsSection view={view} />
    </div>
  );
}
