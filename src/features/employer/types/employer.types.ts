export type VerificationStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export interface CompanyProfile {
  id: string;
  name: string;
  legalName: string;
  emailDomain: string;
  website: string;
  industry: string;
  size: string;
  country: string;
  city: string;
  taxId: string;
  description: string;
  completeness: number;
  updatedAt: string;
}

export interface VerificationRecord {
  status: VerificationStatus;
  documentType: string;
  registrationNumber: string;
  issuingCountry: string;
  documentName: string;
  submittedAt: string | null;
  reviewerNote: string | null;
}

export interface EmployerActivity {
  id: string;
  type: 'profile' | 'verification' | 'workspace';
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  createdAt: string;
}

export interface EmployerWorkspace {
  tenantId: string;
  workspaceName: string;
  roleSeats: number;
  activeCampaigns: number;
  draftCampaigns: number;
  candidateCapacity: number;
  profile: CompanyProfile;
  verification: VerificationRecord;
  activities: EmployerActivity[];
}

export type CompanyProfileInput = Omit<CompanyProfile, 'id' | 'completeness' | 'updatedAt'>;

export interface VerificationInput {
  documentType: string;
  registrationNumber: string;
  issuingCountry: string;
  documentName: string;
  attested: boolean;
}
