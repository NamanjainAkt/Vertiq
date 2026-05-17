import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { HeightLogInsert } from '@/lib/types'

const queryKey = ['heightLogs'] as const

export function useHeightLogs() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchHeightLogs(user!.id),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useHeightLogsRange(days: number) {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, 'range', user?.id, days],
    queryFn: () => api.fetchHeightLogsRange(user!.id, days),
    enabled: !!user,
    placeholderData: [],
  })
}

export function useLatestHeight() {
  const logs = useHeightLogs()
  const latest = logs.data?.[0] ?? null
  return { ...logs, data: latest }
}

export function useLogHeight() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (log: HeightLogInsert) => api.insertHeightLog(user!.id, log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...queryKey, user?.id] })
      qc.invalidateQueries({ queryKey: ['streaks', user?.id] })
    },
  })
}

export function useDeleteHeightLog() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (id: string) => api.deleteHeightLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}
