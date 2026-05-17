import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'

const queryKey = ['achievements'] as const

export function useAchievements() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchAchievements(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useUnlockAchievement() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (achievement_key: string) => api.insertAchievement(user!.id, achievement_key),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}

// Predefined achievement keys
export const ACHIEVEMENT_KEYS = {
  FIRST_CM: 'first_cm',
  FIRST_WEEK: 'first_week',
  THIRTY_DAYS: 'thirty_days',
  SLEEP_90: 'sleep_90',
  WORKOUT_PRO: 'workout_pro',
  SLEEP_WEEK: 'sleep_week',
  HYDRATION: 'hydration',
  ROUTINE_ACE: 'routine_ace',
} as const

export const ACHIEVEMENT_INFO: Record<string, { label: string; icon: string; description: string }> = {
  [ACHIEVEMENT_KEYS.FIRST_CM]: { label: 'First cm', icon: 'flame', description: 'Log your first height measurement' },
  [ACHIEVEMENT_KEYS.FIRST_WEEK]: { label: 'Power Week', icon: 'flash', description: 'Log height for 7 consecutive days' },
  [ACHIEVEMENT_KEYS.THIRTY_DAYS]: { label: '30-Day Streak', icon: 'trophy', description: 'Maintain a 30-day logging streak' },
  [ACHIEVEMENT_KEYS.SLEEP_90]: { label: 'Sleep 90+', icon: 'medal', description: 'Achieve a sleep quality score of 90 or higher' },
  [ACHIEVEMENT_KEYS.WORKOUT_PRO]: { label: 'Workout Pro', icon: 'barbell', description: 'Complete 10 routines' },
  [ACHIEVEMENT_KEYS.SLEEP_WEEK]: { label: 'Sleep Week', icon: 'moon', description: 'Log sleep for 7 consecutive days' },
  [ACHIEVEMENT_KEYS.HYDRATION]: { label: 'Hydration', icon: 'water', description: 'Meet water goal for 7 days' },
  [ACHIEVEMENT_KEYS.ROUTINE_ACE]: { label: 'Routine Ace', icon: 'leaf', description: 'Complete all exercises in a routine' },
}