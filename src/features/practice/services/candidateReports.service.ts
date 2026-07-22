import { fetchInterviewHistory } from './history.service';
import { learningPathService } from './learningPath.service';
import type { CandidateReportsHub } from '../types/candidateReports.types';

export async function fetchCandidateReportsHub(): Promise<CandidateReportsHub> {
  const [history, learningReports] = await Promise.all([
    fetchInterviewHistory({ pageSize: 50 }),
    learningPathService.listAllPracticeReports(),
  ]);

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
