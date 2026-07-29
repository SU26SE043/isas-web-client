import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { SessionSummaryCard } from './SessionSummaryCard';

/** Overview tab content for the live practice report. */
export function ReportOverview({ view }: { view: PracticeSessionResultViewModel }) {
  return <SessionSummaryCard view={view} />;
}
