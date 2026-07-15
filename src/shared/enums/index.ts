/**
 * Shared Interview System status and domain constants.
 * Uses `as const` (not `enum`) because `erasableSyntaxOnly` is enabled in tsconfig.
 */

export const CampaignStatus = {
  Draft: 'Draft',
  Active: 'Active',
  Closed: 'Closed',
  Archived: 'Archived',
} as const;
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const QuestionSource = {
  AiGenerated: 'AiGenerated',
  CustomHr: 'CustomHr',
} as const;
export type QuestionSource = (typeof QuestionSource)[keyof typeof QuestionSource];

export const CriterionSource = {
  AiSuggested: 'AiSuggested',
  HrEdited: 'HrEdited',
} as const;
export type CriterionSource = (typeof CriterionSource)[keyof typeof CriterionSource];

export const CandidateStatus = {
  Pending: 'Pending',
  Filtered: 'Filtered',
  Rejected: 'Rejected',
  Analyzing: 'Analyzing',
  Analyzed: 'Analyzed',
  AnalysisFailed: 'AnalysisFailed',
  Invited: 'Invited',
  Joined: 'Joined',
} as const;
export type CandidateStatus = (typeof CandidateStatus)[keyof typeof CandidateStatus];

export const InterviewStatus = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Completed: 'Completed',
} as const;
export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

export const SessionStatus = {
  GeneratingQuestions: 'GeneratingQuestions',
  Ready: 'Ready',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Scoring: 'Scoring',
  Scored: 'Scored',
  Failed: 'Failed',
  SessionAbandoned: 'SessionAbandoned',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const AnswerStatus = {
  Uploaded: 'Uploaded',
  Transcribing: 'Transcribing',
  Transcribed: 'Transcribed',
  Scoring: 'Scoring',
  Scored: 'Scored',
  Skipped: 'Skipped',
  Failed: 'Failed',
} as const;
export type AnswerStatus = (typeof AnswerStatus)[keyof typeof AnswerStatus];

export const JobCategory = {
  BA: 'BA',
  BE: 'BE',
  FE: 'FE',
} as const;
export type JobCategory = (typeof JobCategory)[keyof typeof JobCategory];

export const RoadmapLevel = {
  Fresher: 'Fresher',
  Junior: 'Junior',
  Middle: 'Middle',
  Senior: 'Senior',
} as const;
export type RoadmapLevel = (typeof RoadmapLevel)[keyof typeof RoadmapLevel];

export const LessonStatus = {
  Theory: 'Theory',
  Practicing: 'Practicing',
  Done: 'Done',
} as const;
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

export const RoadmapStatus = {
  Active: 'Active',
  Completed: 'Completed',
  Abandoned: 'Abandoned',
} as const;
export type RoadmapStatus = (typeof RoadmapStatus)[keyof typeof RoadmapStatus];

export const MilestoneStatus = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Completed: 'Completed',
} as const;
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus];