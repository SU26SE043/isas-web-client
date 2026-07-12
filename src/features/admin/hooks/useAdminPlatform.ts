import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import type { AdminAiConfig, AdminPlatformSnapshot, AdminResourceKey } from '../types/admin.types';

export function useAdminPlatform() {
  const [snapshot, setSnapshot] = useState<AdminPlatformSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setSnapshot(await adminService.getSnapshot());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const suspendUser = useCallback(async (userId: string) => {
    const users = await adminService.suspendUser(userId);
    setSnapshot((current) => (current ? { ...current, users } : current));
  }, []);

  const approveResource = useCallback(async (resource: AdminResourceKey, id: string) => {
    const rows = await adminService.approveResource(resource, id);
    setSnapshot((current) => (current ? { ...current, resources: { ...current.resources, [resource]: rows } } : current));
  }, []);

  const saveAiConfig = useCallback(async (input: AdminAiConfig) => {
    const aiConfig = await adminService.saveAiConfig(input);
    setSnapshot((current) => (current ? { ...current, aiConfig } : current));
  }, []);

  const scheduleMaintenance = useCallback(async (title: string) => {
    setSnapshot(await adminService.scheduleMaintenance(title));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { snapshot, isLoading, reload, suspendUser, approveResource, saveAiConfig, scheduleMaintenance };
}
