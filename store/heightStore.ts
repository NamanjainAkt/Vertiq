import { create } from 'zustand'
import type { HeightLog } from '@/lib/types'

interface HeightState {
  /** Optimistic local entries not yet confirmed by server */
  pendingEntries: HeightLog[]
  addPending: (entry: HeightLog) => void
  removePending: (id: string) => void
  clearPending: () => void
}

export const useHeightStore = create<HeightState>((set) => ({
  pendingEntries: [],
  addPending: (entry) =>
    set((s) => ({ pendingEntries: [entry, ...s.pendingEntries] })),
  removePending: (id) =>
    set((s) => ({ pendingEntries: s.pendingEntries.filter((e) => e.id !== id) })),
  clearPending: () => set({ pendingEntries: [] }),
}))
