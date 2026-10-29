import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFriend, getFriends } from '../api/friend.api.js'
import { useToast } from './useToast.js'
import { queryKeys } from './queryKeys.js'

export function useFriends() {
  return useQuery({ queryKey: queryKeys.friends, queryFn: getFriends })
}

export function useAddFriend() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: addFriend,
    onSuccess: async () => {
      toast.success('Friend added.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.friends }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balances }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}