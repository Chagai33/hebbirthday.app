import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../services/group.service';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { Group, GroupType } from '../types';

export const useGroups = () => {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['groups', currentTenant?.id],
    queryFn: () => {
      if (!currentTenant) return Promise.resolve([]);
      return groupService.getTenantGroups(currentTenant.id);
    },
    enabled: !!currentTenant,
  });
};

export const useRootGroups = () => {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['rootGroups', currentTenant?.id],
    queryFn: () => {
      if (!currentTenant) return Promise.resolve([]);
      return groupService.getRootGroups(currentTenant.id);
    },
    enabled: !!currentTenant,
  });
};

export const useChildGroups = (parentId: string | null) => {
  return useQuery({
    queryKey: ['childGroups', parentId],
    queryFn: () => {
      if (!parentId) return Promise.resolve([]);
      return groupService.getChildGroups(parentId);
    },
    enabled: !!parentId,
  });
};

export const useGroupsByType = (type: GroupType | null) => {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['groupsByType', currentTenant?.id, type],
    queryFn: () => {
      if (!currentTenant || !type) return Promise.resolve([]);
      return groupService.getGroupsByType(currentTenant.id, type);
    },
    enabled: !!currentTenant && !!type,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      parentId,
      color,
      calendarPreference,
      is_guest_portal_enabled,
    }: {
      name: string;
      parentId?: string | null;
      color?: string;
      calendarPreference?: 'gregorian' | 'hebrew' | 'both';
      is_guest_portal_enabled?: boolean;
    }) => {
      if (!currentTenant || !user) {
        throw new Error('No tenant or user found');
      }
      return groupService.createGroup(
        currentTenant.id,
        { name, parentId, color, calendarPreference, is_guest_portal_enabled },
        user.id
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['childGroups'] });
      queryClient.invalidateQueries({ queryKey: ['rootGroups'] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();

  return useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: {
      groupId: string;
      data: { name?: string; color?: string; calendarPreference?: 'gregorian' | 'hebrew' | 'both'; is_guest_portal_enabled?: boolean };
    }) => {
      return groupService.updateGroup(groupId, data);
    },
    onMutate: async ({ groupId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['groups'] });
      await queryClient.cancelQueries({ queryKey: ['childGroups'] });
      await queryClient.cancelQueries({ queryKey: ['rootGroups'] });

      // Snapshot the previous value
      const previousGroups = queryClient.getQueryData<Group[]>(['groups', currentTenant?.id]);

      // Optimistically update to the new value
      if (previousGroups) {
        queryClient.setQueryData<Group[]>(['groups', currentTenant?.id], (old) => {
          if (!old) return [];
          return old.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                ...data,
                // Handle specific fields mapping if needed
                calendar_preference: data.calendarPreference !== undefined ? data.calendarPreference : group.calendar_preference,
                is_guest_portal_enabled: data.is_guest_portal_enabled !== undefined ? data.is_guest_portal_enabled : group.is_guest_portal_enabled,
              };
            }
            return group;
          });
        });
      }

      // Return a context object with the snapshotted value
      return { previousGroups };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGroups) {
        queryClient.setQueryData(['groups', currentTenant?.id], context.previousGroups);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['childGroups'] });
      queryClient.invalidateQueries({ queryKey: ['rootGroups'] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, tenantId, deleteBirthdays }: { groupId: string; tenantId: string; deleteBirthdays: boolean }) =>
      groupService.deleteGroup(groupId, tenantId, deleteBirthdays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['childGroups'] });
      queryClient.invalidateQueries({ queryKey: ['birthdays'] });
      queryClient.invalidateQueries({ queryKey: ['rootGroups'] });
    },
  });
};

export const useGroupBirthdaysCount = (groupId: string | null, tenantId: string | null) => {
  return useQuery({
    queryKey: ['groupBirthdaysCount', groupId, tenantId],
    queryFn: () => {
      if (!groupId || !tenantId) return Promise.resolve(0);
      return groupService.getGroupBirthdaysCount(groupId, tenantId);
    },
    enabled: !!groupId && !!tenantId,
  });
};

export const useInitializeRootGroups = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (language: 'he' | 'en' | 'es' = 'he') => {
      if (!currentTenant || !user) {
        throw new Error('No tenant or user found');
      }
      return groupService.initializeRootGroups(currentTenant.id, user.id, language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['rootGroups'] });
    },
  });
};
