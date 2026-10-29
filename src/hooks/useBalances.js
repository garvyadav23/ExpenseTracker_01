import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSettlement, getBalances, getGroupBalances } from '../api/balance.api.js'
import { useToast } from './useToast.js'
import { queryKeys } from './queryKeys.js'

export function useBalances() {
  return useQuery({ queryKey: queryKeys.balances, queryFn: getBalances })
}

export function useGroupBalances(groupId) {
  return useQuery({
    queryKey: queryKeys.groupBalances(groupId),
    queryFn: () => getGroupBalances(groupId),
    enabled: Boolean(groupId),
  })
}

export function useCreateSettlement() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: createSettlement,
    onSuccess: async () => {
      toast.success('Settlement recorded.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.balances }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activities }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}