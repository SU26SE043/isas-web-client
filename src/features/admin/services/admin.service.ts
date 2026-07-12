import { mockDelay, usesMockData } from '@/shared/mock';
import { ADMIN_PLATFORM_FIXTURE } from '../mocks/admin.fixtures';
import type { AdminAiConfig, AdminPlatformSnapshot, AdminResourceKey, AdminUser } from '../types/admin.types';

let snapshot: AdminPlatformSnapshot = structuredClone(ADMIN_PLATFORM_FIXTURE);

function ensureMock() {
  if (!usesMockData('enterprise')) {
    throw new Error('Admin APIs are not wired yet. Keep usesMockData("enterprise") true.');
  }
}

export const adminService = {
  async getSnapshot(): Promise<AdminPlatformSnapshot> {
    ensureMock();
    await mockDelay(220);
    return structuredClone(snapshot);
  },

  async suspendUser(userId: string): Promise<AdminUser[]> {
    ensureMock();
    await mockDelay(300);
    snapshot = {
      ...snapshot,
      users: snapshot.users.map((user) => (user.id === userId ? { ...user, status: 'suspended' } : user)),
    };
    return structuredClone(snapshot.users);
  },

  async approveResource(resource: AdminResourceKey, id: string) {
    ensureMock();
    await mockDelay(280);
    snapshot = {
      ...snapshot,
      resources: {
        ...snapshot.resources,
        [resource]: snapshot.resources[resource].map((row) => (row.id === id ? { ...row, status: 'approved' } : row)),
      },
    };
    return structuredClone(snapshot.resources[resource]);
  },

  async saveAiConfig(input: AdminAiConfig): Promise<AdminAiConfig> {
    ensureMock();
    await mockDelay(360);
    snapshot = { ...snapshot, aiConfig: { ...input, pendingDualSign: true } };
    return structuredClone(snapshot.aiConfig);
  },

  async scheduleMaintenance(title: string): Promise<AdminPlatformSnapshot> {
    ensureMock();
    await mockDelay(360);
    snapshot = {
      ...snapshot,
      maintenance: [
        {
          id: `mnt_${Date.now()}`,
          title: title.trim(),
          startsAt: '2026-07-20T17:00:00.000Z',
          endsAt: '2026-07-20T18:00:00.000Z',
          status: 'scheduled',
        },
        ...snapshot.maintenance,
      ],
    };
    return structuredClone(snapshot);
  },
};
