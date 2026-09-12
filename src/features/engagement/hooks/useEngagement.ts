import { useCallback, useEffect, useState } from 'react';
import { getApiStatusCode } from '@/shared/api/apiError';
import { engagementService } from '../services/engagement.service';
import type { Organization, OrganizationUpdateInput, TeamInviteInput, TeamMember, TeamRole } from '../types/engagement.types';

export function useEmployerTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setErrorKey(null);
    try {
      setTeam(await engagementService.listTeam());
    } catch {
      setErrorKey('engagement.team.error.load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invite = useCallback(async (input: TeamInviteInput) => {
    setIsMutating(true);
    setErrorKey(null);
    try {
      const member = await engagementService.inviteTeamMember(input);
      setTeam((current) => [member, ...current.filter((item) => item.userId !== member.userId)]);
    } catch (error) {
      setErrorKey(
        getApiStatusCode(error) === 409
          ? 'engagement.team.error.emailExists'
          : getApiStatusCode(error) === 403
            ? 'engagement.team.error.forbidden'
            : 'engagement.team.error.invite',
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateRole = useCallback(async (userId: string, orgRole: TeamRole) => {
    setIsMutating(true);
    setErrorKey(null);
    try {
      const member = await engagementService.updateTeamMemberRole(userId, { orgRole });
      setTeam((current) => current.map((item) => (item.userId === userId ? member : item)));
    } catch (error) {
      const status = getApiStatusCode(error);
      setErrorKey(
        status === 400
          ? 'engagement.team.error.invalidRole'
          : status === 403
            ? 'engagement.team.error.forbidden'
            : status === 404
              ? 'engagement.team.error.notFound'
              : status === 409
                ? 'engagement.team.error.lastAdmin'
                : 'engagement.team.error.update',
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const removeMember = useCallback(async (userId: string) => {
    setIsMutating(true);
    setErrorKey(null);
    try {
      await engagementService.removeTeamMember(userId);
      setTeam((current) => current.filter((item) => item.userId !== userId));
    } catch (error) {
      const status = getApiStatusCode(error);
      setErrorKey(
        status === 400
          ? 'engagement.team.error.selfRemove'
          : status === 403
            ? 'engagement.team.error.forbidden'
            : status === 404
              ? 'engagement.team.error.notFound'
              : status === 409
                ? 'engagement.team.error.lastAdminRemove'
                : 'engagement.team.error.remove',
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { team, isLoading, isMutating, errorKey, invite, updateRole, removeMember, reload };
}

export function useOrganization(enabled: boolean) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setErrorKey(null);
    try {
      setOrganization(await engagementService.getOrganization());
    } catch (error) {
      const status = getApiStatusCode(error);
      setErrorKey(
        status === 403
          ? 'engagement.organization.error.noContext'
          : status === 404
            ? 'engagement.organization.error.notFound'
            : 'engagement.organization.error.load',
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const save = useCallback(async (input: OrganizationUpdateInput) => {
    setIsSaving(true);
    setErrorKey(null);
    try {
      setOrganization(await engagementService.updateOrganization(input));
    } catch (error) {
      const status = getApiStatusCode(error);
      setErrorKey(
        status === 403
          ? 'engagement.organization.error.forbidden'
          : status === 404
            ? 'engagement.organization.error.notFound'
            : 'engagement.organization.error.update',
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { organization, isLoading, isSaving, errorKey, save, reload };
}
