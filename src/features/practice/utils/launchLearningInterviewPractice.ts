import { learningPathService } from '../services/learningPath.service';

/** Starts shared B2C/B2B interview room flow for a Learning lesson practice. */
export async function launchLearningInterviewPractice(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
}): Promise<string> {
  const meta = await learningPathService.beginSharedInterviewPractice(input);
  return meta.sessionId;
}

export function learningInterviewPreparePath(sessionId: string) {
  return `/interview/${sessionId}/prepare`;
}
