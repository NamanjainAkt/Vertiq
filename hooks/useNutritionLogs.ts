import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { NutritionLogInsert } from '@/lib/types'

const queryKey = ['nutritionLogs'] as const

export function useNutritionLogs() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchNutritionLogs(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useTodayNutrition() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, 'today', user?.id],
    queryFn: () => api.fetchTodayNutrition(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useLogNutrition() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (log: NutritionLogInsert) => api.insertNutritionLog(log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...queryKey, user?.id] })
      qc.invalidateQueries({ queryKey: ['streaks', user?.id] })
    },
  })
}
