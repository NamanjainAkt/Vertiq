import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { SleepLogInsert } from '@/lib/types'

const queryKey = ['sleepLogs'] as const

export function useSleepLogs() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchSleepLogs(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useSleepLogsRange(days: number) {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, 'range', user?.id, days],
    queryFn: () => api.fetchSleepLogsRange(user!.id, days),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useLastSleep() {
  const logs = useSleepLogs()
  const last = logs.data?.[0] ?? null
  return { ...logs, data: last }
}

export function useLogSleep() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (log: SleepLogInsert) => api.insertSleepLog(user!.id, log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...queryKey, user?.id] })
      qc.invalidateQueries({ queryKey: ['streaks', user?.id] })
    },
  })
}

export function useUpdateSleepLog() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SleepLogInsert> }) =>
      api.updateSleepLog(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}

export function useDeleteSleepLog() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (id: string) => api.deleteSleepLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}
