import type { TranslationDictionary } from '../../../shared/languages';

export const practiceTranslations: TranslationDictionary = {
  vi: {
    'practice.title': 'Phỏng vấn giả lập',
    'practice.badge': 'Frontend Developer',
    'practice.recording': 'Đang ghi hình',
    'practice.exit': 'Thoát phỏng vấn',
    'practice.aiPanelTitle': 'Khung hình AI phỏng vấn',
    'practice.aiName': 'Sarah',
    'practice.aiRole': 'Người phỏng vấn kỹ thuật',
    'practice.liveConversation': 'Khu vực trò chuyện trực tiếp',
    'practice.autoScroll': 'Tự động cuộn',
    'practice.aiSampleMsg': 'Hãy cho tôi biết về kinh nghiệm của bạn với React.',
    'practice.userSampleMsg':
      'Tôi đã làm việc với React được 2 năm, tập trung vào hooks và quản lý state với Redux... và tối ưu hóa hiệu suất Next.js',
    'practice.you': 'Bạn',
    'practice.candidateCamera': 'Khung hình Ứng viên',
    'practice.candidateName': 'Jonathan Doe',
    'practice.infoCardTitle': 'Thẻ thông tin phỏng vấn',
    'practice.position': 'Vị trí:',
    'practice.difficulty': 'Độ khó:',
    'practice.intermediate': 'Trung bình',
    'practice.question': 'Câu hỏi:',
    'practice.timeLeftLabel': 'Thời gian còn lại',
    'practice.timeLeftVal': '~18 phút',
    'practice.viewQuestions': 'Xem danh sách câu hỏi',
    'practice.personalNotes': 'Ghi chú cá nhân',
    'practice.notesPlaceholder': 'Nhập ghi chú cá nhân của bạn...',
    'practice.save': 'Lưu',
    'practice.startRecording': 'Bắt đầu ghi hình',
    'practice.stopRecording': 'Dừng ghi hình',
    'practice.currentQuestionTime': 'Thời gian câu hỏi hiện tại',

    // Interview Result Page
    'practice.result.title': 'Kết quả Phỏng vấn',
    'practice.result.subtitle':
      'Tổng quan năng lực và phân tích khoảng cách sau khi hoàn thành Practice Interview.',
    'practice.result.backToPractice': 'Quay lại phỏng vấn',
    'practice.result.overallScore': 'Tổng điểm',
    'practice.result.completedAt': 'Hoàn thành lúc',
    'practice.result.summary': 'Tổng kết',
    'practice.result.strengths': 'Điểm mạnh',
    'practice.result.weaknesses': 'Cần cải thiện',
    'practice.result.loading': 'Đang tải kết quả...',
    'practice.result.error': 'Không thể tải kết quả phỏng vấn. Vui lòng thử lại sau.',
    'practice.result.errorTitle': 'Đã xảy ra lỗi',
    'practice.result.skillOverview': 'Tổng quan năng lực',
    'practice.result.skillOverviewDesc':
      'Biểu đồ radar so sánh mức hiện tại và mục tiêu cho từng kỹ năng.',
    'practice.result.gapAnalysis': 'Gap Analysis',
    'practice.result.gapAnalysisDesc':
      'Phân tích chi tiết khoảng cách giữa mức hiện tại và mục tiêu để ưu tiên cải thiện.',

    // Radar Chart
    'practice.radar.current': 'Hiện tại',
    'practice.radar.target': 'Mục tiêu',

    // Gap Analysis
    'practice.gap.current': 'Hiện tại',
    'practice.gap.target': 'Mục tiêu',
    'practice.gap.gap': 'Khoảng cách',
    'practice.gap.feedback': 'Gợi ý cải thiện',
    'practice.gap.actionPlan': 'Hành động tiếp theo',

    // Interview History
    'practice.history.subtitle': 'Lịch sử các cuộc phỏng vấn thực hành của bạn',
    'practice.history.date': 'Ngày',
    'practice.history.duration': 'Độ dài',
    'practice.history.score': 'Điểm',
    'practice.history.viewDetails': 'Xem chi tiết',
    'practice.history.emptyTitle': 'Chưa có lịch sử phỏng vấn',
    'practice.history.emptyDesc': 'Bắt đầu một cuộc phỏng vấn thực hành để xem ở đây',
    'practice.history.status.completed': 'Đã hoàn thành',
    'practice.history.status.inProgress': 'Đang thực hiện',
    'practice.history.status.pending': 'Chưa bắt đầu',
  },
  en: {
    'practice.title': 'Mock Interview',
    'practice.badge': 'Frontend Developer',
    'practice.recording': 'Recording',
    'practice.exit': 'Exit Interview',
    'practice.aiPanelTitle': 'AI Interviewer Video Panel',
    'practice.aiName': 'Sarah',
    'practice.aiRole': 'Technical Interviewer',
    'practice.liveConversation': 'Live Conversation Area',
    'practice.autoScroll': 'Auto-scroll effect',
    'practice.aiSampleMsg': 'Tell me about your experience with React.',
    'practice.userSampleMsg':
      'I have worked with React for 2 years, focusing on hooks and state management with Redux... and Next.js performance optimization',
    'practice.you': 'You',
    'practice.candidateCamera': 'Candidate Camera Panel',
    'practice.candidateName': 'Jonathan Doe',
    'practice.infoCardTitle': 'Interview Information Card',
    'practice.position': 'Position:',
    'practice.difficulty': 'Difficulty:',
    'practice.intermediate': 'Intermediate',
    'practice.question': 'Question:',
    'practice.timeLeftLabel': 'Time Left',
    'practice.timeLeftVal': '~18 min',
    'practice.viewQuestions': 'View question list',
    'practice.personalNotes': 'Personal Notes',
    'practice.notesPlaceholder': 'Enter your personal notes...',
    'practice.save': 'Save',
    'practice.startRecording': 'Start Recording',
    'practice.stopRecording': 'Stop Recording',
    'practice.currentQuestionTime': 'Current question time',

    // Interview Result Page
    'practice.result.title': 'Interview Result',
    'practice.result.subtitle':
      'Skill overview and gap analysis after completing the Practice Interview.',
    'practice.result.backToPractice': 'Back to practice',
    'practice.result.overallScore': 'Overall Score',
    'practice.result.completedAt': 'Completed at',
    'practice.result.summary': 'Summary',
    'practice.result.strengths': 'Strengths',
    'practice.result.weaknesses': 'Needs improvement',
    'practice.result.loading': 'Loading result...',
    'practice.result.error': 'Unable to load the interview result. Please try again later.',
    'practice.result.errorTitle': 'Something went wrong',
    'practice.result.skillOverview': 'Skill Overview',
    'practice.result.skillOverviewDesc':
      'Radar chart comparing current and target levels across key skills.',
    'practice.result.gapAnalysis': 'Gap Analysis',
    'practice.result.gapAnalysisDesc':
      'Detailed comparison between current and target levels to prioritize improvement.',

    // Radar Chart
    'practice.radar.current': 'Current',
    'practice.radar.target': 'Target',

    // Gap Analysis
    'practice.gap.current': 'Current',
    'practice.gap.target': 'Target',
    'practice.gap.gap': 'Gap',
    'practice.gap.feedback': 'Actionable feedback',
    'practice.gap.actionPlan': 'Next steps',

    // Interview History
    'practice.history.subtitle': 'Your practice interview history',
    'practice.history.date': 'Date',
    'practice.history.duration': 'Duration',
    'practice.history.score': 'Score',
    'practice.history.viewDetails': 'View details',
    'practice.history.emptyTitle': 'No interview history yet',
    'practice.history.emptyDesc': 'Start a practice interview to see it here',
    'practice.history.status.completed': 'Completed',
    'practice.history.status.inProgress': 'In Progress',
    'practice.history.status.pending': 'Pending',
  },
};