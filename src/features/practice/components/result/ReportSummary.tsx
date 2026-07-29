import { PracticeOverallFeedback } from './PracticeOverallFeedback';

interface ReportSummaryProps {
  overallFeedback?: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  cvVsAnswerSummary?: string;
}

/** Summary / overall AI feedback tab content. */
export function ReportSummary(props: ReportSummaryProps) {
  return <PracticeOverallFeedback {...props} />;
}
