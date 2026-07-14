export interface CvSkill {
  name: string;
  highlight?: boolean;
}

export interface CvProject {
  title: string;
  description: string;
  techStack: string;
}

export interface CvExperience {
  period: string;
  title: string;
  company: string;
  description: string;
  highlight?: boolean;
}

export interface CvEducation {
  degree: string;
  school: string;
  period: string;
}

export interface CvAnalysisResult {
  id: string;
  fullName: string;
  jobTitle: string;
  profileCompletionPercent: number;
  matchScore: number;
  skills: CvSkill[];
  projects: CvProject[];
  experiences: CvExperience[];
  education: CvEducation;
}

export interface SubmitCvAnalysisInput {
  file: File;
  jobDescription?: string;
  language: 'vi' | 'en';
}

export interface UploadedCvFile {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  /** Direct URL to the original PDF (open in new tab from Profile). */
  pdfUrl: string;
  /** Present when the file was produced via CV Analysis flow. */
  analysisId?: string;
}
