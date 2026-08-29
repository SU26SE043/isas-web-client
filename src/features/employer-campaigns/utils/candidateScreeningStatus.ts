const STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: 'employer.campaigns.screening.status.Pending',
  Filtered: 'employer.campaigns.screening.status.Filtered',
  Rejected: 'employer.campaigns.screening.status.Rejected',
  Analyzing: 'employer.campaigns.screening.status.Analyzing',
  Analyzed: 'employer.campaigns.screening.status.Analyzed',
  AnalysisFailed: 'employer.campaigns.screening.status.AnalysisFailed',
  Invited: 'employer.campaigns.screening.status.Invited',
};

export function candidateScreeningStatusLabelKey(status: string): string {
  return STATUS_LABEL_KEYS[status] ?? status;
}
