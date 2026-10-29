import { useQuery } from '@tanstack/react-query'
import { getActivities } from '../api/activity.api.js'
import { queryKeys } from './queryKeys.js'

export function useActivities() {
  return useQuery({ queryKey: queryKeys.activities, queryFn: getActivities })
}