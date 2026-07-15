export enum CampaignStatus {
  Draft = 'Draft',
  Active = 'Active',
  Closed = 'Closed',
  Archived = 'Archived',
}

export enum QuestionSource {
  AiGenerated = 'AiGenerated',
  CustomHr = 'CustomHr',
}

export enum CriterionSource {
  AiSuggested = 'AiSuggested',
  HrEdited = 'HrEdited',
}

export enum CandidateStatus {
  Pending = 'Pending',
  Filtered = 'Filtered',
  Rejected = 'Rejected',
  Analyzing = 'Analyzing',
  Analyzed = 'Analyzed',
  AnalysisFailed = 'AnalysisFailed',
  Invited = 'Invited',
  Joined = 'Joined',
}

export enum InterviewStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

export enum SessionStatus {
  GeneratingQuestions = 'GeneratingQuestions',
  Ready = 'Ready',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Scoring = 'Scoring',
  Scored = 'Scored',
  Failed = 'Failed',
  SessionAbandoned = 'SessionAbandoned',
}

export enum AnswerStatus {
  Uploaded = 'Uploaded',
  Transcribing = 'Transcribing',
  Transcribed = 'Transcribed',
  Scoring = 'Scoring',
  Scored = 'Scored',
  Skipped = 'Skipped',
  Failed = 'Failed',
}

export enum JobCategory {
  BA = 'BA',
  BE = 'BE',
  FE = 'FE',
}

export enum RoadmapLevel {
  Fresher = 'Fresher',
  Junior = 'Junior',
  Middle = 'Middle',
  Senior = 'Senior',
}

export enum LessonStatus {
  Theory = 'Theory',
  Practicing = 'Practicing',
  Done = 'Done',
}

export enum RoadmapStatus {
  Active = 'Active',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
}

export enum MilestoneStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
}
