export interface RadarData {
  subject: string;
  subjectVi: string;
  A: number; // Current Level (0-100)
  B: number; // Target Level (0-100)
  fullMark: number;
  rawScore?: number;
  maxScore?: number;
  /**
   * C = % của buổi ĐẦU TIÊN ("lúc bắt đầu"), để so với A ("gần đây").
   *
   * `null` = tiêu chí mới có ĐÚNG MỘT buổi ⇒ không có mốc xuất phát để so.
   * KHÔNG được quy về 0: vẽ mốc thiếu thành 0 làm người học trông như đang VƯỢT
   * chính mình ở đúng tiêu chí chưa hề có mốc — sai lệch nghiêng về phía KHEN,
   * tức kiểu sai không ai đi báo (tiền lệ F14).
   */
  C?: number | null;
  /** Tổng số buổi có chấm tiêu chí này. Các nan KHÔNG cùng cỡ mẫu ⇒ độ tin cậy khác nhau. */
  sessionCount?: number;
  /** Số buổi thực sự dùng để tính A (tối đa 3). */
  recentCount?: number;
}

export interface GapAnalysisItem {
  id: string;
  skillName: string;
  skillNameVi: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  feedback: string;
  feedbackVi: string;
  actionableSteps: string[];
  actionableStepsVi: string[];
}

export type AssessmentStatus = 'pending' | 'scoring' | 'scored' | 'failed';

export interface AssessmentStatusResponse {
  assessmentId: string;
  status: AssessmentStatus;
  resultId?: string;
}

export interface QuestionFeedback {
  id: string;
  questionIndex: number;
  question: string;
  questionVi: string;
  score: number;
  maxScore: number;
  summary: string;
  summaryVi: string;
  strengths: string[];
  strengthsVi: string[];
  improvements: string[];
  improvementsVi: string[];
  locked: boolean;
}

export interface InterviewResult {
  id: string;
  candidateId: string;
  interviewId?: string;
  overallScore: number;
  completedAt: string;
  summary: string;
  summaryVi: string;
  radarData: RadarData[];
  gapAnalysis: GapAnalysisItem[];
  strengths: string[];
  strengthsVi: string[];
  weaknesses: string[];
  weaknessesVi: string[];
  questionFeedback: QuestionFeedback[];
  certificateId?: string;
}

export interface CompareResultsResponse {
  left: InterviewResult;
  right: InterviewResult;
}