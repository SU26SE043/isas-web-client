import { fetchInterviewHistory } from './history.service';
import { learningPathService } from './learningPath.service';
import type { CandidateReportsHub } from '../types/candidateReports.types';

const EMPTY_HUB: CandidateReportsHub = { interview: [], learning: [], cv: [] };

export async function fetchCandidateReportsHub(): Promise<CandidateReportsHub> {
  const [historyResult, learningResult] = await Promise.allSettled([
    fetchInterviewHistory({ pageSize: 50 }),
    learningPathService.listAllPracticeReports(),
  ]);

  if (historyResult.status === 'rejected' && learningResult.status === 'rejected') {
    return EMPTY_HUB;
  }

  const history =
    historyResult.status === 'fulfilled'
      ? historyResult.value
      : { interviews: [], total: 0, page: 1, pageSize: 50 };

  const learningReports = learningResult.status === 'fulfilled' ? learningResult.value : [];

  const interview = history.interviews
    .filter((item) => item.status === 'completed')
    .map((item) => ({
      id: item.id,
      category: 'interview' as const,
      title: item.jobTitle,
      titleVi: item.jobTitle,
      subtitle: item.company,
      subtitleVi: item.company,
      href: `/candidate/practice/history/${item.id}`,
      createdAt: item.date,
      score: item.overallScore,
    }));

  const learning = learningReports.map((report) => ({
    id: report.id,
    category: 'learning' as const,
    title: report.lessonTitle,
    titleVi: report.lessonTitleVi,
    subtitle: report.roadmapName,
    subtitleVi: report.roadmapNameVi,
    href: `/candidate/learning/roadmaps/${report.roadmapId}/lessons/${report.lessonId}/report?reportId=${report.id}`,
    createdAt: report.createdAt,
    score: report.overallScore,
  }));

  return { interview, learning, cv: [] };
}
