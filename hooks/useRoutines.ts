import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { RoutineLogInsert, RoutineTemplate, RoutineExercise } from '@/lib/types'

const queryKey = ['routineLogs'] as const

export function useRoutineLogs() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchRoutineLogs(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useTodayRoutine() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, 'today', user?.id],
    queryFn: () => api.fetchTodayRoutine(user!.id),
    enabled: !!user,
    placeholderData: null,
  })
}

export function useCompleteRoutine() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (log: RoutineLogInsert) => api.upsertRoutineLog(log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...queryKey, user?.id] })
      qc.invalidateQueries({ queryKey: ['streaks', user?.id] })
    },
  })
}

// ── Static routine templates (no backend) ──────────────────────────────────

const EXERCISE_TEMPLATES: RoutineExercise[] = [
  { id: 'e1', name: 'Neck Stretch', category: 'stretch', detail: '3 sets · 30 sec', icon: 'accessibility-outline', sets: 3, reps: '30 sec' },
  { id: 'e2', name: 'Cat-Cow Stretch', category: 'spine', detail: '3 sets · 12 reps', icon: 'pulse-outline', sets: 3, reps: '12 reps' },
  { id: 'e3', name: 'Standing Toe Touch', category: 'stretch', detail: '4 sets · 15 reps', icon: 'accessibility-outline', sets: 4, reps: '15 reps' },
  { id: 'e4', name: 'Wall Posture Fix', category: 'posture', detail: '3 sets · 45 sec', icon: 'body-outline', sets: 3, reps: '45 sec' },
  { id: 'e5', name: 'Spine Twist', category: 'spine', detail: '3 sets · 10 reps', icon: 'pulse-outline', sets: 3, reps: '10 reps' },
  { id: 'e6', name: 'Hamstring Stretch', category: 'stretch', detail: '3 sets · 30 sec', icon: 'accessibility-outline', sets: 3, reps: '30 sec' },
]

export const DEFAULT_ROUTINE: RoutineTemplate = {
  id: 'default',
  name: 'Full Body Stretch',
  difficulty: 'Beginner',
  duration: '22 min',
  calories: '145 kcal',
  target: 'Full Body',
  exercises: EXERCISE_TEMPLATES,
}

export function useRoutineExercises(): RoutineExercise[] {
  return EXERCISE_TEMPLATES
}
