import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPaymentService } from '../services/adminPayment.service';
import type { CreatePackageInput, PlanInput, UpdatePackageInput } from '../types/adminApi.types';
import { adminPlansKey } from './useAdminGrants';

export const adminPackagesKey = (includeInactive: boolean) => ['admin-packages', includeInactive] as const;

/** Tất cả plan (BE trả cả ngừng bán — bảng hiện badge), sort audience rồi rank như BE. */
export function useAdminPlanList() {
  return useQuery({ queryKey: adminPlansKey(), queryFn: () => adminPaymentService.listPlans(), retry: 1 });
}

export function useAdminPackageList(includeInactive: boolean) {
  return useQuery({ queryKey: adminPackagesKey(includeInactive), queryFn: () => adminPaymentService.listPackages({ includeInactive }), placeholderData: (previous) => previous, retry: 1 });
}

export function useAdminPlanActions() {
  const queryClient = useQueryClient();
  const refreshPlans = () => queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
  const refreshPackages = () => queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
  const createPlan = useMutation({ mutationFn: (input: PlanInput) => adminPaymentService.createPlan(input), onSuccess: () => void refreshPlans() });
  const updatePlan = useMutation({ mutationFn: ({ id, input }: { id: string; input: PlanInput }) => adminPaymentService.updatePlan(id, input), onSuccess: () => void refreshPlans() });
  const deactivatePlan = useMutation({ mutationFn: (id: string) => adminPaymentService.deletePlan(id), onSuccess: () => void refreshPlans() });
  const createPackage = useMutation({ mutationFn: (input: CreatePackageInput) => adminPaymentService.createPackage(input), onSuccess: () => void refreshPackages() });
  const updatePackage = useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdatePackageInput }) => adminPaymentService.updatePackage(id, input), onSuccess: () => void refreshPackages() });
  /** Ẩn = DELETE (soft-delete phía BE); Bán lại = PUT { isActive: true } (cần BE-D1 để còn thấy gói ẩn trong list). */
  const hidePackage = useMutation({ mutationFn: (id: string) => adminPaymentService.deletePackage(id), onSuccess: () => void refreshPackages() });
  const restorePackage = useMutation({ mutationFn: (id: string) => adminPaymentService.updatePackage(id, { isActive: true }), onSuccess: () => void refreshPackages() });
  return { createPlan, updatePlan, deactivatePlan, createPackage, updatePackage, hidePackage, restorePackage };
}
