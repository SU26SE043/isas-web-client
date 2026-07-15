import { fetchInterviewHistory } from './history.service';
import { learningPathService } from './learningPath.service';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { CandidateReportsHub } from '../types/candidateReports.types';

export async function fetchCandidateReportsHub(): Promise<CandidateReportsHub> {
  const [history, learningReports, cvs] = await Promise.all([
    fetchInterviewHistory({ pageSize: 50 }),
    learningPathService.listAllPracticeReports(),
    cvAnalysisService.listUploadedCvs(),
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

  const withAnalysis = cvs.filter((file) => Boolean(file.analysisId));
  const cv = withAnalysis.map((file) => ({
    id: file.id,
    category: 'cv' as const,
    title: file.fileName,
    titleVi: file.fileName,
    subtitle: undefined,
    subtitleVi: undefined,
    href: `/candidate/cv/analysis/report?analysisId=${encodeURIComponent(file.analysisId!)}`,
    createdAt: file.uploadedAt,
  }));

  return { interview, learning, cv };
}
