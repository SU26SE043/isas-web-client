import type { EmployerWorkspace } from '../types/employer.types';

export const PUBLIC_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];

export const MOCK_EMPLOYER_WORKSPACE: EmployerWorkspace = {
  tenantId: 'tenant-novaworks',
  workspaceName: 'NovaWorks AI',
  roleSeats: 6,
  activeCampaigns: 0,
  draftCampaigns: 1,
  candidateCapacity: 120,
  profile: {
    id: 'company-novaworks',
    name: 'NovaWorks AI',
    legalName: 'NovaWorks Artificial Intelligence Joint Stock Company',
    emailDomain: 'novaworks.ai',
    website: 'https://novaworks.ai',
    industry: 'AI recruiting technology',
    size: '51-200',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    taxId: '0319988776',
    description: 'AI hiring platform team building assessment workflows for product and engineering roles.',
    completeness: 100,
    updatedAt: '2026-07-08T09:30:00.000Z',
  },
  verification: {
    status: 'draft',
    documentType: '',
    registrationNumber: '',
    issuingCountry: 'Vietnam',
    documentName: '',
    submittedAt: null,
    reviewerNote: null,
  },
  activities: [
    {
      id: 'act-profile',
      type: 'profile',
      title: 'Company profile created',
      titleVi: 'Da tao ho so cong ty',
      description: 'Workspace profile is ready for verification.',
      descriptionVi: 'Ho so workspace da san sang de xac minh.',
      createdAt: '2026-07-08T09:30:00.000Z',
    },
    {
      id: 'act-seat',
      type: 'workspace',
      title: 'Recruiter seat invited',
      titleVi: 'Da moi tai khoan tuyen dung',
      description: 'A recruiter seat was added to the workspace.',
      descriptionVi: 'Mot tai khoan tuyen dung da duoc them vao workspace.',
      createdAt: '2026-07-09T11:10:00.000Z',
    },
  ],
};
