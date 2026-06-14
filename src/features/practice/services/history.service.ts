import type { InterviewHistoryResponse } from '../types/history.types';

export const fetchInterviewHistory = async (): Promise<InterviewHistoryResponse> => {
  // Mock data for development
  const mockInterviews = [
    {
      id: 'interview-1',
      jobTitle: 'Frontend Developer',
      company: 'TechCorp',
      date: '2024-03-15T10:30:00Z',
      status: 'completed' as const,
      overallScore: 85,
      duration: 45,
    },
    {
      id: 'interview-2',
      jobTitle: 'Full Stack Engineer',
      company: 'StartupX',
      date: '2024-03-10T14:00:00Z',
      status: 'completed' as const,
      overallScore: 72,
      duration: 60,
    },
    {
      id: 'interview-3',
      jobTitle: 'React Developer',
      company: 'DigitalAgency',
      date: '2024-03-05T09:15:00Z',
      status: 'in-progress' as const,
      overallScore: 0,
      duration: 30,
    },
    {
      id: 'interview-4',
      jobTitle: 'UI/UX Engineer',
      company: 'DesignStudio',
      date: '2024-02-28T11:45:00Z',
      status: 'completed' as const,
      overallScore: 91,
      duration: 50,
    },
    {
      id: 'interview-5',
      jobTitle: 'JavaScript Developer',
      company: 'WebSolutions',
      date: '2024-02-20T16:30:00Z',
      status: 'pending' as const,
      overallScore: 0,
      duration: 40,
    },
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    interviews: mockInterviews,
    total: mockInterviews.length,
  };
};