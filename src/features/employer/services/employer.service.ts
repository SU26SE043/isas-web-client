import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_EMPLOYER_WORKSPACE } from '../mocks/employer.fixtures';
import type { CompanyProfileInput, EmployerWorkspace, VerificationInput } from '../types/employer.types';

let workspace: EmployerWorkspace = structuredClone(MOCK_EMPLOYER_WORKSPACE);

function calculateCompleteness(input: CompanyProfileInput): number {
  const values = Object.values(input);
  const completed = values.filter((value) => String(value).trim().length > 0).length;
  return Math.round((completed / values.length) * 100);
}

function addActivity(title: string, titleVi: string, description: string, descriptionVi: string) {
  workspace.activities = [
    {
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      type: 'verification',
      title,
      titleVi,
      description,
      descriptionVi,
      createdAt: new Date().toISOString(),
    },
    ...workspace.activities,
  ];
}

export const employerService = {
  async getWorkspace(): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    await mockDelay(250);
    return structuredClone(workspace);
  },

  async saveCompanyProfile(input: CompanyProfileInput): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    await mockDelay(450);
    workspace = {
      ...workspace,
      workspaceName: input.name,
      profile: {
        ...workspace.profile,
        ...input,
        completeness: calculateCompleteness(input),
        updatedAt: new Date().toISOString(),
      },
    };
    addActivity('Company profile updated', 'Da cap nhat ho so cong ty', 'Profile changes were saved.', 'Thay doi ho so da duoc luu.');
    return structuredClone(workspace);
  },

  async submitVerification(input: VerificationInput): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    if (!input.attested) {
      throw new Error('ATTESTATION_REQUIRED');
    }

    await mockDelay(650);
    workspace = {
      ...workspace,
      verification: {
        status: 'pending',
        documentType: input.documentType,
        registrationNumber: input.registrationNumber,
        issuingCountry: input.issuingCountry,
        documentName: input.documentName,
        submittedAt: new Date().toISOString(),
        reviewerNote: null,
      },
    };
    addActivity(
      'Verification submitted',
      'Da gui xac minh',
      'Company documents are waiting for review.',
      'Tai lieu cong ty dang cho duyet.',
    );
    return structuredClone(workspace);
  },
};
