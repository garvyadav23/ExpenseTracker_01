import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExpense, deleteExpense, getAllExpenses, getGroupExpenses, updateExpense } from '../api/expense.api.js'
import { useToast } from './useToast.js'
import { queryKeys } from './queryKeys.js'

export function useGroupExpenses(groupId) {
  return useQuery({
    queryKey: queryKeys.groupExpenses(groupId),
    queryFn: () => getGroupExpenses(groupId),
    enabled: Boolean(groupId),
  })
}

export function useExpenses() {
  return useQuery({ queryKey: queryKeys.expenses, queryFn: getAllExpenses })
}

function invalidateExpenseData(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activities }),
  ])
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      toast.success('Expense added.')
      await invalidateExpenseData(queryClient)
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      toast.success('Expense deleted.')
      await invalidateExpenseData(queryClient)
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, input }) => updateExpense(id, input),
    onSuccess: async () => {
      toast.success('Expense updated.')
      await invalidateExpenseData(queryClient)
    },
    onError: (error) => toast.error(error.message),
  })
}