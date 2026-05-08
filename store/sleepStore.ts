import { create } from 'zustand'
import type { SleepLog } from '@/lib/types'

interface SleepState {
  pendingEntries: SleepLog[]
  addPending: (entry: SleepLog) => void
  removePending: (id: string) => void
  clearPending: () => void
}

export const useSleepStore = create<SleepState>((set) => ({
  pendingEntries: [],
  addPending: (entry) =>
    set((s) => ({ pendingEntries: [entry, ...s.pendingEntries] })),
  removePending: (id) =>
    set((s) => ({ pendingEntries: s.pendingEntries.filter((e) => e.id !== id) })),
  clearPending: () => set({ pendingEntries: [] }),
}))
