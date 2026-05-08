import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { Streak, StreakType } from '@/lib/types'

const queryKey = ['streaks'] as const

export function useStreaks() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchStreaks(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useStreak(type: StreakType) {
  const streaks = useStreaks()
  const streak = streaks.data?.find((s) => s.streak_type === type) ?? null
  return { ...streaks, data: streak }
}

export function useUpdateStreak() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: ({ streak_type, current_count, longest_count }: { streak_type: StreakType; current_count: number; longest_count: number }) =>
      api.upsertStreak(streak_type, current_count, longest_count),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}
