import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGroup, getGroup, getGroups } from '../api/group.api.js'
import { useToast } from './useToast.js'
import { queryKeys } from './queryKeys.js'

export function useGroups() {
  return useQuery({ queryKey: queryKeys.groups, queryFn: getGroups })
}

export function useGroup(id) {
  return useQuery({
    queryKey: queryKeys.group(id),
    queryFn: () => getGroup(id),
    enabled: Boolean(id),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      toast.success('Group created.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.groups }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activities }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}