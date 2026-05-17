import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import * as api from '@/lib/api/tallup'
import type { HydrationLogInsert } from '@/lib/types'

const queryKey = ['hydration'] as const

export function useHydration() {
  const user = useUser()

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: () => api.fetchHydrationLog(user!.id),
    enabled: !!user,
    placeholderData: null,
  })
}

export function useLogHydration() {
  const qc = useQueryClient()
  const user = useUser()

  return useMutation({
    mutationFn: (log: HydrationLogInsert) => api.upsertHydrationLog(user!.id, log),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...queryKey, user?.id] }),
  })
}
