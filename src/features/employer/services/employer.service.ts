import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_EMPLOYER_WORKSPACE } from '../mocks/employer.fixtures';
import type { CompanyProfileInput, EmployerWorkspace, VerificationInput } from '../types/employer.types';

const WORKSPACE_STORAGE_KEY = 'isas-mock-employer-workspace';

function loadWorkspace(): EmployerWorkspace {
  if (typeof sessionStorage === 'undefined') {
    return structuredClone(MOCK_EMPLOYER_WORKSPACE);
  }

  try {
    const raw = sessionStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as EmployerWorkspace;
    }
  } catch {
    sessionStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }

  return structuredClone(MOCK_EMPLOYER_WORKSPACE);
}

function persistWorkspace(next: EmployerWorkspace) {
  workspace = next;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(next));
  }
}

let workspace: EmployerWorkspace = loadWorkspace();

function calculateCompleteness(input: CompanyProfileInput): number {
  const values = Object.values(input);
  const completed = values.filter((value) => String(value).trim().length > 0).length;
  return Math.round((completed / values.length) * 100);
}

function withActivity(
  current: EmployerWorkspace,
  title: string,
  titleVi: string,
  description: string,
  descriptionVi: string,
  type: EmployerWorkspace['activities'][number]['type'] = 'verification',
): EmployerWorkspace {
  return {
    ...current,
    activities: [
      {
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        type,
        title,
        titleVi,
        description,
        descriptionVi,
        createdAt: new Date().toISOString(),
      },
      ...current.activities,
    ],
  };
}

export const employerService = {
  async getWorkspace(): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    await mockDelay(250);
    workspace = loadWorkspace();
    return structuredClone(workspace);
  },

  async saveCompanyProfile(input: CompanyProfileInput): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    await mockDelay(450);
    const updated = withActivity(
      {
        ...workspace,
        workspaceName: input.name,
        profile: {
          ...workspace.profile,
          ...input,
          completeness: calculateCompleteness(input),
          updatedAt: new Date().toISOString(),
        },
      },
      'Company profile updated',
      'Đã cập nhật hồ sơ công ty',
      'Profile changes were saved.',
      'Thay đổi hồ sơ đã được lưu.',
      'profile',
    );
    persistWorkspace(updated);
    return structuredClone(updated);
  },

  async submitVerification(input: VerificationInput): Promise<EmployerWorkspace> {
    if (!usesMockData('enterprise')) {
      throw new Error('Employer API is not wired yet. Keep usesMockData("enterprise") true.');
    }

    if (!input.attested) {
      throw new Error('ATTESTATION_REQUIRED');
    }

    const currentStatus = workspace.verification.status;
    if (currentStatus === 'pending' || currentStatus === 'verified') {
      throw new Error('VERIFICATION_LOCKED');
    }

    await mockDelay(650);
    const updated = withActivity(
      {
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
      },
      'Verification submitted',
      'Đã gửi xác minh',
      'Company documents are waiting for review.',
      'Tài liệu công ty đang chờ duyệt.',
      'verification',
    );
    persistWorkspace(updated);
    return structuredClone(updated);
  },
};
